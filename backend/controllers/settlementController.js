const db = require('../config/db');

// Settle a debt
const createSettlement = async (req, res) => {
  const { group_id, paid_to, amount, note } = req.body;

  if (!group_id || !paid_to || !amount) {
    return res.status(400).json({ success: false, message: 'Group, recipient, and amount are required.' });
  }

  if (parseFloat(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Settlement amount must be positive.' });
  }

  try {
    // Verify membership
    const [membership] = await db.execute(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [group_id, req.user.id]
    );
    if (membership.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const [result] = await db.execute(
      'INSERT INTO settlements (group_id, paid_by, paid_to, amount, note) VALUES (?, ?, ?, ?, ?)',
      [group_id, req.user.id, paid_to, parseFloat(amount), note || null]
    );

    // Notify recipient
    const [creditor] = await db.execute('SELECT name FROM users WHERE id = ?', [paid_to]);
    const [payer] = await db.execute('SELECT name FROM users WHERE id = ?', [req.user.id]);

    await db.execute(
      'INSERT INTO notifications (user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?)',
      [
        paid_to,
        'Settlement Received',
        `${payer[0].name} paid you ₹${parseFloat(amount).toFixed(2)}${note ? ` for "${note}"` : ''}`,
        'settlement',
        result.insertId
      ]
    );

    return res.status(201).json({
      success: true,
      message: `Settlement of ₹${parseFloat(amount).toFixed(2)} recorded! ✅`,
      settlementId: result.insertId
    });

  } catch (error) {
    console.error('Settlement error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get settlements for a group
const getGroupSettlements = async (req, res) => {
  const { group_id } = req.params;

  try {
    const [membership] = await db.execute(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [group_id, req.user.id]
    );
    if (membership.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const [settlements] = await db.execute(`
      SELECT s.*, 
        u1.name as paid_by_name, u1.avatar as paid_by_avatar,
        u2.name as paid_to_name, u2.avatar as paid_to_avatar
      FROM settlements s
      JOIN users u1 ON s.paid_by = u1.id
      JOIN users u2 ON s.paid_to = u2.id
      WHERE s.group_id = ?
      ORDER BY s.created_at DESC
    `, [group_id]);

    return res.json({ success: true, settlements });
  } catch (error) {
    console.error('Get settlements error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get fairness score for a group
const getFairnessScore = async (req, res) => {
  const { group_id } = req.params;

  try {
    const [membership] = await db.execute(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [group_id, req.user.id]
    );
    if (membership.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Get total expenses paid by each member
    const [expensePaid] = await db.execute(`
      SELECT e.paid_by as user_id, u.name, u.avatar,
        COUNT(*) as times_paid,
        SUM(e.amount) as total_paid
      FROM expenses e
      JOIN users u ON e.paid_by = u.id
      WHERE e.group_id = ?
      GROUP BY e.paid_by
    `, [group_id]);

    // Get total members and expenses
    const [totalData] = await db.execute(`
      SELECT 
        COUNT(DISTINCT gm.user_id) as member_count,
        COALESCE(SUM(e.amount), 0) as total_amount
      FROM group_members gm
      LEFT JOIN expenses e ON e.group_id = gm.group_id
      WHERE gm.group_id = ?
    `, [group_id]);

    const memberCount = totalData[0].member_count;
    const totalAmount = parseFloat(totalData[0].total_amount);
    
    if (totalAmount === 0 || memberCount === 0) {
      return res.json({ success: true, score: 100, breakdown: [] });
    }

    const fairShare = totalAmount / memberCount;
    
    let score = 100;
    const breakdown = expensePaid.map(member => {
      const deviation = Math.abs(parseFloat(member.total_paid) - fairShare);
      const deviationPercent = (deviation / fairShare) * 100;
      return {
        ...member,
        total_paid: parseFloat(member.total_paid),
        fair_share: fairShare,
        deviation_percent: deviationPercent.toFixed(1)
      };
    });

    // Calculate fairness score
    const avgDeviation = breakdown.reduce((sum, m) => sum + parseFloat(m.deviation_percent), 0) / Math.max(breakdown.length, 1);
    score = Math.max(0, Math.round(100 - avgDeviation));

    return res.json({ success: true, score, breakdown, totalAmount, fairShare });
  } catch (error) {
    console.error('Fairness score error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get notifications
const getNotifications = async (req, res) => {
  try {
    const [notifications] = await db.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );

    return res.json({ success: true, notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Mark notifications as read
const markNotificationsRead = async (req, res) => {
  try {
    await db.execute(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [req.user.id]
    );
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createSettlement, getGroupSettlements, getFairnessScore, getNotifications, markNotificationsRead };

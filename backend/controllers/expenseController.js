const db = require('../config/db');

// Add new expense
const addExpense = async (req, res) => {
  const { group_id, amount, title, note, category, split_type, paid_by, splits } = req.body;

  if (!group_id || !amount || !title) {
    return res.status(400).json({ success: false, message: 'Group, amount, and title are required.' });
  }

  if (parseFloat(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
  }

  try {
    // Verify membership
    const [membership] = await db.execute(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [group_id, req.user.id]
    );

    if (membership.length === 0) {
      return res.status(403).json({ success: false, message: 'You are not a member of this group.' });
    }

    const paidBy = paid_by || req.user.id;
    const receiptUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Insert expense
    const [result] = await db.execute(
      'INSERT INTO expenses (group_id, paid_by, amount, title, note, category, split_type, receipt_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [group_id, paidBy, parseFloat(amount), title, note || null, category || 'Other', split_type || 'equal', receiptUrl]
    );

    const expenseId = result.insertId;

    // Calculate splits
    if (split_type === 'equal' || !splits) {
      // Get all group members
      const [members] = await db.execute(
        'SELECT user_id FROM group_members WHERE group_id = ?',
        [group_id]
      );

      const shareAmount = parseFloat(amount) / members.length;

      for (const member of members) {
        await db.execute(
          'INSERT INTO expense_splits (expense_id, user_id, share_amount) VALUES (?, ?, ?)',
          [expenseId, member.user_id, shareAmount.toFixed(2)]
        );
      }
    } else {
      // Custom splits
      for (const split of splits) {
        await db.execute(
          'INSERT INTO expense_splits (expense_id, user_id, share_amount, percentage) VALUES (?, ?, ?, ?)',
          [expenseId, split.user_id, parseFloat(split.share_amount).toFixed(2), split.percentage || null]
        );
      }
    }

    // Create notifications for group members
    const [members] = await db.execute(
      'SELECT user_id FROM group_members WHERE group_id = ? AND user_id != ?',
      [group_id, req.user.id]
    );

    const [paidByUser] = await db.execute('SELECT name FROM users WHERE id = ?', [paidBy]);
    const payerName = paidByUser[0]?.name || 'Someone';

    for (const member of members) {
      await db.execute(
        'INSERT INTO notifications (user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?)',
        [
          member.user_id,
          'New Expense Added',
          `${payerName} added "${title}" for ₹${parseFloat(amount).toFixed(2)}`,
          'expense',
          expenseId
        ]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Expense added successfully! 💰',
      expenseId
    });

  } catch (error) {
    console.error('Add expense error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get expenses for a group
const getGroupExpenses = async (req, res) => {
  const { group_id } = req.params;
  const { category, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [membership] = await db.execute(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [group_id, req.user.id]
    );

    if (membership.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    let query = `
      SELECT 
        e.*,
        u.name as paid_by_name,
        u.avatar as paid_by_avatar,
        GROUP_CONCAT(DISTINCT es.user_id) as split_users
      FROM expenses e
      LEFT JOIN users u ON e.paid_by = u.id
      LEFT JOIN expense_splits es ON e.id = es.expense_id
      WHERE e.group_id = ?
    `;
    const params = [group_id];

    if (category && category !== 'all') {
      query += ' AND e.category = ?';
      params.push(category);
    }

    query += ' GROUP BY e.id ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [expenses] = await db.execute(query, params);

    // Get splits for each expense
    for (let expense of expenses) {
      const [splits] = await db.execute(`
        SELECT es.*, u.name, u.avatar FROM expense_splits es
        JOIN users u ON es.user_id = u.id
        WHERE es.expense_id = ?
      `, [expense.id]);
      expense.splits = splits;
    }

    // Count total
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM expenses WHERE group_id = ?',
      [group_id]
    );

    return res.json({
      success: true,
      expenses,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get expenses error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get expense detail
const getExpense = async (req, res) => {
  const { id } = req.params;

  try {
    const [expenses] = await db.execute(`
      SELECT e.*, u.name as paid_by_name, u.avatar as paid_by_avatar
      FROM expenses e
      LEFT JOIN users u ON e.paid_by = u.id
      WHERE e.id = ?
    `, [id]);

    if (expenses.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    const expense = expenses[0];

    // Verify access
    const [membership] = await db.execute(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [expense.group_id, req.user.id]
    );

    if (membership.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const [splits] = await db.execute(`
      SELECT es.*, u.name, u.email, u.avatar FROM expense_splits es
      JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = ?
    `, [id]);

    expense.splits = splits;

    return res.json({ success: true, expense });
  } catch (error) {
    console.error('Get expense error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  const { id } = req.params;

  try {
    const [expenses] = await db.execute(
      'SELECT * FROM expenses WHERE id = ? AND paid_by = ?',
      [id, req.user.id]
    );

    if (expenses.length === 0) {
      return res.status(403).json({ success: false, message: 'You can only delete expenses you added.' });
    }

    await db.execute('DELETE FROM expenses WHERE id = ?', [id]);

    return res.json({ success: true, message: 'Expense deleted successfully.' });
  } catch (error) {
    console.error('Delete expense error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get dashboard summary for current user
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total owed to me (others owe me)
    const [owedToMe] = await db.execute(`
      SELECT COALESCE(SUM(es.share_amount), 0) as total
      FROM expense_splits es
      JOIN expenses e ON es.expense_id = e.id
      WHERE e.paid_by = ? AND es.user_id != ? AND es.is_settled = FALSE
    `, [userId, userId]);

    // Total I owe (I owe others)
    const [iOwe] = await db.execute(`
      SELECT COALESCE(SUM(es.share_amount), 0) as total
      FROM expense_splits es
      JOIN expenses e ON es.expense_id = e.id
      WHERE es.user_id = ? AND e.paid_by != ? AND es.is_settled = FALSE
    `, [userId, userId]);

    // Settlements received
    const [settlementsIn] = await db.execute(
      'SELECT COALESCE(SUM(amount), 0) as total FROM settlements WHERE paid_to = ?',
      [userId]
    );

    // Settlements paid
    const [settlementsOut] = await db.execute(
      'SELECT COALESCE(SUM(amount), 0) as total FROM settlements WHERE paid_by = ?',
      [userId]
    );

    // Recent transactions (last 10)
    const [recentExpenses] = await db.execute(`
      SELECT 
        e.id, e.title, e.amount, e.category, e.created_at,
        u.name as paid_by_name,
        g.name as group_name,
        es.share_amount as your_share
      FROM expenses e
      JOIN expense_splits es ON e.id = es.expense_id AND es.user_id = ?
      JOIN users u ON e.paid_by = u.id
      JOIN \`groups\` g ON e.group_id = g.id
      ORDER BY e.created_at DESC
      LIMIT 10
    `, [userId]);

    // Monthly expense data (last 6 months)
    const [monthlyData] = await db.execute(`
      SELECT 
        DATE_FORMAT(e.created_at, '%Y-%m') as month,
        COALESCE(SUM(es.share_amount), 0) as amount
      FROM expenses e
      JOIN expense_splits es ON e.id = es.expense_id AND es.user_id = ?
      WHERE e.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `, [userId]);

    // Category breakdown
    const [categoryData] = await db.execute(`
      SELECT 
        e.category,
        COALESCE(SUM(es.share_amount), 0) as amount
      FROM expenses e
      JOIN expense_splits es ON e.id = es.expense_id AND es.user_id = ?
      WHERE e.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY e.category
      ORDER BY amount DESC
    `, [userId]);

    // Groups summary
    const [groups] = await db.execute(`
      SELECT g.id, g.name, g.icon,
        COUNT(DISTINCT gm.user_id) as member_count,
        COALESCE(SUM(e.amount), 0) as total_expenses
      FROM \`groups\` g
      JOIN group_members gm2 ON g.id = gm2.group_id AND gm2.user_id = ?
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN expenses e ON g.id = e.group_id
      GROUP BY g.id
      LIMIT 5
    `, [userId]);

    return res.json({
      success: true,
      dashboard: {
        youAreOwed: parseFloat(owedToMe[0].total) - parseFloat(settlementsIn[0].total),
        youOwe: parseFloat(iOwe[0].total) - parseFloat(settlementsOut[0].total),
        recentExpenses,
        monthlyData,
        categoryData,
        groups
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get group-specific balances (who owes whom)
const getGroupBalanceSummary = async (req, res) => {
  const { group_id } = req.params;

  try {
    const [membership] = await db.execute(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [group_id, req.user.id]
    );

    if (membership.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Get members
    const [members] = await db.execute(`
      SELECT u.id, u.name, u.avatar FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
    `, [group_id]);

    // Build balance matrix
    const balances = {};
    members.forEach(m => { balances[m.id] = {}; });

    // From expenses
    const [splits] = await db.execute(`
      SELECT es.user_id as debtor, e.paid_by as creditor, SUM(es.share_amount) as amount
      FROM expense_splits es
      JOIN expenses e ON es.expense_id = e.id
      WHERE e.group_id = ? AND es.user_id != e.paid_by AND es.is_settled = FALSE
      GROUP BY es.user_id, e.paid_by
    `, [group_id]);

    for (const s of splits) {
      if (!balances[s.debtor]) balances[s.debtor] = {};
      balances[s.debtor][s.creditor] = (balances[s.debtor][s.creditor] || 0) + parseFloat(s.amount);
    }

    // From settlements
    const [settlements] = await db.execute(
      'SELECT paid_by, paid_to, amount FROM settlements WHERE group_id = ?',
      [group_id]
    );

    for (const s of settlements) {
      if (balances[s.paid_by]?.[s.paid_to]) {
        balances[s.paid_by][s.paid_to] = Math.max(0, balances[s.paid_by][s.paid_to] - parseFloat(s.amount));
      }
    }

    // Simplify debts (who net owes whom)
    const simplifiedDebts = [];
    members.forEach(debtor => {
      members.forEach(creditor => {
        if (debtor.id !== creditor.id) {
          const amount = (balances[debtor.id]?.[creditor.id] || 0) - (balances[creditor.id]?.[debtor.id] || 0);
          if (amount > 0.01) {
            simplifiedDebts.push({
              from: debtor,
              to: creditor,
              amount: parseFloat(amount.toFixed(2))
            });
          }
        }
      });
    });

    return res.json({ success: true, members, balances: simplifiedDebts });
  } catch (error) {
    console.error('Balance summary error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { addExpense, getGroupExpenses, getExpense, deleteExpense, getDashboard, getGroupBalanceSummary };

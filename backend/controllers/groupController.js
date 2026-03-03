const { randomUUID } = require('crypto');
const db = require('../config/db');

// Create a new group
const createGroup = async (req, res) => {
  const { name, description, icon, memberEmails } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Group name is required.' });
  }

  try {
    const inviteCode = randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();
    
    const [result] = await db.execute(
      'INSERT INTO `groups` (name, description, icon, created_by, invite_code) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), description || null, icon || '👥', req.user.id, inviteCode]
    );

    const groupId = result.insertId;

    // Add creator as admin
    await db.execute(
      'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
      [groupId, req.user.id, 'admin']
    );

    // Add members by email if provided
    if (memberEmails && memberEmails.length > 0) {
      for (const email of memberEmails) {
        const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email.trim()]);
        if (users.length > 0 && users[0].id !== req.user.id) {
          await db.execute(
            'INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)',
            [groupId, users[0].id]
          );
        }
      }
    }

    const [group] = await db.execute(
      'SELECT * FROM `groups` WHERE id = ?',
      [groupId]
    );

    return res.status(201).json({
      success: true,
      message: `Group "${name}" created successfully! ✅`,
      group: group[0]
    });

  } catch (error) {
    console.error('Create group error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get all groups for current user
const getGroups = async (req, res) => {
  try {
    const [groups] = await db.execute(`
      SELECT 
        g.*,
        u.name as creator_name,
        COUNT(DISTINCT gm.user_id) as member_count,
        COUNT(DISTINCT e.id) as expense_count,
        COALESCE(SUM(e.amount), 0) as total_expenses
      FROM \`groups\` g
      JOIN group_members gm2 ON g.id = gm2.group_id AND gm2.user_id = ?
      LEFT JOIN users u ON g.created_by = u.id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN expenses e ON g.id = e.group_id
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `, [req.user.id]);

    return res.json({ success: true, groups });
  } catch (error) {
    console.error('Get groups error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single group with details
const getGroup = async (req, res) => {
  const { id } = req.params;

  try {
    // Check membership
    const [membership] = await db.execute(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (membership.length === 0) {
      return res.status(403).json({ success: false, message: 'You are not a member of this group.' });
    }

    const [groups] = await db.execute(
      'SELECT g.*, u.name as creator_name FROM `groups` g LEFT JOIN users u ON g.created_by = u.id WHERE g.id = ?',
      [id]
    );

    if (groups.length === 0) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    // Get members
    const [members] = await db.execute(`
      SELECT u.id, u.name, u.email, u.avatar, gm.role, gm.joined_at
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
    `, [id]);

    // Get balances
    const balances = await getGroupBalances(id, req.user.id);

    return res.json({
      success: true,
      group: { ...groups[0], members, balances }
    });

  } catch (error) {
    console.error('Get group error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Helper to calculate group balances
const getGroupBalances = async (groupId, userId) => {
  try {
    // Get all expenses and splits
    const [splits] = await db.execute(`
      SELECT 
        es.user_id as owes_user,
        e.paid_by as owed_to_user,
        es.share_amount,
        es.is_settled,
        e.id as expense_id
      FROM expense_splits es
      JOIN expenses e ON es.expense_id = e.id
      WHERE e.group_id = ? AND es.user_id != e.paid_by AND es.is_settled = FALSE
    `, [groupId]);

    // Get settlements
    const [settlements] = await db.execute(
      'SELECT paid_by, paid_to, amount FROM settlements WHERE group_id = ?',
      [groupId]
    );

    // Calculate net balances between pairs
    const balanceMap = {};
    
    for (const split of splits) {
      const key = `${split.owes_user}_${split.owed_to_user}`;
      if (!balanceMap[key]) balanceMap[key] = 0;
      balanceMap[key] += parseFloat(split.share_amount);
    }

    for (const s of settlements) {
      const key = `${s.paid_by}_${s.paid_to}`;
      const reverseKey = `${s.paid_to}_${s.paid_by}`;
      if (balanceMap[key]) {
        balanceMap[key] -= parseFloat(s.amount);
      } else if (balanceMap[reverseKey]) {
        balanceMap[reverseKey] += parseFloat(s.amount);
      }
    }

    return balanceMap;
  } catch (err) {
    return {};
  }
};

// Add member to group
const addMember = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  try {
    const [users] = await db.execute('SELECT id, name, email, avatar FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No user found with that email. They must register first.' });
    }

    const newUser = users[0];

    const [existing] = await db.execute(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, newUser.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User is already a member of this group.' });
    }

    await db.execute(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [id, newUser.id]
    );

    return res.json({
      success: true,
      message: `${newUser.name} added to the group! 🎉`,
      member: newUser
    });

  } catch (error) {
    console.error('Add member error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Join group by invite code
const joinGroup = async (req, res) => {
  const { inviteCode } = req.body;

  try {
    const [groups] = await db.execute(
      'SELECT * FROM `groups` WHERE invite_code = ?',
      [inviteCode.toUpperCase()]
    );

    if (groups.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid invite code.' });
    }

    const group = groups[0];

    const [existing] = await db.execute(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [group.id, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You are already a member of this group.' });
    }

    await db.execute(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [group.id, req.user.id]
    );

    return res.json({
      success: true,
      message: `Joined "${group.name}" successfully! 🎉`,
      group
    });

  } catch (error) {
    console.error('Join group error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete group
const deleteGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const [groups] = await db.execute(
      'SELECT * FROM `groups` WHERE id = ? AND created_by = ?',
      [id, req.user.id]
    );

    if (groups.length === 0) {
      return res.status(403).json({ success: false, message: 'Only the group creator can delete the group.' });
    }

    await db.execute('DELETE FROM `groups` WHERE id = ?', [id]);

    return res.json({ success: true, message: 'Group deleted successfully.' });
  } catch (error) {
    console.error('Delete group error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createGroup, getGroups, getGroup, addMember, joinGroup, deleteGroup };

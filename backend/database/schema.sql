-- =========================
-- FairSplit Database Schema
-- =========================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(500) DEFAULT NULL,
  bio VARCHAR(500) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  dark_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Groups table
CREATE TABLE IF NOT EXISTS `groups` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(10) DEFAULT '👥',
  created_by INT NOT NULL,
  invite_code VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_groups_creator
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Group Members table
CREATE TABLE IF NOT EXISTS group_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('admin','member') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_member (group_id, user_id),
  CONSTRAINT fk_group_members_group
    FOREIGN KEY (group_id)
    REFERENCES `groups`(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_group_members_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  paid_by INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  title VARCHAR(300) NOT NULL,
  note TEXT,
  category VARCHAR(50) DEFAULT 'Other',
  split_type ENUM('equal','custom','percentage') DEFAULT 'equal',
  receipt_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_expenses_group
    FOREIGN KEY (group_id)
    REFERENCES `groups`(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_expenses_user
    FOREIGN KEY (paid_by)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Expense Splits table
CREATE TABLE IF NOT EXISTS expense_splits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  expense_id INT NOT NULL,
  user_id INT NOT NULL,
  share_amount DECIMAL(12,2) NOT NULL,
  percentage DECIMAL(5,2),
  is_settled BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_splits_expense
    FOREIGN KEY (expense_id)
    REFERENCES expenses(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_splits_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Settlements table
CREATE TABLE IF NOT EXISTS settlements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  paid_by INT NOT NULL,
  paid_to INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_settlement_group
    FOREIGN KEY (group_id)
    REFERENCES `groups`(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_settlement_paid_by
    FOREIGN KEY (paid_by)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_settlement_paid_to
    FOREIGN KEY (paid_to)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('expense','settlement','group','reminder') DEFAULT 'expense',
  is_read BOOLEAN DEFAULT FALSE,
  related_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexes
CREATE INDEX idx_expenses_group ON expenses(group_id);
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX idx_splits_expense ON expense_splits(expense_id);
CREATE INDEX idx_splits_user ON expense_splits(user_id);
CREATE INDEX idx_settlements_group ON settlements(group_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
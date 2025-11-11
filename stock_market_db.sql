-- Database: stock_market_db
CREATE DATABASE IF NOT EXISTS stock_market_db;
USE stock_market_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE DATABASE IF NOT EXISTS stock_market_db;
USE stock_market_db;

-- Table for contact form messages
CREATE TABLE IF NOT EXISTS contact_form (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(10),
  query_type VARCHAR(100),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_form (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  subject VARCHAR(150),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  rating INT,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100),
  description TEXT,
  price DECIMAL(10,2),
  duration VARCHAR(50)
);

-- Progress Table (tracks user tutorial progress)
CREATE TABLE IF NOT EXISTS progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    tutorial_id INT,
    time_spent_minutes INT DEFAULT 0,
    completed TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tutorial_id) REFERENCES courses(id),
    UNIQUE KEY(user_id, tutorial_id)
);

-- Sample course data
INSERT INTO courses (title, description, price, duration)
VALUES
('Basics of Stock Market', 'Learn the fundamentals of trading, investing, and stock market structure.', 1999.00, '4 weeks'),
('Technical Analysis', 'Master charts, indicators, and trading psychology.', 2499.00, '6 weeks'),
('Advanced Derivatives', 'Understand futures, options, and risk management.', 2999.00, '8 weeks');

CREATE DATABASE IF NOT EXISTS virtual_sms_saas;
USE virtual_sms_saas;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  wallet_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS virtual_numbers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  country_code VARCHAR(10) NOT NULL,
  number_value VARCHAR(30) NOT NULL,
  service_name VARCHAR(120) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('available', 'sold') NOT NULL DEFAULT 'available',
  assigned_user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS sms_activations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  number_id INT NOT NULL,
  status ENUM('active', 'expired') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (number_id) REFERENCES virtual_numbers(id)
);

CREATE TABLE IF NOT EXISTS sms_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activation_id INT NOT NULL,
  sender VARCHAR(80) NOT NULL,
  message_text TEXT NOT NULL,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activation_id) REFERENCES sms_activations(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type ENUM('credit', 'debit') NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO virtual_numbers (country_code, number_value, service_name, price) VALUES
('+1', '+12065550101', 'Telegram', 1.50),
('+44', '+447700900101', 'WhatsApp', 1.20),
('+91', '+918888000111', 'Google', 0.95);

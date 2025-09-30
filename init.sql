-- Initialize SIMOTEX database
CREATE DATABASE IF NOT EXISTS simotex_db;
USE simotex_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role ENUM('RCE', 'CE', 'CHC', 'RP', 'RCPF') NOT NULL,
    cnx timestamp
);

-- Production Lines table
CREATE TABLE IF NOT EXISTS production_lines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    status ENUM('actif', 'bloqué', 'en attente', 'fin') DEFAULT 'actif',
    operator VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Initialize production lines
INSERT INTO production_lines (name, operator) VALUES
    ('Chaîne 1', 'Fatma Ben Salah'),
    ('Chaîne 2', 'Sana Trabelsi'),
    ('Chaîne 3', 'Aymen Gharbi'),
    ('Chaîne 4', 'Nesrine Kefi'),
    ('Chaîne 5', NULL),
    ('Chaîne 6', NULL),
    ('Chaîne 7', NULL),
    ('Chaîne 8', NULL),
    ('Chaîne 9', NULL),
    ('Chaîne 10', NULL);

-- Control Orders table
CREATE TABLE IF NOT EXISTS control_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    responsible_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Control Order Lines table
CREATE TABLE IF NOT EXISTS control_order_lines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    line_number INT NOT NULL,
    ce_assigned VARCHAR(100),
    priority ENUM('Normale', 'Haute', 'Critique') DEFAULT 'Normale',
    defect TEXT,
    status ENUM('non commencé', 'en cours', 'bloqué', 'terminé') DEFAULT 'non commencé',
    FOREIGN KEY (order_id) REFERENCES control_orders(id)
);

-- Defects table
CREATE TABLE IF NOT EXISTS defects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('mineur', 'majeur', 'critique') NOT NULL,
    description TEXT,
    worker_name VARCHAR(100),
    operation VARCHAR(100),
    line_number INT,
    of_number VARCHAR(50),
    packet_number VARCHAR(50),
    defect_count INT,
    sample_count INT,
    resolution_status ENUM('Non résolu', 'Résolu') DEFAULT 'Non résolu',
    resolution_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (line_number) REFERENCES production_lines(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message TEXT NOT NULL,
    target_roles JSON NOT NULL,
    read_by JSON DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

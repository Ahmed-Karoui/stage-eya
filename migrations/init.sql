-- Drop existing tables if they exist
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS defects;
DROP TABLE IF EXISTS order_lines;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS chaine;
DROP TABLE IF EXISTS users;

-- Create tables
USE simotex;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role ENUM('RCE', 'CE', 'CHC', 'RP', 'RCPF') NOT NULL,
    cnx timestamp
);

CREATE TABLE chaine (
    id INT AUTO_INCREMENT PRIMARY KEY,
    num INT NOT NULL,
    etat ENUM('en cour', 'bloqué', 'sous controle') NOT NULL
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    responsable_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (responsable_id) REFERENCES users(id)
);

CREATE TABLE order_lines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    chain_number INT NOT NULL,
    ce varchar(10),
    priority ENUM('Normale', 'Haute', 'Critique') DEFAULT 'Normale',
    defect VARCHAR(255) DEFAULT NULL,
    status ENUM('non commencé','en cour','bloqué','terminé') default 'non commencé' NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE defects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    num_of VARCHAR(50),
    num_paquet INT,
    num_chaine INT,
    matricule_ouvriere VARCHAR(50),
    operation VARCHAR(100),
    nombre_defaut_detecte INT,
    nombre_echantillons INT,
    gravite ENUM('mineur','majeur','critique'),
    num_piece_2eme_paquet INT,
    detected_by INT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolution_status ENUM('Non résolu', 'Résolu') DEFAULT 'Non résolu',
    resolution_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (detected_by) REFERENCES users(id)
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    target_roles SET('RCE', 'RCPF', 'CHC', 'RP', 'CE'),
    order_line_id INT,
    FOREIGN KEY (order_line_id) REFERENCES order_lines(id)
);

-- Insert initial data for chains
INSERT INTO chaine (num, etat) VALUES
(1, 'en cour'),
(2, 'en cour'),
(3, 'en cour'),
(4, 'en cour'),
(5, 'en cour'),
(6, 'en cour'),
(7, 'en cour'),
(8, 'en cour'),
(9, 'en cour'),
(10, 'en cour');

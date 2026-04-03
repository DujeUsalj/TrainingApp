-- Railway: Postgres -> Query -> zalijepi i Run (cijeli blok).
-- Lozinka za sve demo račune: Demo2026!
-- Radi i ako na emailu NEMA UNIQUE (nema ON CONFLICT).

INSERT INTO users (first_name, last_name, email, password_hash, role)
SELECT 'Ivan', 'Horvat', 'trener1@test.com', '$2b$10$n9FcSgeK7Pfi6zYf2n3Wk.e/hG6yGe3QCMGvkwdzAICt7Oc3a5e/m', 'COACH'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'trener1@test.com');

INSERT INTO users (first_name, last_name, email, password_hash, role)
SELECT 'Ana', 'Kovač', 'trener2@test.com', '$2b$10$n9FcSgeK7Pfi6zYf2n3Wk.e/hG6yGe3QCMGvkwdzAICt7Oc3a5e/m', 'COACH'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'trener2@test.com');

INSERT INTO users (first_name, last_name, email, password_hash, role)
SELECT 'Marko', 'Babić', 'sportas1@test.com', '$2b$10$n9FcSgeK7Pfi6zYf2n3Wk.e/hG6yGe3QCMGvkwdzAICt7Oc3a5e/m', 'ATHLETE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sportas1@test.com');

INSERT INTO users (first_name, last_name, email, password_hash, role)
SELECT 'Petra', 'Novak', 'sportas2@test.com', '$2b$10$n9FcSgeK7Pfi6zYf2n3Wk.e/hG6yGe3QCMGvkwdzAICt7Oc3a5e/m', 'ATHLETE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sportas2@test.com');

INSERT INTO users (first_name, last_name, email, password_hash, role)
SELECT 'Luka', 'Jurić', 'sportas3@test.com', '$2b$10$n9FcSgeK7Pfi6zYf2n3Wk.e/hG6yGe3QCMGvkwdzAICt7Oc3a5e/m', 'ATHLETE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sportas3@test.com');

-- provjera
SELECT id, email, role, first_name, last_name FROM users ORDER BY id;

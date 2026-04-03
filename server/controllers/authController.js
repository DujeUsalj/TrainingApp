const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const JWT_SECRET = process.env.JWT_SECRET || "tajna123";
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role: roleRaw } = req.body;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Popuni ime, prezime, email i lozinku" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Lozinka mora imati najmanje 6 znakova" });
    }

    const allowedRoles = ["ATHLETE", "COACH"];
    const role = String(roleRaw || "ATHLETE").trim().toUpperCase();

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Uloga mora biti ATHLETE ili COACH" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email je već registriran" });
    }

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, email, role, created_at`,
      [firstName.trim(), lastName.trim(), email.trim().toLowerCase(), hashedPassword, role],
    );

    res.status(201).json({
      message: "Registracija uspješna",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Unesi email i lozinku" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Neispravan email ili lozinka" });
    }

    const user = result.rows[0];

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Neispravan email ili lozinka" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, role, created_at
       FROM users WHERE id = $1`,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const row = result.rows[0];
    const user = {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      role: row.role,
    };

    let token;
    if (String(row.role).toUpperCase() !== String(req.user.role).toUpperCase()) {
      token = jwt.sign(
        { id: row.id, email: row.email, role: row.role },
        JWT_SECRET,
        { expiresIn: "1h" },
      );
    }

    res.status(200).json({ user, ...(token ? { token } : {}) });
  } catch (error) {
    console.error("Get me error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

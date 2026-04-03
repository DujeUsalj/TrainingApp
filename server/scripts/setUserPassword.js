require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const run = async () => {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error("Usage: node scripts/setUserPassword.js <email> <newPassword>");
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error("Password should be at least 6 characters.");
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1
       WHERE email = $2
       RETURNING id, email, role`,
      [hashedPassword, email],
    );

    if (result.rows.length === 0) {
      console.error("User not found");
      process.exit(1);
    }

    console.log("Password updated for:", result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

run();

require("dotenv").config();
const pool = require("../config/db");

const run = async () => {
  const email = process.argv[2];
  const role = process.argv[3];
  const allowedRoles = ["ATHLETE", "COACH", "ADMIN"];

  if (!email || !role) {
    console.error("Usage: node scripts/setUserRole.js <email> <ATHLETE|COACH|ADMIN>");
    process.exit(1);
  }

  const normalizedRole = role.toUpperCase();

  if (!allowedRoles.includes(normalizedRole)) {
    console.error(`Invalid role. Allowed roles: ${allowedRoles.join(", ")}`);
    process.exit(1);
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET role = $1
       WHERE email = $2
       RETURNING id, first_name, last_name, email, role`,
      [normalizedRole, email],
    );

    if (result.rows.length === 0) {
      console.error("User not found");
      process.exit(1);
    }

    console.log("User role updated:", result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error("Error updating user role:", error.message);
    process.exit(1);
  }
};

run();

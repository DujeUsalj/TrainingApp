require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const DEMO_PASSWORD = "Demo2026!";

const USERS = [
  { firstName: "Ivan", lastName: "Horvat", email: "trener1@test.com", role: "COACH" },
  { firstName: "Ana", lastName: "Kovač", email: "trener2@test.com", role: "COACH" },
  { firstName: "Marko", lastName: "Babić", email: "sportas1@test.com", role: "ATHLETE" },
  { firstName: "Petra", lastName: "Novak", email: "sportas2@test.com", role: "ATHLETE" },
  { firstName: "Luka", lastName: "Jurić", email: "sportas3@test.com", role: "ATHLETE" }
];

const run = async () => {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const u of USERS) {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [u.email]);

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE users
         SET first_name = $1, last_name = $2, password_hash = $3, role = $4
         WHERE email = $5`,
        [u.firstName, u.lastName, hash, u.role, u.email],
      );
      console.log("Ažuriran:", u.email, u.role);
    } else {
      await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)`,
        [u.firstName, u.lastName, u.email, hash, u.role],
      );
      console.log("Dodan:", u.email, u.role);
    }
  }

  console.log("\nGotovo. Zajednička lozinka za sve demo račune:", DEMO_PASSWORD);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

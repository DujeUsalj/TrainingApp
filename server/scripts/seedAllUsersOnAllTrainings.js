require("dotenv").config();
const pool = require("../config/db");

/**
 * Za svaki trening i svakog korisnika u `users` dodaje red u `participations` ako već ne postoji.
 * Pokretanje: cd server && npm run seed:participations
 */
const run = async () => {
  const users = await pool.query("SELECT id, email, role FROM users ORDER BY id");
  const trainings = await pool.query("SELECT id, title FROM trainings ORDER BY id");

  if (trainings.rows.length === 0) {
    console.log("Nema treninga u bazi — prvo kreiraj treninge (npr. kao trener u aplikaciji).");
    process.exit(0);
  }

  if (users.rows.length === 0) {
    console.log("Nema korisnika u bazi.");
    process.exit(0);
  }

  let added = 0;

  for (const t of trainings.rows) {
    for (const u of users.rows) {
      const ins = await pool.query(
        `INSERT INTO participations (user_id, training_id)
         SELECT $1, $2
         WHERE NOT EXISTS (
           SELECT 1 FROM participations WHERE user_id = $1 AND training_id = $2
         )
         RETURNING id`,
        [u.id, t.id],
      );
      if (ins.rows.length > 0) {
        added += 1;
        console.log(`+ trening #${t.id} (${t.title || "bez naslova"}) ← ${u.email}`);
      }
    }
  }

  console.log(`\nGotovo. Novih prijava: ${added} (postojeće kombinacije preskočene).`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

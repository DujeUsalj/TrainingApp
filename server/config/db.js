const { Pool } = require("pg");
require("dotenv").config();

function buildPoolConfig() {
  if (process.env.DATABASE_URL) {
    const useSsl = process.env.DATABASE_SSL !== "false";
    return {
      connectionString: process.env.DATABASE_URL,
      ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    };
  }

  return {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  };
}

const pool = new Pool(buildPoolConfig());

module.exports = pool;

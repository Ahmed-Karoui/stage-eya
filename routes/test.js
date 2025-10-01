// /api/test-db.js or /routes/test.js
import mysql from "mysql2/promise";

export default async function handler(req, res) {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false } // important for Aiven
    });

    const [rows] = await conn.query("SELECT NOW()");
    await conn.end();

    res.status(200).json({ success: true, time: rows[0] });
  } catch (err) {
    console.error("DB Test Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

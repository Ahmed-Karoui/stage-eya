// routes/test.js
import express from "express";
import mysql from "mysql2/promise";

const router = express.Router();

router.get("/test-db", async (req, res) => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },
    });
    const [rows] = await conn.query("SELECT NOW()");
    await conn.end();
    res.json({ success: true, time: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

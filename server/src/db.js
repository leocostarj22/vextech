import mysql from "mysql2/promise";
import "dotenv/config";

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "vextech",
  password: process.env.DB_PASSWORD || "vextech",
  database: process.env.DB_NAME || "vextech",
  timezone: "Z",
  waitForConnections: true,
  connectionLimit: 10,
});

// DATETIME e CURRENT_TIMESTAMP seguem UTC; a interface apresenta Europe/Lisbon.
pool.on("connection", (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

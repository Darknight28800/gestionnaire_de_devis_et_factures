import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

pool.query("SELECT DATABASE() AS db")
    .then(([rows]) => {
        console.log("📌 Base réellement utilisée par Node :", rows[0].db);
    })
    .catch((err) => {
        console.error("❌ Impossible de se connecter à la base de données :", err.message);
    });

export default pool;

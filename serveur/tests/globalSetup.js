import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function setup() {
    dotenv.config({ path: path.join(__dirname, "..", ".env") });

    const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
    let schemaSql = fs.readFileSync(schemaPath, "utf8");
    schemaSql = schemaSql.replaceAll("gestion_devis_factures", "gestion_devis_factures_test");

    const connexion = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        multipleStatements: true
    });

    await connexion.query(`DROP DATABASE IF EXISTS gestion_devis_factures_test`);
    await connexion.query(schemaSql);
    await connexion.end();
}

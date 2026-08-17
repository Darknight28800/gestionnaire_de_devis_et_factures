import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { beforeEach } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.NODE_ENV = "test";
process.env.DB_NAME = "gestion_devis_factures_test";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { truncateAll } = await import("./dbReset.js");

beforeEach(async () => {
    await truncateAll();
});

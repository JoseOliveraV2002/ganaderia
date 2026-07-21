import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DbClient = ReturnType<typeof drizzle<typeof schema>>;

function createDb(): DbClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta la variable de entorno DATABASE_URL (connection string de Neon/Postgres). " +
        "Configúrala en tu .env local o en las variables de entorno de tu hosting."
    );
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

let _db: DbClient | null = null;

export const db: DbClient = new Proxy({} as DbClient, {
  get(_target, prop, receiver) {
    if (!_db) _db = createDb();
    return Reflect.get(_db as object, prop, receiver);
  },
});
import z from "zod";
import { promises as fs } from "fs";
import path from "path";
import { databaseSchema } from "../../db_schema";

type DatabaseSchema = z.infer<typeof databaseSchema>;

const DB_PATH = path.resolve(process.cwd(), "db.json");

interface Database extends Partial<DatabaseSchema> {}

async function readDB(): Promise<Database> {
  try {
    const data = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(data) as Database;
  } catch (error) {
    console.error("Error reading the database:", error);
    return {};
  }
}

async function writeDB(data: Database): Promise<void> {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(DB_PATH, jsonData, "utf8");
  } catch (error) {
    console.error("Error writing to the database:", error);
  }
}

export async function get<K extends keyof Database>(
  key: K
): Promise<Database[K]> {
  const data = await readDB();
  return data[key];
}

export async function exists<K extends keyof Database>(
  key: K
): Promise<boolean> {
  const data = await readDB();
  // Check if the key exists and the value is not null, undefined, or an empty string
  return (
    key in data &&
    data[key] !== null &&
    data[key] !== undefined &&
    data[key] !== ""
  );
}



export async function set<K extends keyof Database>(
  key: K,
  value: Database[K]
): Promise<void> {
  const data = await readDB();
  data[key] = value;
  await writeDB(data);
}

export async function del(key: keyof Database): Promise<void> {
  const data = await readDB();
  delete data[key];
  await writeDB(data);
}

export async function getAll(): Promise<Database> {
  return await readDB();
}

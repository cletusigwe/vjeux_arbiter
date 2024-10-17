import { promises as fs } from "fs";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), "db.json");

interface Database {
  [key: string]: any;
}

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

export async function get(key: string): Promise<any> {
  const data = await readDB();
  return data[key];
}

export async function set(key: string, value: any): Promise<void> {
  const data = await readDB();
  data[key] = value;
  await writeDB(data);
}

export async function del(key: string): Promise<void> {
  const data = await readDB();
  delete data[key];
  await writeDB(data);
}

export async function getAll(): Promise<Database> {
  return await readDB();
}

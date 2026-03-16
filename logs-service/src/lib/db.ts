import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;

export async function getClient(): Promise<MongoClient> {
  if (cachedClient) return cachedClient;
  const url =
    process.env.DATABASE_URL || "mongodb://localhost:27018/log_service";
  const client = new MongoClient(url);
  cachedClient = client;
  await client.connect();
  return client;
}

export async function closeClient(): Promise<void> {
  if (cachedClient) {
    try {
      await cachedClient.close();
      cachedClient = null;
    } catch (err) {
      console.log(err);
    }
  }
}

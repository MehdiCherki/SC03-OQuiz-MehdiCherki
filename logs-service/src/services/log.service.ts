import { getClient } from "../lib/db.ts"

export interface Logs {
    timestamp: Date;
    level: string,
}

export async function createLog(data: any){
    const logData = {
        ...data,
        timestamp: new Date(),

    };
    const client = await getClient();
    await client.db().collection("logs").insertOne(logData)
}

export async function getLogs(): Promise<Logs[]>{
    const client = getClient();
    const collection = (await client).db().collection("logs");

    const logs = await collection.find().toArray();
    return logs
}
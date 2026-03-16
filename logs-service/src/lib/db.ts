import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;

export async function getClient(): Promise<MongoClient>{
    if (cachedClient) {
        return cachedClient
    } else {
    const url = process.env.MONGO_URL || 'mongodb://localhost:27018';
    const client = new MongoClient(url);
    cachedClient = client;
    await client.connect();
    return client;
    }
}

export async function closeClient(): Promise<void>{
    if(cachedClient){
        try{
            await cachedClient.close()
            cachedClient = null ;
        } catch(err){
         console.log(err)
        }
    }
}
import { MongoClient, ServerApiVersion } from "mongodb";

let db;
let client;

const connectDB = async () => {
  if (db) return db; // Return existing database connection

  try {
    const uri = process.env.MONGO_URL;

    // Ensure the URI is provided
    if (!uri) {
      throw new Error("MONGO_URL is not defined in environment variables");
    }

    // Create a new MongoClient instance
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    // Connect to the client and database
    await client.connect();
    db = client.db("embroid");

    return db;
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw new Error("Database connection error"); // Rethrow to handle it higher up
  }
};

export default connectDB;

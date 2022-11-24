import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

let DB = function () {
  let connection = null;

  async function connect() {
    try {
      connection = new MongoClient(process.env.DB_URI);
      await connection.connect();
      console.log("connected");
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  }
  async function usersCollection() {
    if (!connection) {
      await connect();
    }
    return await connection.db("project").collection("users");
  }

  async function postsCollection() {
    if (!connection) {
      await connect();
    }
    return connection.db("project").collection("posts");
  }
  async function chatDB() {
    if (!connection) {
      await connect();
    }

    return connection.db("chats");
  }

  return {
    connect,
    usersCollection,
    postsCollection,
    chatDB,
  };
};

export default DB();

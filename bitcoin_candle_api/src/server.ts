import { config } from "dotenv";
import { app } from "./app";
import { connectToMongoDB } from "./config/db";
import { connection } from "mongoose";
import CandleMessageChannel from "./messages/CandleMessageChannel";

const createServer = async () => {
  config();

  await connectToMongoDB();

  const PORT = process.env.PORT;
  const server = app.listen(PORT, () => {
    console.log(`App Runing on port ${PORT}`);
  });

  const candleMsgChannel = new CandleMessageChannel(server);
  candleMsgChannel.consumeMessages();

  process.on("SIGINT", async () => {
    await connection.close();
    server.close();

    console.log("App server and connection to MongoDB closed");
  });
};

createServer();

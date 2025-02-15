import { config } from "dotenv";
import axios from "axios";
import Period from "./enums/Period";
import Candle from "./models/Candle";
import { createMessageChannel } from "./messages/messageChannel";

config();

const readMarketPrice = async (): Promise<number> => {
  const result = await axios.get(`${process.env.PRICES_API}`);
  const data = result.data;
  const price = data.bitcoin.usd;
  return price;
};

const generateCandles = async () => {
  const messageChannel = await createMessageChannel();

  if (messageChannel) {
    while (true) {
      const loopTimes = Period.ONE_MINUTE / Period.THIRTY_SECONDS;
      const candle = new Candle("BTC");

      console.log("-------------------------------------");
      console.log("GENARATING NEW CANDLER");

      for (let i = 0; i < loopTimes; i++) {
        const price = await readMarketPrice();
        candle.addValue(price);
        console.log(`Market Price ${i + 1} of ${loopTimes}`);

        await new Promise((r) => setTimeout(r, Period.THIRTY_SECONDS));
      }

      candle.closeCandle();
      console.log("Candle Closed");
      const candleObj = candle.toSimpleObject();
      console.log(candle);

      const candleJson = JSON.stringify(candleObj);
      messageChannel.sendToQueue(
        process.env.QUEUE_NAME,
        Buffer.from(candleJson)
      );
      console.log("Candle enqueued");
    }
  }
};

generateCandles();

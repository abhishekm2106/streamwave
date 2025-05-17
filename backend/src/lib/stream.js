import { StreamChat } from "stream-chat";
import "dotenv/config";

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

if (!api_key || !api_secret)
  console.log("Missing Stream API key or secret", { api_key, api_secret });

const client = StreamChat.getInstance(api_key, api_secret);

export const upsertStreamUser = async (userData) => {
  try {
    await client.upsertUser(userData);
    console.log("Upserted user to Stream", userData); // Log the userData object before retur
    return userData; // Return the userData object after upserting it
  } catch (error) {
    console.log("Error upserting stream user", error);
  }
};

export const generateStreamToken = (userId) => {
  try {
    const id = userId.toString();
    return client.createToken(id); // Return the token valu
  } catch (error) {
    console.log("Error generating stream token", error);
  }
};

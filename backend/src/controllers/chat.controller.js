import { generateStreamToken } from "../lib/stream.js";
import Chats from "../models/Chats.js";

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user._id);
    res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

export async function getMessages(req, res) {
  try {
    //TODO: disable access to the user who's id is not in the room id
    // console.log("getMessages");
    const { roomId } = req.params;
    const chatData = await Chats.findById(roomId);
    // console.log({ chatData });
    res.status(200).json(chatData?.messages || []);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

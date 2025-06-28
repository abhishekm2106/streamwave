import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    _id: String,
    messages: [
      {
        message: {
          type: String,
          required: true,
        },
        authUser: {
          type: Object,
          required: true,
        },
        time: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Chats = mongoose.model("Chats", chatSchema);

export default Chats;

import React from "react";
import StreamChatPage from "./StreamChatPage";
import SocketChatPage from "./SocketChatPage";

const ChatPage = () => {
  const [chatProvider, setChatProvider] = React.useState("socket"); // stream | socket
  return (
    <div className="flex flex-col items-center w-screen">
      <div className="flex gap-2 py-3">
        <p className={chatProvider === "stream" && "text-primary font-bold"}>
          Stream
        </p>
        <input
          type="checkbox"
          defaultChecked
          className="toggle toggle-primary text-primary"
          checked={chatProvider === "socket"}
          onChange={(e) =>
            setChatProvider(e.target.checked ? "socket" : "stream")
          }
        />
        <p className={chatProvider === "socket" && "text-primary font-bold"}>
          Socket.io
        </p>
      </div>
      {chatProvider === "stream" ? <StreamChatPage /> : <SocketChatPage />}
    </div>
  );
};

export default ChatPage;

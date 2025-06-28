import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { io } from "socket.io-client";
import useAuthUser from "../hooks/useAuthUser";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import useUserFirends from "../hooks/useUserFirends";
import toast from "react-hot-toast";
import CallButton from "../components/CallButton";
import { getMessages } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import { socket } from "../socket";
dayjs.extend(calendar);

const makeLinksClickable = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          className="text-blue-600 underline"
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const Message = ({ data, currentUser, showTime }) => {
  const isCurrentUsersMessage = data.authUser._id === currentUser._id;
  return (
    <div
      className="flex w-full"
      style={{
        justifyContent: isCurrentUsersMessage ? "end" : "start",
      }}
    >
      <div
        className={`flex flex-col ${
          isCurrentUsersMessage ? "items-end" : "items-start"
        }`}
      >
        <p
          className={`p-2 px-3 rounded-full ${
            isCurrentUsersMessage
              ? "rounded-br-none bg-primary text-primary-content"
              : "rounded-bl-none bg-accent text-accent-content"
          }`}
        >
          {makeLinksClickable(data.message)}
        </p>
        {showTime && (
          <div>
            {dayjs(data.time).calendar(null, {
              sameElse: "DD MMMM YYYY",
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const SocketChatPage = () => {
  const { id: targetUserId } = useParams();
  const { authUser } = useAuthUser();

  const [messages, setMessages] = React.useState([]);
  const [message, setMessage] = React.useState("");
  const { friends } = useUserFirends();
  const scrollRef = useRef(null);
  const [calling, setCalling] = useState(false);
  const [callUrl, setCallUrl] = useState("");
  const [roomID, setRoomId] = useState("");

  const targetUser = friends.find((friend) => friend._id === targetUserId);
  console.log({ authUser, targetUser });

  const { data: messagesInDB, isLoading } = useQuery({
    queryKey: ["messages", roomID],
    queryFn: () => getMessages(roomID),
    enabled: !!roomID,
  });

  console.log({ messagesInDB });
  const channelId = [authUser._id, targetUserId].sort().join("-");
  const handleVideoCall = () => {
    setCalling(true);

    const callTempUrl = `${window.location.origin}/call/${channelId}`;
    setCallUrl(callTempUrl);
    socket.emit("call", {
      roomID,
      authUser,
      callUrl: callTempUrl,
      targetUserId,
      channelId,
    });
    // socket.emit("message", {
    //   message: `I've started a video call. Join me here: ${callUrl}`,
    //   authUser,
    // });
    // window.location.href = callUrl;
    // channel.sendMessage({
    //   text: `I've started a video call. Join me here: ${callUrl}`,
    // });

    toast.success("calling...");
    socket.on("timeout_declined_server", (newe) => {
      console.log({ newe });
      socket.off("timeout_declined_server");
      setCalling(false);
      toast.error(
        "The person you are trying to call is not picking up the call"
      );
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    console.log({ message });
    if (message.trim() === "") return;
    socket.emit("message", { message, authUser });
    setMessage("");
  };

  useEffect(() => {
    console.log({ targetUser });
    setMessages(messagesInDB || []);
    if (targetUser) {
      let tempRoomId =
        "room-" + [authUser.fullName, targetUser.fullName].sort().join("-");
      setRoomId(tempRoomId);
      socket.emit("join", { roomId: tempRoomId, user: authUser });
    }
    socket.on("receive_message", (data) => {
      console.log("recieveing messages");
      console.log({ data });
      setMessages((prev) => [...prev, data]);
    });
    socket.on("decline_call", (data) => {
      console.log("decline call");
      console.log({ data, targetUser });
      if (channelId === data.channelId) {
        setCalling(false);
        console.log("decline call....");
        // if (targetUser)
        toast.error(`${targetUser?.fullName} declined the call`);
      }
    });

    socket.on("accept_call", (data) => {
      console.log("accept call");
      console.log({ data, targetUser });
      if (channelId === data.channelId) {
        // setCalling(false);
        console.log({ callUrl });
        console.log("accept call....", callUrl);
        window.location.href = callUrl;
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("decline_call");
      socket.off("accept_call");
    };
  }, [authUser, messagesInDB, targetUser, callUrl, targetUser]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    console.log({ messages });
  }, [messages]);

  return (
    <div className="flex w-full h-full justify-center items-center">
      <div className="p-2 flex flex-col container gap-4 h-[80vh]">
        <div className="flex w-full justify-between items-center">
          <div className="flex justify-start gap-3">
            <div className="avatar">
              <div className="w-9 rounded-full">
                <img
                  src={targetUser?.profilePic}
                  alt="User Avatar"
                  rel="noreferrer"
                />
              </div>
            </div>
            <h2 className=" text-xl font-semibold capitalize">
              {targetUser?.fullName}
            </h2>
          </div>
          <div className="flex gap-2">
            <CallButton
              absolute={false}
              handleVideoCall={handleVideoCall}
              calling={calling}
            />
            {calling && (
              <button
                className=" bg-red-600 p-1 px-3 rounded-lg text-white"
                onClick={() => {
                  setCalling(false);
                  socket.emit("cancel_call", { channelId });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        <div
          ref={scrollRef}
          className="flex-1 w-full rounded-md border-solid border-primary border gap-1 flex flex-col p-4 max-h-* overflow-y-auto"
        >
          {messages?.map((message, index) => {
            if (index + 1 < messages.length) {
              const timeDiff = dayjs(messages[index + 1]?.time).diff(
                dayjs(message.time),
                "minute"
              );
            }

            return (
              <Message
                data={message}
                currentUser={authUser}
                showTime={
                  index + 1 === messages.length
                    ? true
                    : messages[index + 1]?.authUser._id !==
                        message.authUser._id ||
                      dayjs(messages[index + 1]?.time).diff(
                        dayjs(message.time),
                        "minute"
                      ) > 2
                }
                key={index}
              />
            );
          })}
        </div>
        <form className=" join" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full p-2 border  rounded-md join-item input input-primary focus:outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="btn btn-primary join-item" type="submit">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default SocketChatPage;

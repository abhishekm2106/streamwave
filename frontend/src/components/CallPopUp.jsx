import React, { useEffect, useRef } from "react";
import { socket } from "../socket";

const CallPopUp = ({ call, setCall, channelId }) => {
  const audioRef = useRef(null);
  useEffect(() => {
    const audio = audioRef.current;

    const tryPlay = () => {
      audio.play().catch(() => {
        // If autoplay fails, wait for user interaction
        const resumePlay = () => {
          audio.play();
        };
        document.addEventListener("click", resumePlay, { once: true });
      });
    };

    tryPlay();

    let timeOutId = setTimeout(() => {
      socket.emit("timeout_declined", { channelId });
      setCall(null);
    }, 20000);

    return () => {
      clearTimeout(timeOutId);
      audio.pause();
    };
  }, []);
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-2xl">
      <audio ref={audioRef} src="/ringtone.mp3" loop />
      <div className="card-body p-8 flex flex-col items-center justify-center ">
        <div className="avatar size-24">
          <img src={call.authUser.profilePic} />
        </div>
        <h1>{call.authUser.fullName} is Calling... </h1>
        <div className="flex gap-2 mt-6">
          <button
            className="btn bg-green-700 text-white"
            onClick={() => {
              setCall(null);
              socket.emit("accept_call", { channelId });
              window.location.href = call.callUrl;
            }}
          >
            Accept
          </button>
          <button
            className="btn bg-red-700 text-white"
            onClick={() => {
              setCall(null);
              socket.emit("decline_call", { channelId });
            }}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallPopUp;

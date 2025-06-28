import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall, absolute = true, calling }) {
  return (
    <div
      className={`${
        absolute &&
        "p-3 border-b flex items-center justify-end max-w-7xl mx-auto w-full absolute top-0"
      } `}
    >
      <button
        onClick={handleVideoCall}
        className="btn btn-success btn-sm text-white"
      >
        <VideoIcon className="size-6" />
        {calling && <div className="text-sm text-white">Calling...</div>}
      </button>
    </div>
  );
}

export default CallButton;

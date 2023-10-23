import React, { useEffect, useState } from "react";
import Avatar from "../common/Avatar";
import { MdCall, MdCallEnd, MdVideocam } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { GET_USER_URL } from "@/utils/ApiRoutes";
import {
  CallStates,
  CallTypes,
  setCallState,
  setRoomId,
} from "@/features/call/callSlice";
import { useSocket } from "@/context/SocketContext";
import { mediaDevices } from "@/utils/MediaDevices";

function IncomingCall() {
  const user = useSelector((state) => state.user.user);
  const peerId = useSelector((state) => state.call.peerId);
  const callType = useSelector((state) => state.call.callType);
  const dispatch = useDispatch();

  const socket = useSocket();

  const [peerData, setPeerData] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let timeoutId;
    timeoutId = setTimeout(() => {
      setMounted(true);
    }, 50);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    // Fetch peer data
    if (mounted && peerId) {
      const fetchPeerData = async () => {
        const { data } = await axios.get(`${GET_USER_URL}?id=${peerId}`);
        setPeerData(data.data);
      };
      fetchPeerData();
    }
  }, [peerId, mounted]);

  const handleAnswer = () => {
    // Answer the call
    mediaDevices()
      ?.getUserMedia({ video: callType === CallTypes.VIDEO, audio: true })
      .then(() => {
        socket.current.emit("callAccept", { toId: peerId });
        dispatch(setCallState(CallStates.ONGOING));
      })
      .catch((err) => {
        console.log(err);
        socket.current.emit("callReject", { toId: peerId });
      });
  };

  const handleReject = () => {
    // Reject the call
    socket.current.emit("callReject", { toId: peerId });
    dispatch(setCallState(CallStates.AVAILABLE));
  };

  return (
    <div
      className="absolute bottom-20 right-0 p-3 border-2 border-icon-green rounded bg-conversation-panel-background transition-transform duration-300 pointer-events-auto flex justify-start gap-4 w-64"
      style={{
        transform: mounted ? "translateX(-10%)" : "translateX(100%)",
      }}
    >
      <Avatar type="lg" image={peerData?.profileImg} noHover noBorder />
      <div className="flex flex-col gap-3 items-start w-full overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-xl">
            {callType === CallTypes.VIDEO ? <MdVideocam /> : <MdCall />}
          </span>
          <span className="text-lg whitespace-nowrap">
            {peerData?.name || "Unknown"}
          </span>
        </div>
        <div className="w-full flex justify-around">
          <button
            className="bg-icon-green p-2 rounded-full"
            onClick={handleAnswer}
          >
            <MdCall className="text-white text-2xl" />
          </button>
          <button
            className="bg-red-500 p-2 rounded-full"
            onClick={handleReject}
          >
            <MdCallEnd className="text-white text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCall;

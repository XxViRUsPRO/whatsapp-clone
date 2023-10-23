import { CallStates, CallTypes, setCallState } from "@/features/call/callSlice";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdCallEnd } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../common/Avatar";
import { useSocket } from "@/context/SocketContext";
import axios from "axios";
import { GET_USER_URL } from "@/utils/ApiRoutes";
import { mediaDevices } from "@/utils/MediaDevices";

function createPeerConnection(iceCandidateHandler, trackHandler) {
  const peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
  });

  peerConnection.onicecandidate = iceCandidateHandler;
  peerConnection.ontrack = trackHandler;
  return peerConnection;
}

function OngoingCall() {
  const user = useSelector((state) => state.user.user);
  const { callState, callType, peerId, roomId } = useSelector(
    (state) => state.call
  );
  const dispatch = useDispatch();

  const localElm = useRef();
  const remoteElm = useRef();
  const localStream = useRef();
  const host = useRef(false);
  const peerConnection = useRef(null);
  const socket = useSocket();
  const socketInit = useRef(false);

  const [peerData, setPeerData] = useState({});

  const stateMessage = {
    [CallStates.OUTGOING]: "Calling...",
    [CallStates.ENDED]: "Call ended",
    [CallStates.REJECTED]: "Call rejected",
  };

  const handleEndCall = () => {
    handleLeaveRoom().then(() => {
      socket.current.emit("callEnd", { fromId: user.id, toId: peerId });
      dispatch(setCallState(CallStates.AVAILABLE));
    });
  };

  // WebRTC
  const handleRoomCreated = () => {
    host.current = true;
    mediaDevices()
      ?.getUserMedia({
        video: callType === CallTypes.VIDEO && { width: 1280, height: 720 },
        audio: true,
      })
      .then((stream) => {
        localStream.current = stream;
        if (callType === CallTypes.VIDEO) {
          localElm.current.srcObject = stream;
          localElm.current.onloadedmetadata = () => {
            localElm.current.play();
          };
        }
      })
      .catch((err) => console.log(err));
  };

  const handleRoomJoined = () => {
    mediaDevices()
      ?.getUserMedia({
        video: callType === CallTypes.VIDEO && { width: 1280, height: 720 },
        audio: true,
      })
      .then((stream) => {
        localStream.current = stream;
        if (callType === CallTypes.VIDEO) {
          localElm.current.srcObject = stream;
          localElm.current.onloadedmetadata = () => {
            localElm.current.play();
          };
        }
        socket.current.emit("ready", roomId);
      })
      .catch((err) => console.log(err));
  };

  const handleReady = () => {
    if (host.current) {
      peerConnection.current = createPeerConnection(
        handleCandidateEvent,
        handleTrack
      );
      localStream.current.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream.current);
      });
      peerConnection.current
        .createOffer()
        .then((offer) => {
          peerConnection.current.setLocalDescription(offer);
          socket.current.emit("offer", offer, roomId);
        })
        .catch((err) => console.log(err));
    }
  };

  const handlePeerLeave = () => {
    host.current = true;
    if (remoteElm.current?.srcObject) {
      remoteElm.current.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (peerConnection.current) {
      peerConnection.current.ontrack = null;
      peerConnection.current.onicecandidate = null;
      peerConnection.current.close();
      peerConnection.current = null;
    }
  };

  const handleLeaveRoom = async () => {
    socket.current.emit("leave", roomId);

    if (localElm.current?.srcObject) {
      localElm.current.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (remoteElm.current?.srcObject) {
      remoteElm.current.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (peerConnection.current) {
      peerConnection.current.ontrack = null;
      peerConnection.current.onicecandidate = null;
      peerConnection.current.close();
      peerConnection.current = null;
    }

    socket.current.off("callAccepted");
    socket.current.off("callRejected");
    socket.current.off("callEnded");
    socket.current.off("created");
    socket.current.off("joined");
    socket.current.off("ready");
    socket.current.off("leave");
    socket.current.off("offer");
    socket.current.off("answer");
    socket.current.off("ice-candidate");

    socket.current.emit("callEnd", { fromId: user.id, toId: peerId });

    socketInit.current = false;
  };

  const handleOffer = (offer) => {
    if (!host.current) {
      peerConnection.current = createPeerConnection(
        handleCandidateEvent,
        handleTrack
      );
      localStream.current.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream.current);
      });
      peerConnection.current.setRemoteDescription(offer);
      peerConnection.current
        .createAnswer()
        .then((answer) => {
          peerConnection.current.setLocalDescription(answer);
          socket.current.emit("answer", answer, roomId);
        })
        .catch((err) => console.log(err));
    }
  };

  const handleAnswer = (answer) => {
    peerConnection.current.setRemoteDescription(answer).catch((err) => {
      console.log(err);
    });
  };

  const handleCandidateEvent = (event) => {
    if (event.candidate) {
      socket.current.emit("ice-candidate", event.candidate, roomId);
    }
  };

  const handleNewCandidate = (candidate) => {
    const newCandidate = new RTCIceCandidate(candidate);
    peerConnection.current.addIceCandidate(newCandidate).catch((err) => {
      console.log(err);
    });
  };

  const handleTrack = (event) => {
    remoteElm.current.srcObject = event.streams[0];
  };

  const handleCallAccepted = () => {
    dispatch(setCallState(CallStates.ONGOING));
  };

  const handleCallRejected = async (data) => {
    if (data?.reason) stateMessage[CallStates.REJECTED] = data.reason;
    dispatch(setCallState(CallStates.REJECTED));
    await handleLeaveRoom();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch(setCallState(CallStates.AVAILABLE));
  };

  const handleCallEnded = async () => {
    dispatch(setCallState(CallStates.ENDED));
    await handleLeaveRoom();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch(setCallState(CallStates.AVAILABLE));
  };

  useEffect(() => {
    // Fetch peer data
    if (peerId) {
      const fetchPeerData = async () => {
        const { data } = await axios.get(`${GET_USER_URL}?id=${peerId}`);
        setPeerData(data.data);
      };
      fetchPeerData();
    }
  }, [peerId]);

  useEffect(() => {
    if (!socketInit.current && socket.current) {
      socketInit.current = true;

      // Join room
      socket.current.emit("join", roomId);

      // Call events
      socket.current.on("callAccepted", handleCallAccepted);
      socket.current.on("callRejected", handleCallRejected);
      socket.current.on("callEnded", handleCallEnded);

      // Room events
      socket.current.on("created", handleRoomCreated);
      socket.current.on("joined", handleRoomJoined);
      socket.current.on("ready", handleReady);
      socket.current.on("leave", handlePeerLeave);

      // Webrtc events
      socket.current.on("offer", handleOffer);
      socket.current.on("answer", handleAnswer);
      socket.current.on("ice-candidate", handleNewCandidate);
    }
  }, [socket.current]);

  return (
    <div className="absolute inset-0 bg-conversation-panel-background pointer-events-auto">
      <div className="flex flex-col justify-center items-center h-[100vh]">
        {callType === CallTypes.VIDEO ? (
          callState === CallStates.ONGOING && (
            <video
              ref={remoteElm}
              className="w-full h-1/2 object-cover"
              autoPlay
              playsInline
            />
          )
        ) : (
          <audio ref={remoteElm} autoPlay />
        )}
        {(callType !== CallTypes.VIDEO ||
          !(callState === CallStates.ONGOING)) && (
          <div className="relative w-full h-1/2 overflow-hidden">
            <Avatar
              type={"2xl"}
              image={peerData.profileImg}
              className="absolute inset-0"
              noBorder
              noHover
            />
            {callState === CallStates.OUTGOING && (
              <Avatar
                type={"2xl"}
                image={peerData.profileImg}
                className="absolute inset-0 animate-ping"
                noBorder
                noHover
              />
            )}
          </div>
        )}
        {callType === CallTypes.VIDEO &&
          callState !== CallStates.ENDED &&
          callState !== CallStates.REJECTED && (
            <video
              ref={localElm}
              className="w-full h-1/2 object-cover"
              muted
              autoPlay
              playsInline
            />
          )}
      </div>
      <div className="absolute bottom-10 right-1/2 translate-x-1/2 flex flex-col items-center">
        <span
          className={`mb-6 text-xl ${
            callState === CallStates.OUTGOING ? "animate-pulse" : ""
          }`}
        >
          {stateMessage[callState]}
        </span>
        <button className="bg-red-500 p-2 rounded-full" onClick={handleEndCall}>
          <MdCallEnd className="text-white text-4xl" />
        </button>
      </div>
    </div>
  );
}

export default OngoingCall;

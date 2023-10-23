import React, { useState } from "react";
import Avatar from "@/components/common/Avatar";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdCall, IoMdVideocam, IoMdSearch } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import {
  CallTypes,
  CallStates,
  setCallState,
  setCallType,
  setPeerId,
  setRoomId,
} from "@/features/call/callSlice";
import { useSocket } from "@/context/SocketContext";
import { filterMessages } from "@/features/messages/messagesSlice";
import { mediaDevices } from "@/utils/MediaDevices";
import ContextMenu from "../common/ContextMenu";
import { setCurrentChat } from "@/features/chat/chatSlice";

function ChatHeader() {
  const user = useSelector((state) => state.user.user);
  const currentChat = useSelector((state) => state.chat.currentChat);
  const callState = useSelector((state) => state.call.callState);
  const dispatch = useDispatch();

  const socket = useSocket();

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowContextMenu(true);
    setContextMenuPosition({ x: e.pageX, y: e.pageY });
  };

  const contextMenuOptions = [
    {
      name: "Exit",
      callback: () => {
        dispatch(setCurrentChat({}));
      },
    },
  ];

  const handleVoiceCall = () => {
    mediaDevices()
      ?.getUserMedia({
        audio: true,
        video: false,
      })
      .then(() => {
        const roomId = `${user.id}-${currentChat.id}`;
        dispatch(setPeerId(currentChat.id));
        dispatch(setRoomId(roomId));
        dispatch(setCallType(CallTypes.VOICE));
        dispatch(setCallState(CallStates.OUTGOING));
        socket.current.emit("callOut", {
          fromId: user.id,
          toId: currentChat.id,
          roomId: roomId,
          type: CallTypes.VOICE,
        });
      })
      .catch((err) => console.log(err));
  };

  const handleVideoCall = () => {
    mediaDevices()
      ?.getUserMedia({
        audio: true,
        video: true,
      })
      .then(() => {
        const roomId = `${user.id}-${currentChat.id}`;
        dispatch(setPeerId(currentChat.id));
        dispatch(setRoomId(roomId));
        dispatch(setCallType(CallTypes.VIDEO));
        dispatch(setCallState(CallStates.OUTGOING));
        socket.current.emit("callOut", {
          fromId: user.id,
          toId: currentChat.id,
          roomId: roomId,
          type: CallTypes.VIDEO,
        });
      })
      .catch((err) => console.log(err));
  };

  const handleSearchMessages = (e) => {
    dispatch(filterMessages(e.target.value));
  };

  return (
    <>
      <div className="px-4 py-3 flex justify-between items-center bg-icon-green border-l-2 border-conversation-panel-background h-[64px]">
        <div className="flex justify-center items-center gap-4 text-gray-800 font-semibold text-lg">
          <Avatar
            type="sm"
            image={currentChat?.profileImg}
            className="cursor-pointer hover:scale-110 duration-150"
            noHover
            noBorder
          />
          <div className="flex flex-col">
            <span className="truncate">{currentChat?.name}</span>
            <span className="text-xs">offline</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-2xl">
          <button
            title="Voice Call"
            className={`${
              callState > 0 ? "opacity-50" : "hover:scale-110 duration-150"
            }`}
            onClick={handleVoiceCall}
            disabled={callState > 0}
          >
            <IoMdCall className="pointer-events-none" />
          </button>
          <button
            title="Video Call"
            className={`${
              callState > 0 ? "opacity-50" : "hover:scale-110 duration-150"
            }`}
            onClick={handleVideoCall}
            disabled={callState > 0}
          >
            <IoMdVideocam className="pointer-events-none" />
          </button>
          <div className="flex justify-center items-center gap-1 border-2 border-opacity-0 focus-within:border-opacity-100 focus-within:px-1 rounded-full border-gray-800 transition-all duration-150">
            <button
              title="Search"
              className="peer hover:scale-110 duration-150"
            >
              <IoMdSearch className="pointer-events-none" />
            </button>
            <input
              type="text"
              placeholder="Search"
              className="w-0 peer-focus:w-[14vw] focus:w-[14vw] 
        outline-none [&:not(:placeholder-shown)]:w-[14vw] transition-all duration-300 bg-transparent text-lg placeholder:text-white placeholder:text-opacity-50"
              onChange={handleSearchMessages}
            />
          </div>
          <button
            title="More"
            className="hover:scale-110 duration-150"
            onClick={handleContextMenu}
          >
            <BsThreeDotsVertical className="pointer-events-none" />
          </button>
        </div>
        {showContextMenu && (
          <ContextMenu
            options={contextMenuOptions}
            setVisibility={setShowContextMenu}
            positionMode="fixed"
            position={contextMenuPosition}
            zIndex={999}
          />
        )}
      </div>
    </>
  );
}

export default ChatHeader;

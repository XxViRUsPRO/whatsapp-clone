import React, { useState } from "react";
import Avatar from "@/components/common/Avatar";
import { useSelector, useDispatch } from "react-redux";
import { setNewChat } from "@/features/chat/chatSlice";
import { BsFillChatLeftTextFill, BsThreeDotsVertical } from "react-icons/bs";
import ContextMenu from "../common/ContextMenu";
import { useRouter } from "next/router";
import { useSocket } from "@/context/SocketContext";

function ChatListHeader() {
  const router = useRouter();
  const user = useSelector((state) => state.user.user);
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
      name: "Logout",
      callback: () => {
        socket.current.disconnect();
        router.push("/logout");
      },
    },
  ];

  const handleNewChat = () => {
    dispatch(setNewChat(true));
  };

  return (
    <>
      <div className="px-4 py-3 flex justify-between items-center bg-icon-green h-[64px]">
        <div className="flex justify-center items-center gap-4 text-gray-800 font-semibold text-lg">
          <Avatar
            type="sm"
            image={user?.profileImg}
            className="cursor-pointer hover:scale-110 duration-150"
            noHover
            noBorder
          />
          <span className="overflow-hidden overflow-ellipsis leading-[32px] h-[64px] w-16">
            {user?.name}
          </span>
        </div>
        <div className="flex gap-4 text-gray-800 font-semibold text-2xl">
          <BsFillChatLeftTextFill
            className="cursor-pointer hover:scale-110 duration-150"
            title="New Chat"
            onClick={handleNewChat}
          />
          <BsThreeDotsVertical
            className="cursor-pointer hover:scale-110 duration-150"
            title="More"
            onClick={handleContextMenu}
          />
        </div>
      </div>
      {showContextMenu && (
        <ContextMenu
          options={contextMenuOptions}
          setVisibility={setShowContextMenu}
          position={contextMenuPosition}
        />
      )}
    </>
  );
}

export default ChatListHeader;

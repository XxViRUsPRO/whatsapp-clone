import React, { useEffect } from "react";
import { calculateTime } from "@/utils/CalculateTime";
import MessageStatus from "../common/MessageStatus";
import ImageMessage from "./ImageMessage";
import dynamic from "next/dynamic";
import { BASE_URL } from "@/utils/ApiRoutes";
import Avatar from "../common/Avatar";
import { FaQuestion } from "react-icons/fa";
import { BsFillChatLeftTextFill } from "react-icons/bs";
import { useSelector } from "react-redux";

const VoiceMessage = dynamic(() => import("./VoiceMessage"), {
  ssr: false,
});

const handleOtherMessageClick = (fileName) => {
  // Download the file
  const link = document.createElement("a");
  link.href = `${BASE_URL}/uploads/other/${fileName}`;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

function ChatContainer() {
  const user = useSelector((state) => state.user.user);
  const currentChat = useSelector((state) => state.chat.currentChat);
  const messages = useSelector((state) => state.messages.messages);
  const filteredMessages = useSelector(
    (state) => state.messages.filteredMessages
  );
  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [messages]);
  let messagesToRender;
  if (filteredMessages === null) {
    messagesToRender = messages;
  } else messagesToRender = filteredMessages.length ? filteredMessages : [];
  return (
    <div className="relative z-[1] flex-auto h-[50vh]">
      <div className="absolute -z-[1] inset-0 bg-chat-background bg-fixed opacity-10" />
      <div
        id="chat-container"
        className="flex flex-col gap-2 p-2 overflow-y-auto h-full custom-scrollbar"
      >
        {messagesToRender.length ? (
          messagesToRender.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col p-2 rounded-md ${
                message.senderId === user?.id
                  ? "self-end bg-outgoing-background"
                  : "self-start bg-incoming-background"
              }`}
            >
              {message.type === "text" && (
                <span className="select-text">{message.text}</span>
              )}
              {message.type === "image" && (
                <ImageMessage
                  src={`${BASE_URL}/uploads/image/${message.text}`}
                />
              )}
              {message.type === "audio" && (
                <div className="flex justify-center items-center">
                  <Avatar
                    type="sm"
                    image={
                      message.senderId === user?.id
                        ? user?.profileImg
                        : currentChat?.profileImg
                    }
                    noHover
                    noBorder
                  />
                  <VoiceMessage
                    src={`${BASE_URL}/uploads/audio/${message.text}`}
                  />
                </div>
              )}
              {message.type === "other" && (
                <div
                  className={`flex justify-between items-center gap-2 p-2 border-2 border-icon-green rounded-lg cursor-pointer hover:scale-95 duration-150 ${
                    message.senderId === user?.id
                      ? "flex-row"
                      : "flex-row-reverse"
                  }`}
                  onClick={() => handleOtherMessageClick(message.text)}
                >
                  <span>{message.text}</span>
                  <span className="bg-icon-green rounded-full p-2">
                    <FaQuestion />
                  </span>
                </div>
              )}
              <div className="flex justify-end min-w-[6rem]">
                <span className="text-xs text-gray-400">
                  {calculateTime(message.createdAt)}
                </span>
                <span>
                  <MessageStatus status={message.status} />
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center">
            {filteredMessages === null ? (
              <>
                <BsFillChatLeftTextFill className="text-9xl mb-3" />
                <p className="text-2xl mb-8">Start a new conversation</p>
              </>
            ) : (
              <>
                <FaQuestion className="text-9xl mb-3" />
                <p className="text-2xl mb-8">No messages found</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatContainer;

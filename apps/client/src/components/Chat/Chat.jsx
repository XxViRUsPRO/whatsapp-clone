import React from "react";
import MessageBar from "./MessageBar";
import ChatContainer from "./ChatContainer";
import ChatHeader from "./ChatHeader";

function Chat() {
  return (
    <div className="relative col-span-4 flex flex-col bg-conversation-panel-background max-h-screen">
      <ChatHeader />
      <ChatContainer />
      <MessageBar />
    </div>
  );
}

export default Chat;

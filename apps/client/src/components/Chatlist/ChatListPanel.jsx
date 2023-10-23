import React from "react";
import ChatListHeader from "./ChatListHeader";
import ContactsListHeader from "./ContactsListHeader";
import ContactsList from "./ContactsList";
import ChatList from "./ChatList";
import { useSelector } from "react-redux";

function ChatListPanel() {
  const newChat = useSelector((state) => state.chat.newChat);

  return (
    <div className="col-span-2 flex flex-col bg-input-background">
      {newChat ? <ContactsListHeader /> : <ChatListHeader />}
      {newChat ? <ContactsList /> : <ChatList />}
    </div>
  );
}

export default ChatListPanel;

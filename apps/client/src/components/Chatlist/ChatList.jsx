import React from "react";
import List from "./List";
import { useSelector } from "react-redux";
import ChatItem from "./ChatItem";
import SearchBar from "./SearchBar";
import { useDispatch } from "react-redux";
import { filterChats } from "@/features/chat/chatSlice";
import { setNewChat } from "@/features/chat/chatSlice";
import { HiNoSymbol } from "react-icons/hi2";

function ChatList() {
  const user = useSelector((state) => state.user.user);
  const filteredChats = useSelector((state) => state.chat.filteredChats);
  const dispatch = useDispatch();

  const handleFilter = (e) => {
    const { value } = e.target;
    dispatch(filterChats(value));
  };

  return (
    <>
      <SearchBar onChange={handleFilter} />
      {filterChats ? (
        <List>
          {Object.values(filteredChats).map(
            ({
              id,
              senderId,
              receiverId,
              text: lastMessage,
              type,
              status,
              createdAt: time,
            }) => (
              <ChatItem
                key={id}
                userId={senderId === user?.id ? receiverId : senderId}
                lastMessage={lastMessage}
                type={type}
                status={status}
                time={time}
              />
            )
          )}
        </List>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center">
          <HiNoSymbol className="text-9xl mb-3" />
          <p className="text-2xl mb-8">No chats found</p>
          <button
            className="p-3 text-lg bg-icon-green rounded"
            onClick={() => {
              dispatch(setNewChat(true));
            }}
          >
            Start a new chat
          </button>
        </div>
      )}
    </>
  );
}

export default ChatList;

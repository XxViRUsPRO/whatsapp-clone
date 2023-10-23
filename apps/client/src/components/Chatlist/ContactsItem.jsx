import React from "react";
import Avatar from "@/components/common/Avatar";
import { useSelector, useDispatch } from "react-redux";
import { setNewChat, setCurrentChat } from "@/features/chat/chatSlice";

function ContactsListItem({ id, name, image, about }) {
  const user = useSelector((state) => state.user.user);
  const currentChat = useSelector((state) => state.chat.currentChat);
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(setCurrentChat({ id, name, profileImg: image }));
    dispatch(setNewChat(false));
  };

  return (
    <div
      className="flex justify-center items-center gap-4 px-4 py-2 hover:bg-background-default-hover  cursor-pointer"
      onClick={handleClick}
    >
      <Avatar type="sm" image={image} noHover noBorder />
      <div className="flex-1 flex flex-col ml-2">
        <span className="text-lg text-gray-400">{name}</span>
        <span className="text-sm">{about || "\u00A0"}</span>
      </div>
    </div>
  );
}

export default ContactsListItem;

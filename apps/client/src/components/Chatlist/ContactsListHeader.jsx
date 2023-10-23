import React from "react";
import { BsArrowLeft } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { setNewChat } from "@/features/chat/chatSlice";

function ContactsListHeader() {
  const dispatch = useDispatch();

  const handleBack = () => {
    dispatch(setNewChat(false));
  };

  return (
    <div className="px-4 py-3 flex justify-start items-center gap-4 bg-icon-green text-gray-800 font-semibold text-2xl h-[64px]">
      <BsArrowLeft
        className="h-10 cursor-pointer hover:scale-110 duration-150"
        title="Back"
        onClick={handleBack}
      />
      <span>New Chat</span>
    </div>
  );
}

export default ContactsListHeader;

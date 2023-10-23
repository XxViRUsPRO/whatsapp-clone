import React, { useEffect, useState } from "react";
import Avatar from "@/components/common/Avatar";
import axios from "axios";
import { GET_USER_URL } from "@/utils/ApiRoutes";
import { useDispatch } from "react-redux";
import { setCurrentChat } from "@/features/chat/chatSlice";

function ChatItem({ userId, lastMessage, type, status, time }) {
  const dispatch = useDispatch();
  const [userInfo, setUserInfo] = useState({});
  useEffect(() => {
    const getUserInfo = async () => {
      const {
        data: { data },
      } = await axios.get(`${GET_USER_URL}?id=${userId}`);
      setUserInfo(data);
    };
    getUserInfo();
  }, [userId]);
  const date = new Date(time);

  const handleClick = () => {
    dispatch(
      setCurrentChat({
        id: userId,
        name: userInfo?.name,
        profileImg: userInfo?.profileImg,
        about: userInfo?.about,
      })
    );
  };

  return (
    <div
      className="flex justify-center items-center px-4 py-2 hover:bg-background-default-hover  cursor-pointer"
      onClick={handleClick}
    >
      <Avatar type="sm" image={userInfo?.profileImg} noHover noBorder />
      <div className="flex-1 flex flex-col ml-2">
        <span className="text-sm text-gray-400">{userInfo?.name}</span>
        <span className="text-md">{lastMessage}</span>
        <span className="text-xs self-end">{`${date.getHours()}:${date.getMinutes()} ${
          date.getHours() > 12 ? "PM" : "AM"
        } ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`}</span>
      </div>
    </div>
  );
}

export default ChatItem;

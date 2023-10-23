import React, { useEffect, useRef, useState } from "react";
import { IoMdSend, IoMdHappy, IoMdAttach } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa";
import axios from "axios";
import {
  CREATE_MESSAGE_URL,
  CREATE_MEDIA_MESSAGE_URL,
} from "@/utils/ApiRoutes";
import EmojiPicker from "emoji-picker-react";
import PhotoPicker from "../common/PhotoPicker";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "@/features/messages/messagesSlice";
import { useSocket } from "@/context/SocketContext";

const CaptureAudio = dynamic(() => import("../common/CaptureAudio"), {
  ssr: false,
});

function MessageBar() {
  const user = useSelector((state) => state.user.user);
  const currentChat = useSelector((state) => state.chat.currentChat);
  const socket = useSocket();
  const dispatch = useDispatch();

  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploadPhoto, setUploadPhoto] = useState(false);
  const [audioRecord, setAudioRecord] = useState(false);

  const emojiPickerRef = useRef(null);
  useEffect(() => {
    if (uploadPhoto) {
      const element = document.getElementById("photo-picker");
      element.click();
      document.body.onfocus = () => {
        setTimeout(() => {
          setUploadPhoto(false);
        }, 50);
      };
    }
  }, [uploadPhoto]);
  const handlePhotoChange = async (e) => {
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("from", user?.id);
      formData.append("to", currentChat?.id);
      const { data } = await axios.post(CREATE_MEDIA_MESSAGE_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (data.status) {
        socket.current.emit("messageOut", data.data);
        dispatch(addMessage(data.data));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      const { data } = await axios.post(CREATE_MESSAGE_URL, {
        message,
        from: user?.id,
        to: currentChat?.id,
      });
      socket.current.emit("messageOut", data.data);
      dispatch(addMessage(data.data));
    } catch (err) {
      console.log(err);
    } finally {
      setMessage("");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmojiModal = () => {
    setShowEmoji(!showEmoji);
  };

  const handleEmojiClick = (e) => {
    setMessage((prev) => prev + e.emoji);
  };

  return (
    <div
      className="relative p-3 bg-panel-header-background flex gap-2 h-[64px]"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          sendMessage();
        }
      }}
    >
      {!audioRecord && (
        <>
          <button
            className="p-2 rounded-full bg-icon-green"
            onClick={handleEmojiModal}
          >
            <IoMdHappy className="text-2xl" title="Emoji" />
          </button>
          {showEmoji && (
            <div
              className="absolute bottom-16 -left-4 z-10"
              ref={emojiPickerRef}
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
            </div>
          )}
          <button
            className="p-2 rounded-full bg-icon-green"
            onClick={() => setUploadPhoto(true)}
          >
            <IoMdAttach className="text-2xl" title="Attach" />
          </button>
          <input
            type="text"
            className="flex-1 p-2 rounded-full bg-conversation-panel-background outline-none"
            placeholder="Type a message..."
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          />
          {message?.length === 0 ? (
            <button
              className="p-2 rounded-full bg-icon-green"
              onClick={() => setAudioRecord(true)}
            >
              <FaMicrophone className="text-2xl" title="Voice Record" />
            </button>
          ) : (
            <button
              className="p-2 rounded-full bg-icon-green"
              onClick={sendMessage}
            >
              <IoMdSend className="text-2xl" title="Send" />
            </button>
          )}
        </>
      )}
      {uploadPhoto && <PhotoPicker onChange={handlePhotoChange} />}
      {audioRecord && <CaptureAudio setVisibility={setAudioRecord} />}
    </div>
  );
}

export default MessageBar;

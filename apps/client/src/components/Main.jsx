import React, { useEffect, useRef, useState } from "react";
import Empty from "./Empty";
import Chat from "./Chat/Chat";
import ChatListPanel from "./Chatlist/ChatListPanel";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "@/features/messages/messagesSlice";
import { setChats } from "@/features/chat/chatSlice";
import { setMessages } from "@/features/messages/messagesSlice";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { auth } from "@/utils/FirebaseConfig";
import axios from "axios";
import {
  BASE_URL,
  CHECK_USER_URL,
  GET_CHATS_URL,
  GET_MESSAGES_URL,
} from "@/utils/ApiRoutes";
import { io } from "socket.io-client";
import { setUser } from "@/features/user/userSlice";
import { SocketProvider } from "@/context/SocketContext";
import CallContainer from "./Call/CallContainer";
import {
  CallStates,
  setCallState,
  setCallType,
  setPeerId,
  setRoomId,
} from "@/features/call/callSlice";

function Main() {
  const router = useRouter();

  const user = useSelector((state) => state.user.user);
  const currentChat = useSelector((state) => state.chat.currentChat);
  const callState = useSelector((state) => state.call.callState);
  const dispatch = useDispatch();

  const [redirect, setRedirect] = useState(false);
  const [socketEvent, setSocketEvent] = useState(false);

  const socket = useRef(null);

  useEffect(() => {
    if (redirect) router.push("/login");
  }, [redirect]);

  useEffect(() => {
    if (socket.current && !socketEvent) {
      socket.current.on("userAdded", ({ id }) => {});

      socket.current.on("messageIn", (message) => {
        dispatch(addMessage(message));
      });

      setSocketEvent(true);
    }
  }, [socket.current]);

  useEffect(() => {
    // Handler that is called when the call state changes
    if (socket.current) {
      if (callState === CallStates.AVAILABLE) {
        socket.current.on("callIn", ({ peerId, roomId, type }) => {
          dispatch(setPeerId(peerId));
          dispatch(setCallType(type));
          dispatch(setRoomId(roomId));
          dispatch(setCallState(CallStates.INCOMING));
        });
      } else {
        socket.current.off("callIn");
        socket.current.on("callEnded", () => {
          dispatch(setPeerId(null));
          dispatch(setCallType(null));
          dispatch(setRoomId(null));
          dispatch(setCallState(CallStates.AVAILABLE));
        });
      }
    }
  }, [socket.current, callState]);

  useEffect(() => {
    if (user?.id && !socket.current) {
      socket.current = io(BASE_URL, {
        transports: ["websocket"],
      });
      socket.current.on("connect", () => {
        console.log("connected");
        socket.current.emit("addUser", { id: user.id });
      });
      socket.current.on("*", (event) => {
        console.log(event);
      });
    }

    const getChats = async () => {
      const { data } = await axios.post(GET_CHATS_URL, {
        id: user?.id,
      });
      dispatch(setChats(data.data));
    };
    if (user?.id) {
      getChats();
    }
  }, [user]);

  useEffect(() => {
    const getMessages = async () => {
      const { data } = await axios.post(GET_MESSAGES_URL, {
        from: user?.id,
        to: currentChat?.id,
      });
      dispatch(setMessages(data.data));
    };
    if (user?.id && currentChat?.id) {
      getMessages();
    }
  }, [currentChat]);

  onAuthStateChanged(auth, async (currentUser) => {
    if (!currentUser) {
      setRedirect(true);
    }
    if (!user && currentUser?.email) {
      const { data } = await axios.post(CHECK_USER_URL, {
        email: currentUser.email,
      });
      if (!data.status) router.push("/login");
      if (data?.data) {
        const { id, name, email, about, profileImg } = data.data;
        dispatch(setUser({ id, name, email, about, profileImg }));
      }
    }
  });

  return (
    <SocketProvider socket={socket}>
      <div
        className={`grid grid-rows-1 h-screen w-screen max-h-screen bg-panel-header-background text-white overflow-hidden ${
          user ? "grid-cols-6" : "grid-cols-4"
        }`}
      >
        {callState > 0 && <CallContainer />}
        {user && <ChatListPanel />}
        {currentChat?.id ? <Chat /> : <Empty />}
      </div>
    </SocketProvider>
  );
}

export default Main;

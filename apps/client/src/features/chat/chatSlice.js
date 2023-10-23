import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: {},
  filteredChats: {},
  currentChat: {},
  newChat: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
      state.filteredChats = action.payload;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    setNewChat: (state, action) => {
      state.newChat = action.payload;
    },
    filterChats: (state, action) => {
      state.filteredChats = Object.fromEntries(
        Object.entries(state.chats).filter(([id, chat]) => {
          if (chat.text.toLowerCase().includes(action.payload.toLowerCase())) {
            return [id, chat];
          }
        })
      );
    },
  },
});

export const { setChats, setCurrentChat, setNewChat, filterChats } =
  chatSlice.actions;

export default chatSlice.reducer;

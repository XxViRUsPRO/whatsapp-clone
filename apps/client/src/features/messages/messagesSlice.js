import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  filteredMessages: null,
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages = [...state.messages, action.payload];
    },
    filterMessages: (state, action) => {
      if (action.payload === "") {
        state.filteredMessages = null;
        return;
      }
      state.filteredMessages = state.messages.filter((message) => {
        if (message.text.toLowerCase().includes(action.payload.toLowerCase())) {
          return message;
        }
      });
    },
  },
});

export const { setMessages, filterMessages, addMessage } =
  messagesSlice.actions;

export default messagesSlice.reducer;

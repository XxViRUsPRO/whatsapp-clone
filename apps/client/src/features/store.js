import { combineReducers, configureStore } from "@reduxjs/toolkit";
import messagesReducer from "./messages/messagesSlice";
import userReducer from "./user/userSlice";
import chatReducer from "./chat/chatSlice";
import callReducer from "./call/callSlice";

const appReducer = combineReducers({
  messages: messagesReducer,
  user: userReducer,
  chat: chatReducer,
  call: callReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "user/logout") {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

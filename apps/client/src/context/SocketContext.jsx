import { createContext, useContext } from "react";

const SocketContext = createContext();

export const SocketProvider = ({ children, socket }) => {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

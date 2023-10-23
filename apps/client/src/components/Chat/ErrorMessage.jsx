import React from "react";
import { MdError } from "react-icons/md";

function ErrorMessage({
  height,
  width,
  code = 404,
  message = "Something went wrong!",
}) {
  return (
    <div
      className="flex flex-col justify-center items-center border-2 border-red-500 rounded p-2"
      style={{ height, width }}
    >
      <div className="flex items-center gap-1 text-red-500 ">
        <MdError className="text-2xl" />
        <span className="text-xl">{code}</span>
      </div>
      <span className="text-white">{message}</span>
    </div>
  );
}

export default ErrorMessage;

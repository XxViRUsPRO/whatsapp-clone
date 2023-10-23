import React from "react";
import { BsCheck, BsCheckAll } from "react-icons/bs";

function MessageStatus({ status = "sent" }) {
  return (
    <>
      {status === "sent" && <BsCheck className="text-gray-400" />}
      {status === "delivered" && <BsCheckAll className="text-gray-400" />}
      {status === "read" && <BsCheckAll className="text-icon-green" />}
    </>
  );
}

export default MessageStatus;

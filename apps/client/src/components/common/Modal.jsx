import React from "react";
import { IoClose } from "react-icons/io5";

function Modal({ children, setVisibility, className = "" }) {
  return (
    <div
      className={`absolute inset-0 z-50 h-1/2 m-auto w-1/2 p-4 bg-neutral-950/90  backdrop-blur-sm overflow-hidden rounded-lg border-2 border-green-300 ${className}`}
    >
      <div
        className="fixed top-0 right-0 p-3 cursor-pointer text-green-300 bg-green-900 m-1 text-2xl hover:rotate-90 transition-transform duration-150 z-[100] rounded-full"
        onClick={() => setVisibility(false)}
      >
        <IoClose />
      </div>
      {children}
    </div>
  );
}

export default Modal;

import Image from "next/image";
import React, { useState, useEffect } from "react";
import ErrorMessage from "./ErrorMessage";
import { ImSpinner2 } from "react-icons/im";

function ImageMessage({ className = "", src }) {
  const [img, setImg] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchImage = async () => {
      const res = await fetch(src);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setImg(url);
      } else {
        setErrorCode(res.status);
        setErrorMessage(res.statusText);
      }
      setLoading(false);
    };
    fetchImage();
  }, [src]);

  return (
    <div className="bg-black/20 rounded">
      {loading ? (
        <div className="flex justify-center items-center h-[200px] w-[300px]">
          <ImSpinner2 className="animate-spin text-white text-3xl" />
        </div>
      ) : img !== "" ? (
        <Image
          className={className}
          src={img}
          alt="image"
          width={300}
          height={200}
        />
      ) : (
        <ErrorMessage
          width={300}
          height={200}
          code={errorCode}
          message={errorMessage}
        />
      )}
    </div>
  );
}

export default ImageMessage;

import React, { useEffect, useRef, useState } from "react";
import { mediaDevices } from "@/utils/MediaDevices";
import Modal from "./Modal";

function CapturePhoto({ setImage, setVisibility }) {
  const [message, setMessage] = useState("Loading...");
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    mediaDevices()
      ?.getUserMedia({ video: true })
      .then((stream) => {
        setMessage(null);
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        setMessage("Camera not found");
      });
  }, []);

  const handlePhotoCapture = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    setImage(canvas.toDataURL("image/png"));
    setVisibility(false);
  };

  return (
    <Modal
      className="flex justify-center items-center"
      setVisibility={setVisibility}
    >
      <video
        id="video"
        className="h-full w-full object-fill rounded-lg"
        autoPlay
        ref={videoRef}
      />
      {message ? (
        <span className="absolute inset-0 flex justify-center items-center  text-2xl">
          {message}
        </span>
      ) : (
        <span
          className="fixed bottom-10 h-[10%] w-[10%] bg-green-300 border-4 border-green-500 hover:ring-[6px] ring-green-600 rounded-full hover:scale-110 duration-150 cursor-pointer"
          onClick={handlePhotoCapture}
        />
      )}
    </Modal>
  );
}

export default CapturePhoto;

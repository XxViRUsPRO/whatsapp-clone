import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaCamera } from "react-icons/fa";
import ContextMenu from "./ContextMenu";
import PhotoPicker from "./PhotoPicker";
import PhotoLibrary from "./PhotoLibrary";
import CapturePhoto from "./CapturePhoto";

function Avatar({ type, image, setImage, className = "", noHover, noBorder }) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const [uploadPhoto, setUploadPhoto] = useState(false);
  useEffect(() => {
    if (uploadPhoto) {
      const element = document.getElementById("photo-picker");
      element.click();
      document.body.onfocus = () => {
        setTimeout(() => {
          setUploadPhoto(false);
        }, 50);
      };
    }
  }, [uploadPhoto]);
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [showLibrary, setShowLibrary] = useState(false);

  const [showCapturePhoto, setShowCapturePhoto] = useState(false);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowContextMenu(true);
    setContextMenuPosition({ x: e.pageX, y: e.pageY });
  };

  const contextMenuOptions = [
    {
      name: "Take Photo",
      callback: () => {
        setShowCapturePhoto(true);
      },
    },
    {
      name: "Choose from Library",
      callback: () => {
        setShowLibrary(true);
      },
    },
    {
      name: "Upload Photo",
      callback: () => {
        setUploadPhoto(true);
      },
    },
    {
      name: "Remove Photo",
      callback: () => {
        setImage(null);
      },
    },
  ];

  const size = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-20 w-20",
    xl: "h-24 w-24",
    "2xl": "h-32 w-32",
    "3xl": "h-40 w-40",
  }[type];
  return (
    <>
      <div className={`flex items-center justify-center ${className}`}>
        <div
          className={`relative ${size} group rounded-full ${
            noBorder ? "" : "border-2 border-green-300"
          }`}
        >
          <Image
            src={image || "/default_avatar.png"}
            alt="Avatar"
            className="rounded-full z-0"
            draggable={false}
            fill
          />
          {!noHover && (
            <div
              className={`absolute inset-0 flex justify-center items-center flex-col cursor-pointer opacity-0 group-hover:opacity-100 duration-150`}
              onClick={(e) => handleContextMenu(e)}
            >
              <FaCamera />
              {type !== "sm" && type !== "md" ? (
                <span className="text-xl">
                  Change
                  <br />
                  Photo
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
      {uploadPhoto && <PhotoPicker onChange={handlePhotoChange} />}
      {showContextMenu && (
        <ContextMenu
          options={contextMenuOptions}
          setVisibility={setShowContextMenu}
          position={contextMenuPosition}
        />
      )}
      {showLibrary && (
        <PhotoLibrary setImage={setImage} setVisibility={setShowLibrary} />
      )}
      {showCapturePhoto && (
        <CapturePhoto setImage={setImage} setVisibility={setShowCapturePhoto} />
      )}
    </>
  );
}

export default Avatar;

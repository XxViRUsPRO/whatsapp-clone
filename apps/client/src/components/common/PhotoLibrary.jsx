import React from "react";
import Modal from "./Modal";

const photosSource = [...Array(9)].map((_, i) => `/avatars/${i + 1}.png`);

function PhotoLibrary({ setImage, setVisibility }) {
  const handlePhotoClick = (e) => {
    setImage(e.target.src);
    setVisibility(false);
  };
  return (
    <Modal
      className="grid grid-cols-3 gap-4 justify-center items-center overflow-y-auto"
      setVisibility={setVisibility}
    >
      {photosSource.map((photo) => (
        <img
          key={photo}
          src={photo}
          alt="avatar"
          className="w-3/4 mx-auto rounded-full cursor-pointer hover:ring-4 hover:ring-green-500 hover:scale-110 duration-150"
          onClick={handlePhotoClick}
        />
      ))}
    </Modal>
  );
}

export default PhotoLibrary;

import React from "react";
import ReactDOM from "react-dom";

function PhotoPicker({ onChange }) {
  const component = (
    <input
      id="photo-picker"
      type="file"
      accept="image/*"
      onChange={onChange}
      hidden
    />
  );
  return ReactDOM.createPortal(
    component,
    document.getElementById("photo-picker-placeholder")
  );
}

export default PhotoPicker;

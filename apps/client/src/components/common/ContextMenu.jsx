import React, { useEffect, useRef, useState } from "react";

function ContextMenu({
  setVisibility,
  options,
  position,
  positionMode = "absolute",
  zIndex = 50,
}) {
  const contextMenuRef = useRef(null);
  const [pos, setPos] = useState({ x: position.x || 0, y: position.y || 0 });

  useEffect(() => {
    // Handle outside interactions
    const handleClickOutside = (e) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target)
      ) {
        setVisibility(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Fix position is outside the window
    const { innerWidth, innerHeight } = window;
    const { x, y } = pos;
    if (x + contextMenuRef.current.offsetWidth > innerWidth) {
      setPos({ ...pos, x: innerWidth - contextMenuRef.current.offsetWidth });
    }
    if (y + contextMenuRef.current.offsetHeight > innerHeight) {
      setPos({ ...pos, y: innerHeight - contextMenuRef.current.offsetHeight });
    }

    // Handle Resize window
    const handleResize = () => {
      const { innerWidth, innerHeight } = window;
      const { x, y } = pos;
      if (x + contextMenuRef.current.offsetWidth > innerWidth) {
        setPos({
          ...pos,
          x: innerWidth - contextMenuRef.current.offsetWidth,
        });
      }
      if (y + contextMenuRef.current.offsetHeight > innerHeight) {
        setPos({
          ...pos,
          y: innerHeight - contextMenuRef.current.offsetHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [pos]);

  const handleContextMenu = (e, callback) => {
    e.stopPropagation();
    setVisibility(false);
    callback();
  };

  return (
    <div
      className="bg-photopicker-overlay-background rounded-md p-2 select-none"
      style={{
        position: positionMode,
        top: pos.y,
        left: pos.x,
        zIndex: zIndex,
      }}
      ref={contextMenuRef}
    >
      <ul className="flex flex-col">
        {options.map((option, index) => (
          <li
            key={index}
            className="p-2 cursor-pointer hover:bg-green-300/60"
            onClick={(e) => handleContextMenu(e, option.callback)}
          >
            <span>{option.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ContextMenu;

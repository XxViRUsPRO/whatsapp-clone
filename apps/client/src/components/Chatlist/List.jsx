import React from "react";

function List({ children, className = "" }) {
  return (
    <div
      className={`flex-1 flex flex-col bg-search-input-container-background/90 overflow-y-auto custom-scrollbar divide-y-2 divide-input-background ${className}`}
    >
      {children}
    </div>
  );
}

export default List;

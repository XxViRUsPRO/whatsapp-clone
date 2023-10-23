import React from "react";
import { BiSearchAlt2, BiFilter } from "react-icons/bi";

function SearchBar({ onChange = () => {}, noFilter }) {
  return (
    <div className="px-4 py-2 bg-search-input-container-background">
      <div className="flex items-center gap-2 bg-panel-header-background rounded-lg px-4 py-2">
        <BiSearchAlt2
          className="text-panel-header-icon cursor-pointer text-xl"
          title="Search"
        />
        <input
          name="search"
          type="text"
          className="w-full bg-transparent outline-none text-panel-header-icon"
          placeholder="Search or start new chat"
          onChange={onChange}
        />
        {!noFilter && (
          <BiFilter
            className="text-panel-header-icon cursor-pointer text-xl"
            title="Filter"
          />
        )}
      </div>
    </div>
  );
}

export default SearchBar;

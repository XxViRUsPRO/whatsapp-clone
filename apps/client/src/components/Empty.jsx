import Image from "next/image";
import React from "react";

function Empty() {
  return (
    <div className="col-span-4 flex justify-center items-center border-b-2 border-icon-green">
      <Image
        src="/whatsapp.gif"
        alt="whatsapp"
        width={300}
        height={300}
        fetchPriority="high"
      />
    </div>
  );
}

export default Empty;

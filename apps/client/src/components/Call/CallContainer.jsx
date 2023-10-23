import { CallStates, CallTypes } from "@/features/call/callSlice";
import React from "react";
import { useSelector } from "react-redux";
import IncomingCall from "./IncomingCall";
import OngoingCall from "./OngoingCall";

function CallContainer() {
  const { callState, callType } = useSelector((state) => state.call);

  return (
    <div className="absolute inset-0 z-[999] pointer-events-none overflow-hidden">
      {callState === CallStates.INCOMING ? <IncomingCall /> : <OngoingCall />}
    </div>
  );
}

export default CallContainer;

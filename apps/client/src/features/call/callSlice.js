import { createSlice } from "@reduxjs/toolkit";

const CallStates = {
  AVAILABLE: 0,
  OUTGOING: 1,
  INCOMING: 2,
  ONGOING: 3,
  REJECTED: 4,
  ENDED: 5,
  BUSY: 6,
};

const CallTypes = {
  VOICE: 0,
  VIDEO: 1,
};

const initialState = {
  callState: CallStates.AVAILABLE,
  callType: null,
  peerId: null,
  roomId: null,
};

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    setCallState: (state, action) => {
      switch (action.payload) {
        case CallStates.ENDED:
          state.callState =
            state.callState !== CallStates.ONGOING
              ? CallStates.AVAILABLE
              : CallStates.ENDED;
          break;
        case CallStates.ONGOING:
          state.callState =
            state.callState === CallStates.INCOMING ||
            state.callState === CallStates.OUTGOING
              ? CallStates.ONGOING
              : state.callState;
        default:
          state.callState = action.payload;
      }
    },
    setCallType: (state, action) => {
      state.callType =
        action.payload === CallTypes.VIDEO ? CallTypes.VIDEO : CallTypes.VOICE;
    },
    setPeerId: (state, action) => {
      state.peerId = action.payload;
    },
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
  },
});

export const { setCallState, setCallType, setPeerId, setRoomId } =
  callSlice.actions;
export { CallStates, CallTypes };

export default callSlice.reducer;

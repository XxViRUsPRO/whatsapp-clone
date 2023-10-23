import { createAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  newUser: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setNewUser: (state, action) => {
      state.newUser = action.payload;
    },
  },
});

export const logout = createAction("user/logout");

export const { setUser, setNewUser } = userSlice.actions;

export default userSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  current: 0,
};

const pointSlice = createSlice({
  name: "points",
  initialState,
  reducers: {
    setPoints: (state, action) => {
      state.current = action.payload;
    },
    addPoints: (state, action) => {
      state.current += action.payload;
    },
    subtractPoints: (state, action) => {
      state.current -= action.payload;
      if (state.current < 0) state.current = 0; 
    },
    resetPoints: (state) => {
      state.current = 0;
    },
  },
});

export const { setPoints, addPoints, subtractPoints, resetPoints } = pointSlice.actions;
export default pointSlice.reducer;

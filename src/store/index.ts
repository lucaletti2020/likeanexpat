import { configureStore } from "@reduxjs/toolkit";
import meetingReducer from "./slices/meetingSlice";
import meetingModulesReducer from "./slices/meetingModulesSlice";

export const store = configureStore({
  reducer: {
    meeting: meetingReducer,
    meetingModules: meetingModulesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

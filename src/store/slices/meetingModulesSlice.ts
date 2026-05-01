import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface MeetingModule {
  id: string;
  title: string;
  collectionId: string;
  language: string;
  level: string;
}

interface MeetingModulesState {
  modules: MeetingModule[];
  loading: boolean;
  error: string | null;
}

const initialState: MeetingModulesState = {
  modules: [],
  loading: false,
  error: null,
};

export const getMeetingModules = createAsyncThunk(
  "meetingModules/getAll",
  async (_params: Record<string, unknown>) => {
    const res = await fetch("/api/modules");
    if (!res.ok) throw new Error("Failed to load modules");
    return res.json() as Promise<MeetingModule[]>;
  }
);

const meetingModulesSlice = createSlice({
  name: "meetingModules",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMeetingModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMeetingModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(getMeetingModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Unknown error";
      });
  },
});

export default meetingModulesSlice.reducer;

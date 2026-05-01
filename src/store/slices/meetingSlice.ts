import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiGet } from "@/lib/api";

export interface CollectionModule {
  id: number;
  title: string;
  section_title: string;
  description: string;
  language: string;
  level: string;
  external_id: string;
  order: number;
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  external_id: string;
  code: string;
  modules: CollectionModule[];
}

interface MeetingState {
  collections: Collection[];
  collectionsLoading: boolean;
  collectionsError: string | null;
}

const initialState: MeetingState = {
  collections: [],
  collectionsLoading: false,
  collectionsError: null,
};

let collectionsCache: Collection[] | null = null;

export const fetchMeetingCollections = createAsyncThunk(
  "meeting/fetchCollections",
  async (forceRefresh: boolean) => {
    if (!forceRefresh && collectionsCache) return collectionsCache;
    const data = await apiGet<Collection[]>("/api/collections/");
    collectionsCache = data;
    return data;
  }
);

const meetingSlice = createSlice({
  name: "meeting",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeetingCollections.pending, (state) => {
        state.collectionsLoading = true;
        state.collectionsError = null;
      })
      .addCase(fetchMeetingCollections.fulfilled, (state, action) => {
        state.collectionsLoading = false;
        state.collections = action.payload;
      })
      .addCase(fetchMeetingCollections.rejected, (state, action) => {
        state.collectionsLoading = false;
        state.collectionsError = action.error.message ?? "Unknown error";
      });
  },
});

export default meetingSlice.reducer;

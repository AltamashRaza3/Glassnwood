
import {
  configureStore,
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { getProjects } from "../services/projectService.js";

export const loadProjects = createAsyncThunk(
  "projects/load",
  async (_, { rejectWithValue }) => {
    try {
      return await getProjects();
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to load projects."
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { status } = getState().projects;

      // Avoid duplicate requests while loading or after success.
      return status === "idle" || status === "error";
    },
  }
);

const projectsSlice = createSlice({
  name: "projects",

  initialState: {
    items: [],
    status: "idle",
    error: null,
  },

  reducers: {
    clearProjectsError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadProjects.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(loadProjects.fulfilled, (state, action) => {
        state.status = "ready";
        state.items = action.payload;
        state.error = null;
      })

      .addCase(loadProjects.rejected, (state, action) => {
        state.status = "error";
        state.error =
          action.payload ||
          action.error.message ||
          "Failed to load projects.";
      });
  },
});

export const { clearProjectsError } = projectsSlice.actions;

export const store = configureStore({
  reducer: {
    projects: projectsSlice.reducer,
  },
});

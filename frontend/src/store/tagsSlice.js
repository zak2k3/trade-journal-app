import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async thunks
export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/tags');
      return response.data.tags;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tags');
    }
  }
);

export const createTag = createAsyncThunk(
  'tags/createTag',
  async (tagData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/tags', tagData);
      return response.data.tag;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create tag');
    }
  }
);

export const deleteTag = createAsyncThunk(
  'tags/deleteTag',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/tags/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete tag');
    }
  }
);

// Initial state
const initialState = {
  tags: [],
  loading: false,
  error: null,
};

// Tags slice
const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tags
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Tag
      .addCase(createTag.fulfilled, (state, action) => {
        state.tags.push(action.payload);
      })
      // Delete Tag
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.tags = state.tags.filter(t => t.id !== action.payload);
      });
  },
});

export const { clearError } = tagsSlice.actions;
export default tagsSlice.reducer;
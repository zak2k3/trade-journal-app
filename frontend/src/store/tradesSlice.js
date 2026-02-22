import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async thunks
export const fetchTrades = createAsyncThunk(
  'trades/fetchTrades',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/api/trades?${params}`);
      return response.data.trades;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trades');
    }
  }
);

export const fetchTrade = createAsyncThunk(
  'trades/fetchTrade',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/trades/${id}`);
      return response.data.trade;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trade');
    }
  }
);

export const createTrade = createAsyncThunk(
  'trades/createTrade',
  async (tradeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/trades', tradeData);
      return response.data.trade;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create trade');
    }
  }
);

export const updateTrade = createAsyncThunk(
  'trades/updateTrade',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/trades/${id}`, data);
      return response.data.trade;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update trade');
    }
  }
);

export const deleteTrade = createAsyncThunk(
  'trades/deleteTrade',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/trades/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete trade');
    }
  }
);

// Initial state
const initialState = {
  trades: [],
  currentTrade: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    lastPage: 1,
    total: 0,
  },
};

// Trades slice
const tradesSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTrade: (state) => {
      state.currentTrade = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Trades
      .addCase(fetchTrades.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrades.fulfilled, (state, action) => {
        state.loading = false;
        state.trades = action.payload.data;
        state.pagination = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          total: action.payload.total,
        };
      })
      .addCase(fetchTrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Trade
      .addCase(fetchTrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrade.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTrade = action.payload;
      })
      .addCase(fetchTrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Trade
      .addCase(createTrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrade.fulfilled, (state, action) => {
        state.loading = false;
        state.trades.unshift(action.payload);
      })
      .addCase(createTrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Trade
      .addCase(updateTrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrade.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.trades.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.trades[index] = action.payload;
        }
      })
      .addCase(updateTrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Trade
      .addCase(deleteTrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTrade.fulfilled, (state, action) => {
        state.loading = false;
        state.trades = state.trades.filter(t => t.id !== action.payload);
      })
      .addCase(deleteTrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentTrade } = tradesSlice.actions;
export default tradesSlice.reducer;
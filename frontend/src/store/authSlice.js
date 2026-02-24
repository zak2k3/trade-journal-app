import { toast } from 'react-toastify';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Register thunk
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/register', userData);

      // Store token & user only if registration succeeds
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      // Laravel validation errors
      if (error.response?.status === 422 && error.response.data.errors) {
        const messages = Object.values(error.response.data.errors)
          .flat()
          .join('\n');
        toast.error(messages);
        return rejectWithValue(messages);
      }

      // Email verification required
      if (error.response?.data?.requires_verification) {
        toast.info(error.response.data.message || 'Verify your email');
        return rejectWithValue(error.response.data.message);
      }

      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

// Login thunk
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/login', credentials);

      // Save user & token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Notify success
      toast.success('Login successful! Welcome back.');
      return response.data;
    } catch (error) {
      // Laravel validation errors
      if (error.response?.status === 422 && error.response.data.errors) {
        const messages = Object.values(error.response.data.errors)
          .flat()
          .join('\n');
        toast.error(messages);
        return rejectWithValue(messages);
      }

      // Email not verified
      if (error.response?.data?.requires_verification) {
        toast.info(error.response.data.message || 'Verify your email');
        return rejectWithValue(error.response.data.message);
      }

      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/api/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/user');
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  emailVerified: JSON.parse(localStorage.getItem('user'))?.email_verified_at ? true : false,
  loading: false,
  error: null,
};

// Check verification
export const checkVerificationStatus = createAsyncThunk(
  'auth/checkVerificationStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/user/verification-status');
      return response.data.email_verified;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check verification status');
    }
  }
); 

// Resend verification

export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/user/resend-verification');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resend verification');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        toast.success('Registration successful! Welcome to Trade Journal.');
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        toast.success('Login successful! Welcome back.');
       })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        toast.info('You have been logged out.');
      })
      // Fetch User
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(checkVerificationStatus.fulfilled, (state, action) => {
        state.emailVerified = action.payload;
        if (!action.payload) {
            const updatedUser = { ...state.user, email_verified_at: null };
            state.user = updatedUser;
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      })
      .addCase(resendVerificationEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(resendVerificationEmail.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
          state.loading = false;
        state.error = action.payload;
      })
      
    },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
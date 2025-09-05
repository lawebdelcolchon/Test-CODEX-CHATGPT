import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authService from "../../services/auth";

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password, rememberMe);
      if (response.success) {
        return response.user;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error de conexión');
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.logout();
      if (response.success) {
        return true;
      } else {
        return rejectWithValue(response.error || 'Error al cerrar sesión');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error de conexión');
    }
  }
);

export const forgotPasswordUser = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        return response.message;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error de conexión');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(userData);
      if (response.success) {
        return response.user;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error de conexión');
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  "auth/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      if (response.success) {
        return response.message;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error de conexión');
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: authService.getUser(),
    loading: false,
    error: null,
    message: null,
    isAuthenticated: authService.isAuthenticated(),
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    validateSession: (state) => {
      const isValid = authService.validateSession();
      if (!isValid) {
        state.user = null;
        state.isAuthenticated = false;
      }
    },
    checkAuthStatus: (state) => {
      state.user = authService.getUser();
      state.isAuthenticated = authService.isAuthenticated();
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.message = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Forgot Password
      .addCase(forgotPasswordUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(forgotPasswordUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
        state.error = null;
      })
      .addCase(forgotPasswordUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.message = 'Perfil actualizado exitosamente';
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Change Password
      .addCase(changeUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(changeUserPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
        state.error = null;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage, validateSession, checkAuthStatus } = authSlice.actions;

export default authSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: true,
  userData: {}
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.userData = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userData = null;
    },
    initializeUser: (state) => {
      const storedData = localStorage.getItem('userData');
      if (storedData) {
        state.isLoggedIn = true;
        state.userData = JSON.parse(storedData);
      }
    }
  }
});

export const { login, logout, initializeUser } = userSlice.actions;
export default userSlice.reducer;
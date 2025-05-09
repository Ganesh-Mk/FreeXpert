import axios from 'axios';

export const initializeAuth = () => {
  // Check for existing token on app initialization
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

export const logout = (dispatch, navigate) => {
  // Clear authentication data
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  delete axios.defaults.headers.common['Authorization'];

  // Dispatch logout action if using Redux
  if (dispatch) {
    dispatch(logout());
  }

  // Redirect to login page
  if (navigate) {
    navigate('/login');
  }
};

export const isAuthenticated = () => {

  return !!localStorage.getItem('token') || !!localStorage.getItem('isLogin');
};
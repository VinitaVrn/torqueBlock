'use client';

import { Provider } from 'react-redux';
import { store } from '../store';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../store/slices/cartSlice';
import { setUser, logout } from '../store/slices/authSlice';
import api from '../lib/api';

function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('tb_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.status === 'success' || res.data.success) {
            const userData = res.data.data?.user || res.data.user;
            dispatch(setUser(userData));
            dispatch(fetchCart());
          }
        } catch (err) {
          dispatch(logout());
        }
      }
    };

    initAuth();
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  return children;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AppInitializer>{children}</AppInitializer>
    </Provider>
  );
}

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cart');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart/items', { productId, quantity });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const updateQuantityAsync = createAsyncThunk(
  'cart/updateQuantityAsync',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/cart/items/${productId}`, { quantity });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update quantity');
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCartAsync',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/items/${productId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clearCartAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/cart');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

const initialState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  hasOutOfStockItems: false,
  loading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.subtotal = 0;
      state.hasOutOfStockItems = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
        state.totalItems = action.payload?.totalItems || 0;
        state.subtotal = action.payload?.subtotal || 0;
        state.hasOutOfStockItems = action.payload?.hasOutOfStockItems || false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        state.totalItems = action.payload?.totalItems || 0;
        state.subtotal = action.payload?.subtotal || 0;
        state.hasOutOfStockItems = action.payload?.hasOutOfStockItems || false;
      })
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        state.totalItems = action.payload?.totalItems || 0;
        state.subtotal = action.payload?.subtotal || 0;
        state.hasOutOfStockItems = action.payload?.hasOutOfStockItems || false;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        state.totalItems = action.payload?.totalItems || 0;
        state.subtotal = action.payload?.subtotal || 0;
        state.hasOutOfStockItems = action.payload?.hasOutOfStockItems || false;
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
        state.totalItems = 0;
        state.subtotal = 0;
        state.hasOutOfStockItems = false;
      });
  }
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;

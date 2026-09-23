'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCart,
  updateQuantityAsync,
  removeFromCartAsync,
  clearCartAsync
} from '../../store/slices/cartSlice';
import Link from 'next/link';
import { ShoppingCart, Trash2, ArrowRight, AlertTriangle, ArrowLeft, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items, totalItems, subtotal, hasOutOfStockItems, loading } = useSelector((state) => state.cart);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/cart');
    } else {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch, router]);

  const handleUpdateQuantity = (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty >= 1) {
      dispatch(updateQuantityAsync({ productId, quantity: newQty }));
    }
  };

  const handleRemoveItem = (productId) => {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
      dispatch(removeFromCartAsync(productId));
    }
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      dispatch(clearCartAsync());
    }
  };

  if (!isAuthenticated) return null;

  if (loading && items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-64 bg-slate-200 rounded-lg"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-lg text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 mt-1">
          You have no motorcycle tyres in your current purchase order.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center space-x-1 px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded hover:bg-sky-500 transition-colors"
        >
          <span>Browse Catalogue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Purchase Order Cart</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalItems} {totalItems === 1 ? 'tyre' : 'tyres'} selected for order
          </p>
        </div>

        <button
          onClick={handleClearCart}
          className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
        >
          Clear Cart
        </button>
      </div>

      {hasOutOfStockItems && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>
            Some items in your cart exceed available warehouse inventory. Please adjust quantities before proceeding.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.product._id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80'}
                      alt={item.product.model}
                      className="w-16 h-16 object-cover rounded bg-slate-50 border border-slate-100 flex-shrink-0"
                    />

                    <div>
                      <span className="text-[10px] font-bold uppercase text-sky-700 block">
                        {item.product.brand}
                      </span>
                      <Link
                        href={`/products/${item.product._id}`}
                        className="text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors"
                      >
                        {item.product.model}
                      </Link>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">{item.product.size}</p>
                      
                      {!item.isAvailable && (
                        <span className="text-[10px] font-semibold text-red-600 block mt-1">
                          Only {item.availableStock} in stock!
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                    <div className="flex items-center border border-slate-200 rounded bg-white">
                      <button
                        onClick={() => handleUpdateQuantity(item.product._id, item.quantity, -1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-semibold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product._id, item.quantity, 1)}
                        disabled={item.quantity >= item.availableStock}
                        className="p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <span className="text-sm font-extrabold text-slate-900 block">
                        ₹{item.itemSubtotal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ₹{item.unitPrice.toLocaleString('en-IN')} / unit
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.product._id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Browsing Products</span>
          </Link>
        </div>

        <div>
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4 sticky top-24">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Order Summary
            </h2>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal ({totalItems} units):</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>B2B Express Freight:</span>
                <span className="text-emerald-700 font-semibold">FREE (Prepaid)</span>
              </div>
              <div className="flex justify-between">
                <span>GST / Applicable Taxes:</span>
                <span className="text-slate-500 font-medium">Included in B2B Price</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Estimated Total:</span>
              <span className="text-2xl font-black text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              disabled={hasOutOfStockItems || items.length === 0}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-slate-400 text-center">
              Prices, taxes and stock are re-validated server-side upon order creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, resetCart } from '../../store/slices/cartSlice';
import { loadRazorpayScript } from '../../lib/razorpay';
import api from '../../lib/api';
import Link from 'next/link';
import { ShieldCheck, AlertCircle, ArrowLeft, CheckCircle, CreditCard, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items, totalItems, subtotal, hasOutOfStockItems } = useSelector((state) => state.cart);

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    companyName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: ''
  });

  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    name: '',
    companyName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    dispatch(fetchCart());

    if (user) {
      const defaultAddr = user.addresses?.[0] || {};
      setShippingAddress({
        name: user.name || '',
        companyName: user.companyName || '',
        phone: user.phone || '',
        street: defaultAddr.street || '',
        city: defaultAddr.city || '',
        state: defaultAddr.state || '',
        postalCode: defaultAddr.postalCode || ''
      });
    }
  }, [isAuthenticated, user, dispatch, router]);

  const handleShippingChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleBillingChange = (e) => {
    setBillingAddress({ ...billingAddress, [e.target.name]: e.target.value });
  };

  const handlePlaceOrderAndPay = async (e) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (hasOutOfStockItems) {
      setError('Some items exceed current inventory. Please adjust quantities in cart.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        shippingAddress,
        billingAddress: sameAsBilling ? shippingAddress : billingAddress
      };

      const orderRes = await api.post('/orders', orderPayload);
      if (orderRes.data.status !== 'success' && !orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to create order');
      }

      const createdOrder = orderRes.data.data?.order || orderRes.data.order;

      const paymentRes = await api.post('/payments/create', { orderId: createdOrder._id });
      if (paymentRes.data.status !== 'success' && !paymentRes.data.success) {
        throw new Error(paymentRes.data.message || 'Failed to initialize payment');
      }

      const paymentData = paymentRes.data.data || paymentRes.data;
      const { gatewayOrderId, amount, currency, keyId } = paymentData;

      const isScriptLoaded = await loadRazorpayScript();

      if (isScriptLoaded && window.Razorpay && keyId && !gatewayOrderId.startsWith('order_mock_')) {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency || 'INR',
          name: 'Torque Block B2B',
          description: `Payment for Order #${createdOrder.orderNumber}`,
          order_id: gatewayOrderId,
          prefill: {
            name: shippingAddress.name,
            email: user?.email,
            contact: shippingAddress.phone
          },
          theme: {
            color: '#0284c7'
          },
          handler: async function (response) {
            try {
              const verifyRes = await api.post('/payments/verify', {
                orderId: createdOrder._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });

              if (verifyRes.data.status === 'success' || verifyRes.data.success) {
                dispatch(resetCart());
                router.push(`/orders/${createdOrder._id}?payment=success`);
              } else {
                router.push(`/orders/${createdOrder._id}?payment=failed`);
              }
            } catch (vErr) {
              router.push(`/orders/${createdOrder._id}?payment=failed`);
            }
          },
          modal: {
            ondismiss: async function () {
              try {
                await api.post('/payments/fail', {
                  orderId: createdOrder._id,
                  reason: 'User closed payment window before completion.'
                });
              } catch (fErr) {
              }
              router.push(`/orders/${createdOrder._id}?payment=cancelled`);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async function (response) {
          try {
            await api.post('/payments/fail', {
              orderId: createdOrder._id,
              reason: response.error?.description || 'Payment failed at gateway',
              errorDetails: response.error
            });
          } catch (fErr) {
          }
          router.push(`/orders/${createdOrder._id}?payment=failed`);
        });

        rzp.open();
      } else {
        const mockPaymentId = `pay_sandbox_${Date.now()}`;
        const mockSignature = `sig_sandbox_${Date.now()}`;

        const verifyRes = await api.post('/payments/verify', {
          orderId: createdOrder._id,
          razorpayOrderId: gatewayOrderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature
        });

        if (verifyRes.data.status === 'success' || verifyRes.data.success) {
          dispatch(resetCart());
          router.push(`/orders/${createdOrder._id}?payment=success`);
        } else {
          router.push(`/orders/${createdOrder._id}?payment=failed`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred during checkout.');
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/cart"
            className="inline-flex items-center space-x-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Cart</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Checkout & Order Placement</h1>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrderAndPay} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              1. Delivery / Workshop Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Recipient Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={shippingAddress.name}
                  onChange={handleShippingChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company / Workshop *</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={shippingAddress.companyName}
                  onChange={handleShippingChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contact Phone (for courier) *</label>
              <input
                type="tel"
                name="phone"
                required
                value={shippingAddress.phone}
                onChange={handleShippingChange}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Street Address *</label>
              <input
                type="text"
                name="street"
                required
                value={shippingAddress.street}
                onChange={handleShippingChange}
                placeholder="Door No., Street name, Industrial area / Landmark"
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={shippingAddress.city}
                  onChange={handleShippingChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={shippingAddress.state}
                  onChange={handleShippingChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">PIN Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={shippingAddress.postalCode}
                  onChange={handleShippingChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Billing Address (for GST Invoice)
              </h2>
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(e) => setSameAsBilling(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <span>Same as shipping address</span>
              </label>
            </div>

            {!sameAsBilling && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Billing Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={billingAddress.name}
                      onChange={handleBillingChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Billing Company *</label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      value={billingAddress.companyName}
                      onChange={handleBillingChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Billing Street *</label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={billingAddress.street}
                    onChange={handleBillingChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={billingAddress.city}
                      onChange={handleBillingChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={billingAddress.state}
                      onChange={handleBillingChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={billingAddress.postalCode}
                      onChange={handleBillingChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4 sticky top-24">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              3. Purchase Items ({totalItems})
            </h2>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 block">{item.product.model}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.product.size} × {item.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{item.itemSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Freight:</span>
                <span className="text-emerald-700 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-xl font-black text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0 || hasOutOfStockItems}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-sm rounded transition-colors flex items-center justify-center space-x-2 shadow"
            >
              <CreditCard className="w-4 h-4" />
              <span>{loading ? 'Processing Order...' : 'Pay with Razorpay Sandbox'}</span>
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 pt-2">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Sandbox Test Mode • Instant Server Signature Verification</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}

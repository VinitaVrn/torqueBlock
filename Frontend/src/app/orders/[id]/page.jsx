'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { resetCart } from '../../../store/slices/cartSlice';
import { loadRazorpayScript } from '../../../lib/razorpay';
import api from '../../../lib/api';
import Link from 'next/link';
import StatusBadge from '../../../components/StatusBadge';
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Building,
  MapPin,
  Calendar,
  RefreshCw,
  PackageCheck
} from 'lucide-react';

function OrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState('');

  const paymentQuery = searchParams.get('payment');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/orders/${params.id}`);
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/orders/${params.id}`);
        if (res.data.status === 'success' || res.data.success) {
          const payload = res.data.data || res.data;
          setOrder(payload.order || payload);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve order details.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id, isAuthenticated, router]);

  const handleRetryPayment = async () => {
    if (!order) return;
    setRetrying(true);

    try {
      const paymentRes = await api.post('/payments/create', { orderId: order._id });
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
          description: `Payment for Order #${order.orderNumber}`,
          order_id: gatewayOrderId,
          prefill: {
            name: order.shippingAddress.name,
            email: user?.email,
            contact: order.shippingAddress.phone
          },
          theme: { color: '#0284c7' },
          handler: async function (response) {
            const verifyRes = await api.post('/payments/verify', {
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            if (verifyRes.data.status === 'success' || verifyRes.data.success) {
              dispatch(resetCart());
              const updatedOrder = verifyRes.data.data?.order || verifyRes.data.order;
              setOrder(updatedOrder);
              router.replace(`/orders/${order._id}?payment=success`);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const verifyRes = await api.post('/payments/verify', {
          orderId: order._id,
          razorpayOrderId: gatewayOrderId,
          razorpayPaymentId: `pay_sandbox_${Date.now()}`,
          razorpaySignature: `sig_sandbox_${Date.now()}`
        });

        if (verifyRes.data.status === 'success' || verifyRes.data.success) {
          dispatch(resetCart());
          const updatedOrder = verifyRes.data.data?.order || verifyRes.data.order;
          setOrder(updatedOrder);
          router.replace(`/orders/${order._id}?payment=success`);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Payment retry failed');
    } finally {
      setRetrying(false);
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-64 bg-slate-200 rounded-lg"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-lg text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">{error || 'This order does not exist or you do not have permission to view it.'}</p>
        <Link
          href="/orders"
          className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-800"
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/orders"
        className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Orders</span>
      </Link>

      {paymentQuery === 'success' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start space-x-3 text-emerald-800">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold">Payment Verified Successfully!</h3>
            <p className="text-xs text-emerald-700 mt-0.5">
              Your payment has been captured and verified server-side. Your purchase order is now confirmed for fulfillment.
            </p>
          </div>
        </div>
      )}

      {(paymentQuery === 'failed' || paymentQuery === 'cancelled') && order.paymentStatus !== 'Success' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3 text-amber-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold">
              {paymentQuery === 'cancelled' ? 'Payment Cancelled by User' : 'Payment Not Completed'}
            </h3>
            <p className="text-xs text-amber-700 mt-0.5">
              The payment process was not completed. You can retry paying below to confirm this order.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold font-mono text-slate-900">{order.orderNumber}</h1>
            <StatusBadge type="order" status={order.orderStatus} />
          </div>
          <div className="flex items-center space-x-4 text-xs text-slate-500 mt-2">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(order.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span>Payment:</span>
              <StatusBadge type="payment" status={order.paymentStatus} />
            </span>
          </div>
        </div>

        {order.paymentStatus !== 'Success' && order.orderStatus === 'Pending Payment' && (
          <button
            onClick={handleRetryPayment}
            disabled={retrying}
            className="py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded shadow-sm flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            <span>{retrying ? 'Connecting Gateway...' : 'Complete Payment Now'}</span>
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Purchased Product Snapshots
          </h2>
          <span className="text-xs text-slate-400">Fixed at purchase time</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Tyre Model & Specs</th>
                <th className="px-6 py-3">Brand</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Size</th>
                <th className="px-6 py-3 text-right">Unit B2B Price</th>
                <th className="px-6 py-3 text-center">Qty</th>
                <th className="px-6 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-900">{item.productName}</td>
                  <td className="px-6 py-4 uppercase text-sky-700 font-semibold">{item.brand}</td>
                  <td className="px-6 py-4 font-mono">{item.sku}</td>
                  <td className="px-6 py-4 font-mono text-slate-800">{item.size}</td>
                  <td className="px-6 py-4 text-right font-medium">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-900">{item.quantity}</td>
                  <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                    ₹{item.subtotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
          <div className="text-slate-500 text-[11px]">
            {order.gatewayPaymentId && (
              <p>Gateway Payment Ref: <span className="font-mono font-semibold text-slate-700">{order.gatewayPaymentId}</span></p>
            )}
            {order.gatewayOrderId && (
              <p>Gateway Order Ref: <span className="font-mono font-semibold text-slate-700">{order.gatewayOrderId}</span></p>
            )}
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-right">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-slate-900">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery / Freight:</span>
              <span className="font-semibold text-emerald-700">FREE</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Grand Total:</span>
              <span className="text-lg font-black text-slate-900">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-sky-600" />
            <span>Delivery Destination</span>
          </div>
          <p className="font-bold text-slate-900 text-sm">{order.shippingAddress.name}</p>
          <p className="font-medium text-slate-700">{order.shippingAddress.companyName}</p>
          <p className="text-slate-600">{order.shippingAddress.street}</p>
          <p className="text-slate-600">
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
          </p>
          <p className="text-slate-500 pt-1">Phone: {order.shippingAddress.phone}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-sky-600" />
            <span>Billing Details</span>
          </div>
          <p className="font-bold text-slate-900 text-sm">{order.billingAddress.name}</p>
          <p className="font-medium text-slate-700">{order.billingAddress.companyName}</p>
          <p className="text-slate-600">{order.billingAddress.street}</p>
          <p className="text-slate-600">
            {order.billingAddress.city}, {order.billingAddress.state} - {order.billingAddress.postalCode}
          </p>
          <p className="text-slate-500 pt-1">Phone: {order.billingAddress.phone}</p>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto py-12 animate-pulse h-96 bg-white rounded-lg"></div>}>
      <OrderDetailContent />
    </Suspense>
  );
}

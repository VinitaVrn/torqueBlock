'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import api from '../../lib/api';
import Link from 'next/link';
import StatusBadge from '../../components/StatusBadge';
import { Package, ArrowRight, Clock, AlertCircle } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/orders');
        if (res.data.status === 'success' || res.data.success) {
          const payload = res.data.data || res.data;
          setOrders(payload.orders || []);
        }
      } catch (err) {
        setError('Failed to load your orders history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8 animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-48 bg-slate-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Purchase Orders</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track B2B tyre order statuses, invoices, and delivery progress
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-800">No Orders Placed Yet</h2>
          <p className="text-xs text-slate-500 mt-1">
            When you create purchase orders, they will appear here with full invoice snapshots.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex items-center space-x-1 px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded hover:bg-sky-500 transition-colors"
          >
            <span>Browse Tyre Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Order Number</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Tyres / Items</th>
                  <th className="px-5 py-3">Total Amount</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Order Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const firstItem = order.items[0];
                  const otherCount = order.items.length - 1;

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        <Link href={`/orders/${order._id}`} className="hover:text-sky-600">
                          {order.orderNumber}
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-800 block">
                          {firstItem?.productName} ({firstItem?.quantity}x)
                        </span>
                        {otherCount > 0 && (
                          <span className="text-[10px] text-slate-400">
                            + {otherCount} more {otherCount === 1 ? 'item' : 'items'} ({totalUnits} tyres total)
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-extrabold text-slate-900">
                        ₹{order.total.toLocaleString('en-IN')}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge type="payment" status={order.paymentStatus} />
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge type="order" status={order.orderStatus} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/orders/${order._id}`}
                          className="text-xs font-semibold text-sky-600 hover:text-sky-800 inline-flex items-center space-x-0.5"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

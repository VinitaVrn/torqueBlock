'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync } from '../../../store/slices/cartSlice';
import api from '../../../lib/api';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Check, ShieldCheck, Truck, AlertCircle, Plus, Minus } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/products/${params.id}`);
        if (res.data.status === 'success' || res.data.success) {
          const payload = res.data.data || res.data;
          setProduct(payload.product || payload);
        }
      } catch (err) {
        setError('Product not found or currently unavailable.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleQuantityChange = (delta) => {
    if (!product) return;
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${params.id}`);
      return;
    }

    if (!product || product.stock === 0) return;

    setAddingToCart(true);
    try {
      await dispatch(addToCartAsync({ productId: product._id, quantity })).unwrap();
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err || 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-80 bg-slate-200 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-lg text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Product Unavailable</h2>
        <p className="text-xs text-slate-500 mt-1">{error || 'Could not find the requested tyre.'}</p>
        <Link
          href="/products"
          className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-800"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href="/products"
        className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tyre Catalogue</span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 p-6 lg:p-8">
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 flex items-center justify-center">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80'}
            alt={`${product.brand} ${product.model}`}
            className="max-h-80 object-contain rounded mix-blend-multiply"
          />
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded">
                {product.brand}
              </span>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                SKU: {product.sku}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mt-2">{product.model}</h1>
            <p className="text-sm font-semibold text-slate-600 mt-0.5">{product.category}</p>

            <p className="text-xs text-slate-600 mt-4 leading-relaxed">{product.description}</p>

            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    B2B Dealer Price (Per Unit)
                  </span>
                  <div className="text-3xl font-extrabold text-slate-900">
                    ₹{product.b2bPrice.toLocaleString('en-IN')}
                  </div>
                </div>

                {product.mrp && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 block">Retail MRP</span>
                    <span className="text-sm text-slate-400 line-through">
                      ₹{product.mrp.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[11px] font-semibold text-emerald-700">
                      Save ₹{(product.mrp - product.b2bPrice).toLocaleString('en-IN')} / unit
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">Inventory Status:</span>
                {product.stock > 0 ? (
                  <span className="font-semibold text-emerald-700 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    <span>In Stock ({product.stock} units available)</span>
                  </span>
                ) : (
                  <span className="font-semibold text-red-600 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                    <span>Currently Out of Stock</span>
                  </span>
                )}
              </div>
            </div>

            {product.stock > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-medium text-slate-700">Quantity:</span>
                  <div className="flex items-center border border-slate-300 rounded bg-white">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-sm font-semibold text-slate-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    Subtotal: <strong className="text-slate-900">₹{(product.b2bPrice * quantity).toLocaleString('en-IN')}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`w-full py-3 px-6 font-semibold text-sm rounded flex items-center justify-center space-x-2 transition-colors ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>{addingToCart ? 'Adding...' : 'Add to Purchase Order'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-[11px] text-slate-600">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>100% Genuine Direct from Manufacturer</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>Priority B2B Express Dispatch</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
          Technical Specifications & Fitment Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-xs">
          <div className="bg-slate-50 p-3 rounded border border-slate-100">
            <span className="text-slate-500 block">Tyre Size:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{product.size}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-100">
            <span className="text-slate-500 block">Rim Diameter:</span>
            <span className="font-semibold text-slate-900">{product.rimSize ? `${product.rimSize} Inches` : 'Standard'}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-100">
            <span className="text-slate-500 block">Position Fitment:</span>
            <span className="font-semibold text-slate-900">{product.specifications?.position || 'Front'}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-100">
            <span className="text-slate-500 block">Speed Rating:</span>
            <span className="font-semibold text-slate-900">{product.specifications?.speedRating || 'W (270 km/h)'}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-100">
            <span className="text-slate-500 block">Load Index:</span>
            <span className="font-semibold text-slate-900">{product.specifications?.loadIndex || '58 (236 kg)'}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-100">
            <span className="text-slate-500 block">Construction Type:</span>
            <span className="font-semibold text-slate-900">{product.specifications?.construction || 'Radial - Tubeless'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

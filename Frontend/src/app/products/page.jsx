'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync } from '../../store/slices/cartSlice';
import api from '../../lib/api';
import Link from 'next/link';
import Pagination from '../../components/Pagination';
import { Search, Filter, ShoppingCart, Check, AlertCircle } from 'lucide-react';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedIds, setAddedIds] = useState({});

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || '';
  const currentInStock = searchParams.get('inStock') === 'true';

  const [searchInput, setSearchInput] = useState(currentSearch);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '8');

      if (currentSearch) params.set('search', currentSearch);
      if (currentBrand) params.set('brand', currentBrand);
      if (currentCategory) params.set('category', currentCategory);
      if (currentSort) params.set('sort', currentSort);
      if (currentInStock) params.set('inStock', 'true');

      const res = await api.get(`/products?${params.toString()}`);
      if (res.data.status === 'success' || res.data.success) {
        const payload = res.data.data || res.data;
        setProducts(payload.products || []);
        setTotalProducts(payload.totalProducts || 0);
        setTotalPages(payload.totalPages || 1);
        if (payload.availableBrands) setAvailableBrands(payload.availableBrands);
        if (payload.availableCategories) setAvailableCategories(payload.availableCategories);
      }
    } catch (err) {
      setError('Unable to load motorcycle tyres catalogue. Please check connection.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSearch, currentBrand, currentCategory, currentSort, currentInStock]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (!newParams.page) {
      params.set('page', '1');
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/products');
      return;
    }

    try {
      await dispatch(addToCartAsync({ productId: product._id, quantity: 1 })).unwrap();
      setAddedIds((prev) => ({ ...prev, [product._id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [product._id]: false }));
      }, 1500);
    } catch (err) {
      alert(err || 'Failed to add item to cart');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Performance Motorcycle Tyres</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Wholesale B2B pricing, verified fitments, and immediate dispatch for registered workshops.
          </p>
        </div>
        <div className="text-xs bg-slate-800 px-3 py-1.5 rounded border border-slate-700 text-slate-300">
          Showing <span className="font-semibold text-white">{products.length}</span> of{' '}
          <span className="font-semibold text-white">{totalProducts}</span> Tyres
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2 lg:col-span-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search brand, model, size..."
              className="w-full px-3 py-2 pl-9 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <div>
            <select
              value={currentBrand}
              onChange={(e) => updateFilters({ brand: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">All Brands</option>
              {availableBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={currentCategory}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">Sort: Featured / Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Model: A to Z</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer text-slate-700 select-none">
            <input
              type="checkbox"
              checked={currentInStock}
              onChange={(e) => updateFilters({ inStock: e.target.checked ? 'true' : '' })}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <span>In-Stock Items Only</span>
          </label>

          {(currentSearch || currentBrand || currentCategory || currentSort || currentInStock) && (
            <button
              onClick={() => router.push('/products')}
              className="text-sky-600 hover:text-sky-800 font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse space-y-3">
              <div className="h-44 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <p className="text-base font-semibold text-slate-800">No motorcycle tyres match your criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or clearing selected filters.</p>
          <button
            onClick={() => router.push('/products')}
            className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-800"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col hover:border-slate-300 transition-shadow shadow-sm hover:shadow"
            >
              <Link href={`/products/${product._id}`} className="block relative bg-slate-100 p-4 group">
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80'}
                  alt={`${product.brand} ${product.model}`}
                  className="w-full h-44 object-cover rounded mix-blend-multiply group-hover:scale-105 transition-transform duration-200"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                  {product.category}
                </span>
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Only {product.stock} Left
                  </span>
                )}
              </Link>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold uppercase text-sky-700">{product.brand}</span>
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{product.sku}</span>
                  </div>

                  <Link href={`/products/${product._id}`}>
                    <h3 className="font-bold text-slate-900 text-sm hover:text-sky-600 transition-colors line-clamp-1">
                      {product.model}
                    </h3>
                  </Link>

                  <p className="text-xs font-mono text-slate-600 mt-1 bg-slate-50 px-2 py-1 rounded inline-block border border-slate-100">
                    {product.size}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">B2B Price</span>
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{product.b2bPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {product.mrp && (
                      <span className="text-xs text-slate-400 line-through">
                        MRP ₹{product.mrp.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/products/${product._id}`}
                      className="flex-1 py-1.5 px-3 text-xs font-medium text-center border border-slate-300 rounded hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      Details
                    </Link>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`py-1.5 px-3 text-xs font-medium rounded flex items-center justify-center space-x-1 transition-colors ${
                        product.stock === 0
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : addedIds[product._id]
                          ? 'bg-emerald-600 text-white'
                          : 'bg-sky-600 hover:bg-sky-500 text-white'
                      }`}
                    >
                      {addedIds[product._id] ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{product.stock === 0 ? 'Out of Stock' : 'Add'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => updateFilters({ page: page.toString() })}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto py-12 animate-pulse h-96 bg-white rounded-lg"></div>}>
      <ProductsContent />
    </Suspense>
  );
}

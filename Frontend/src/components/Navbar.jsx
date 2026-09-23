'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { resetCart } from '../store/slices/cartSlice';
import { ShoppingCart, Package, LogOut } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    router.push('/login');
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/products" className="flex items-center space-x-2">
          <span className="bg-sky-500 text-slate-950 font-black px-2 py-0.5 rounded text-sm tracking-wider uppercase">
            Torque
          </span>
          <span className="font-bold text-lg tracking-tight text-white">
            Block <span className="text-xs font-medium text-slate-400">B2B</span>
          </span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link
            href="/products"
            className={`text-sm font-medium hover:text-sky-400 transition-colors ${
              pathname === '/products' ? 'text-sky-400' : 'text-slate-300'
            }`}
          >
            Tyre Catalogue
          </Link>

          {isAuthenticated && (
            <Link
              href="/orders"
              className={`text-sm font-medium flex items-center space-x-1 hover:text-sky-400 transition-colors ${
                pathname.startsWith('/orders') ? 'text-sky-400' : 'text-slate-300'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          <Link
            href="/cart"
            className="relative p-2 text-slate-300 hover:text-white transition-colors flex items-center"
            title="View Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-sky-500 text-slate-950 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-white">{user?.companyName || user?.name}</p>
                <p className="text-[10px] text-slate-400">{user?.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <Link
                href="/login"
                className="text-xs font-medium px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-xs font-medium px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white transition-colors"
              >
                Register
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}

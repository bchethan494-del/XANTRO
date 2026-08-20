import React, { useState } from 'react';
import { Search, ShoppingBag, User, Package, Store, LogOut, ShieldAlert, ChevronDown } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  onNavigate: (view: 'home' | 'cart' | 'checkout' | 'orders' | 'profile' | 'seller' | 'admin') => void;
  currentView: string;
  onOpenAuth: (mode?: 'login' | 'signup', role?: 'buyer' | 'seller') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  currentView,
  onOpenAuth,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const categories = [
    'All',
    'Electronics',
    'Fashion',
    'Home & Kitchen',
    'Mobile Accessories',
    'Sports & Outdoors',
    'Books & Stationery'
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-2xs" id="xantro-main-header">
      {/* Top micro bar */}
      <div className="bg-blue-900 text-white text-[11px] py-1 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Independent Multi-Vendor E-Commerce Platform
          </span>
          <span className="hidden md:inline text-blue-200">
            • Real listings • Transparent delivery • Verified sellers
          </span>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className="text-yellow-300 font-bold hover:underline flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Owner / Admin Panel</span>
            </button>
          )}
          <span className="text-blue-200">100% Genuine Marketplace</span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* LEFT SECTION: Logo + RETAIL (Seller Hub) */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center text-left focus:outline-hidden"
            id="nav-logo-btn"
          >
            <Logo size="md" showSubtitle />
          </button>

          {/* RETAIL - Seller Section Button */}
          <button
            onClick={() => {
              if (isAuthenticated && user?.role === 'seller') {
                onNavigate('seller');
              } else if (isAuthenticated && user?.role === 'buyer') {
                onNavigate('seller');
              } else {
                onNavigate('seller');
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentView === 'seller'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
            id="nav-retail-btn"
            title="Seller Window & Product Listing Hub"
          >
            <Store className="w-3.5 h-3.5" />
            <span>RETAIL</span>
          </button>
        </div>

        {/* CENTER SECTION: Search Products Bar */}
        <div className="flex-1 max-w-xl hidden sm:flex items-center relative" id="header-search-container">
          <div className="relative w-full flex items-center">
            {/* Category selection */}
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="h-10 pl-3 pr-7 bg-gray-100 border-y border-l border-gray-300 rounded-l-lg text-xs font-medium text-gray-700 focus:outline-hidden cursor-pointer hover:bg-gray-200 transition-colors shrink-0"
              id="header-category-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Input field */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentView !== 'home') onNavigate('home');
              }}
              placeholder="Search products, brands, categories..."
              className="w-full h-10 pl-3 pr-10 text-xs bg-white border border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden transition-all"
              id="header-search-input"
            />

            {/* Search Icon / Button */}
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg flex items-center justify-center transition-colors"
              id="header-search-btn"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT SECTION: Profile, Orders, Cart, Login/Signup */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Orders Link */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                onOpenAuth('login', 'buyer');
              } else {
                onNavigate('orders');
              }
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'orders'
                ? 'bg-gray-100 text-blue-600'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
            id="nav-orders-btn"
          >
            <Package className="w-4 h-4" />
            <span className="hidden md:inline">Orders</span>
          </button>

          {/* Cart with count badge */}
          <button
            onClick={() => onNavigate('cart')}
            className={`relative px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'cart'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
            id="nav-cart-btn"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden md:inline">Cart</span>
            {totalItemsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-black bg-blue-600 text-white rounded-full leading-none">
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* Profile / Auth Menu */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-800 bg-white transition-all shadow-2xs"
                id="user-profile-menu-btn"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[90px] truncate hidden sm:inline">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50 text-xs"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-3.5 py-2 border-b border-gray-100">
                    <p className="font-bold text-gray-900 truncate">{user.name}</p>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-blue-100 text-blue-700 mt-0.5">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigate('profile')}
                    className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => onNavigate('orders')}
                    className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <Package className="w-3.5 h-3.5 text-gray-500" />
                    <span>My Orders</span>
                  </button>

                  {user.role === 'seller' && (
                    <button
                      onClick={() => onNavigate('seller')}
                      className="w-full text-left px-3.5 py-2 hover:bg-blue-50 flex items-center gap-2 text-blue-700 font-semibold"
                    >
                      <Store className="w-3.5 h-3.5 text-blue-600" />
                      <span>Seller Window</span>
                    </button>
                  )}

                  {user.role === 'admin' && (
                    <button
                      onClick={() => onNavigate('admin')}
                      className="w-full text-left px-3.5 py-2 hover:bg-yellow-50 flex items-center gap-2 text-yellow-800 font-semibold"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-yellow-600" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => {
                      logout();
                      onNavigate('home');
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth('login', 'buyer')}
                className="px-3 py-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                id="header-login-btn"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('signup', 'buyer')}
                className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-2xs"
                id="header-signup-btn"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="sm:hidden px-4 pb-3 flex items-center gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            if (currentView !== 'home') onNavigate('home');
          }}
          placeholder="Search products in XANTRO..."
          className="w-full h-9 px-3 text-xs bg-white border border-gray-300 rounded-lg focus:border-blue-600 outline-hidden"
        />
      </div>
    </header>
  );
};

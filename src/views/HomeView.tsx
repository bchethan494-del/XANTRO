import React from 'react';
import { Product, Advertisement } from '../types';
import { AdBanner } from '../components/AdBanner';
import { ProductCard } from '../components/ProductCard';
import { Sparkles, TrendingUp, Clock, Filter, Grid, ShieldCheck } from 'lucide-react';

interface HomeViewProps {
  products: Product[];
  recentProducts: Product[];
  popularProducts: Product[];
  advertisements: Advertisement[];
  onSelectProduct: (product: Product) => void;
  onSelectProductId: (productId: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  searchQuery: string;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onNavigateToSeller?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  recentProducts,
  popularProducts,
  advertisements,
  onSelectProduct,
  onSelectProductId,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  sortBy,
  onSortChange,
  onNavigateToSeller
}) => {
  const categories = [
    { name: 'All', icon: '🛍️' },
    { name: 'Electronics', icon: '🎧' },
    { name: 'Fashion', icon: '👔' },
    { name: 'Home & Kitchen', icon: '☕' },
    { name: 'Mobile Accessories', icon: '⚡' },
    { name: 'Sports & Outdoors', icon: '🧘' }
  ];

  return (
    <div className="min-h-screen pb-12" id="xantro-home-view">
      {/* 1. TOP ADVERTISEMENT BANNER (Active ₹100 Ads) */}
      <AdBanner advertisements={advertisements} onSelectProduct={onSelectProductId} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* 2. CATEGORY SELECTOR STRIP */}
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => onCategoryChange(cat.name)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                  selectedCategory === cat.name
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                id={`cat-filter-${cat.name}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. POPULAR / FAMOUS PRODUCTS (Only shown if not searching and All category) */}
        {!searchQuery && selectedCategory === 'All' && popularProducts.length > 0 && (
          <section className="space-y-4" id="popular-products-section">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-yellow-100 text-yellow-800 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                    Popular & Famous Products
                  </h2>
                  <p className="text-[11px] text-gray-500">Based on verified customer orders and top ratings</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {popularProducts.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
              ))}
            </div>
          </section>
        )}

        {/* 4. RECENT PRODUCTS (Only shown if not searching and All category) */}
        {!searchQuery && selectedCategory === 'All' && recentProducts.length > 0 && (
          <section className="space-y-4" id="recent-products-section">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-green-100 text-green-800 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                    Recent Products
                  </h2>
                  <p className="text-[11px] text-gray-500">Freshly activated listings from independent sellers</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentProducts.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
              ))}
            </div>
          </section>
        )}

        {/* 5. ALL PRODUCTS / FILTERED SEARCH CATALOG */}
        <section className="space-y-4" id="all-products-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 leading-tight flex items-center gap-2">
                <Grid className="w-4 h-4 text-blue-600" />
                <span>
                  {searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : selectedCategory !== 'All'
                    ? `${selectedCategory} Catalog`
                    : 'All Marketplace Listings'}
                </span>
                <span className="text-xs font-normal text-gray-500">({products.length} products)</span>
              </h2>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="text-xs font-semibold bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 focus:border-blue-600 outline-hidden cursor-pointer"
                id="catalog-sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8 space-y-4 shadow-2xs">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">
                  {searchQuery
                    ? `No products found matching "${searchQuery}"`
                    : selectedCategory !== 'All'
                    ? `No products listed in "${selectedCategory}" yet`
                    : 'No products listed in the marketplace yet'}
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  {searchQuery || selectedCategory !== 'All'
                    ? 'Try searching for another keyword or switch back to All categories.'
                    : 'Products will appear here in real-time as independent merchants list and activate them via XANTRO RETAIL.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {(searchQuery || selectedCategory !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      onCategoryChange('All');
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-colors"
                  >
                    View All Categories
                  </button>
                )}
                {onNavigateToSeller && (
                  <button
                    type="button"
                    onClick={onNavigateToSeller}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                    id="empty-state-sell-btn"
                  >
                    Sell a Product
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

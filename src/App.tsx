import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Product, Advertisement } from './types';
import { apiFetchCatalog, apiFetchAdvertisements } from './api';

// Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { TermsModal } from './components/TermsModal';
import { ProductDetailModal } from './components/ProductDetailModal';

// Views
import { HomeView } from './views/HomeView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrdersView } from './views/OrdersView';
import { ProfileView } from './views/ProfileView';
import { SellerView } from './views/SellerView';
import { AdminView } from './views/AdminView';

export type AppView = 'home' | 'cart' | 'checkout' | 'orders' | 'profile' | 'seller' | 'admin';

const MainApp: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('home');

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Modals State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [authModalConfig, setAuthModalConfig] = useState<{
    isOpen: boolean;
    initialMode: 'login' | 'signup';
    initialRole: 'buyer' | 'seller';
  }>({
    isOpen: false,
    initialMode: 'login',
    initialRole: 'buyer'
  });

  const [termsModalConfig, setTermsModalConfig] = useState<{
    isOpen: boolean;
    initialTab: 'general' | 'buyer' | 'seller' | 'privacy';
  }>({
    isOpen: false,
    initialTab: 'general'
  });

  // Direct Checkout Item for "Buy Now" flow
  const [directCheckoutItem, setDirectCheckoutItem] = useState<{
    product: Product;
    quantity: number;
  } | null>(null);

  // Fetch catalog & advertisements
  const loadMarketplaceData = async () => {
    try {
      setLoadingCatalog(true);
      const [catRes, adRes] = await Promise.all([
        apiFetchCatalog({
          category: selectedCategory,
          search: searchQuery,
          sort: sortBy
        }),
        apiFetchAdvertisements()
      ]);

      setProducts(catRes.products || []);
      setRecentProducts(catRes.recent || []);
      setPopularProducts(catRes.popular || []);
      setAdvertisements(adRes.advertisements || []);
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    if (currentView === 'home') {
      loadMarketplaceData();
    }
  }, [currentView, selectedCategory, searchQuery, sortBy]);

  // Handle open auth modal
  const handleOpenAuth = (mode: 'login' | 'signup' = 'login', role: 'buyer' | 'seller' = 'buyer') => {
    setAuthModalConfig({
      isOpen: true,
      initialMode: mode,
      initialRole: role
    });
  };

  // Handle open terms modal
  const handleOpenTerms = (tab: 'general' | 'buyer' | 'seller' | 'privacy' = 'general') => {
    setTermsModalConfig({
      isOpen: true,
      initialTab: tab
    });
  };

  // Handle selecting product from any view or ad
  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
  };

  const handleSelectProductId = (productId: string) => {
    const found = products.find((p) => p.id === productId);
    if (found) {
      setSelectedProduct(found);
    }
  };

  // Handle "Buy Now" directly from product modal
  const handleBuyNow = (product: Product, quantity: number) => {
    setSelectedProduct(null);
    setDirectCheckoutItem({ product, quantity });

    if (!isAuthenticated) {
      handleOpenAuth('login', 'buyer');
    } else {
      setCurrentView('checkout');
    }
  };

  // Handle standard cart item add
  const handleAddToCart = (product: Product, quantity: number) => {
    const res = addToCart(product, quantity);
    if (!res.success && res.message) {
      alert(res.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 text-gray-800 font-sans antialiased" id="xantro-app-root">
      {/* 1. Global Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          setDirectCheckoutItem(null);
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentView !== 'home') setCurrentView('home');
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(c) => {
          setSelectedCategory(c);
          if (currentView !== 'home') setCurrentView('home');
        }}
        onOpenAuth={handleOpenAuth}
        onOpenTerms={handleOpenTerms}
      />

      {/* 2. Primary Main Content Container */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            products={products}
            recentProducts={recentProducts}
            popularProducts={popularProducts}
            advertisements={advertisements}
            onSelectProduct={handleSelectProduct}
            onSelectProductId={handleSelectProductId}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchQuery={searchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onNavigateToSeller={() => setCurrentView('seller')}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            onProceedToCheckout={() => {
              setDirectCheckoutItem(null);
              setCurrentView('checkout');
            }}
            onOpenAuth={handleOpenAuth}
            onContinueShopping={() => setCurrentView('home')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            directItem={directCheckoutItem}
            onOrderSuccess={(orderId) => {
              setDirectCheckoutItem(null);
              setCurrentView('orders');
            }}
            onBackToCart={() => {
              setDirectCheckoutItem(null);
              setCurrentView('cart');
            }}
          />
        )}

        {currentView === 'orders' && (
          <OrdersView
            onContinueShopping={() => setCurrentView('home')}
            onSelectProductById={handleSelectProductId}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            onNavigateToOrders={() => setCurrentView('orders')}
            onNavigateHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'seller' && (
          <SellerView
            onOpenAuth={handleOpenAuth}
            onOpenTerms={handleOpenTerms}
            onNavigateHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'admin' && (
          <AdminView onNavigateHome={() => setCurrentView('home')} />
        )}
      </main>

      {/* 3. Global Footer */}
      <Footer onOpenTerms={handleOpenTerms} onNavigate={(v) => setCurrentView(v)} />

      {/* 4. Global Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* 5. Global Authentication Modal (Login / Signup) */}
      <AuthModal
        isOpen={authModalConfig.isOpen}
        initialMode={authModalConfig.initialMode}
        initialRole={authModalConfig.initialRole}
        onClose={() => setAuthModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onOpenTerms={handleOpenTerms}
      />

      {/* 6. Global Terms and Policies Modal */}
      <TermsModal
        isOpen={termsModalConfig.isOpen}
        initialTab={termsModalConfig.initialTab}
        onClose={() => setTermsModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}

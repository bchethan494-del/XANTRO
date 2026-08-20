import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Product, Order, Advertisement } from '../types';
import {
  apiFetchSellerProducts,
  apiCreateProduct,
  apiVerifyListingFee,
  apiFetchSellerEarnings,
  apiFetchSellerOrders,
  apiShipOrder,
  apiUpdateOrderStatus,
  apiCreateAd,
  apiVerifyAdFee,
  apiUpdateProfile
} from '../api';
import { UpiPaymentModal } from '../components/UpiPaymentModal';
import {
  PlusCircle,
  Package,
  ShoppingBag,
  Truck,
  DollarSign,
  Megaphone,
  Store,
  LogOut,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SellerViewProps {
  onOpenAuth: (mode?: 'login' | 'signup', role?: 'buyer' | 'seller') => void;
  onOpenTerms: (tab: 'general' | 'buyer' | 'seller' | 'privacy') => void;
  onNavigateHome: () => void;
}

export const SellerView: React.FC<SellerViewProps> = ({ onOpenAuth, onOpenTerms, onNavigateHome }) => {
  const { user, isAuthenticated, updateUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'sell' | 'my-products' | 'orders' | 'delivery' | 'earnings' | 'ads' | 'profile'
  >('my-products');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // New Product Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [deliveryFee, setDeliveryFee] = useState<string>('40');
  const [quantity, setQuantity] = useState<string>('10');
  const [category, setCategory] = useState('Electronics');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [createError, setCreateError] = useState('');
  const [createdProductPending, setCreatedProductPending] = useState<Product | null>(null);

  // UPI Modal State for Listing Fee or Ad Fee
  const [upiModalConfig, setUpiModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    amount: number;
    paymentType: 'LISTING_FEE' | 'ADVERTISEMENT_FEE' | 'ORDER_PAYMENT';
    onSuccess: (utr: string) => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    amount: 0,
    paymentType: 'LISTING_FEE',
    onSuccess: async () => {}
  });

  // Ship Order Modal State
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [courierName, setCourierName] = useState('Bluedart Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [expectedDate, setExpectedDate] = useState('');

  // Seller Profile State
  const [storeName, setStoreName] = useState(user?.sellerDetails?.storeName || '');
  const [sellerUpiId, setSellerUpiId] = useState(user?.sellerDetails?.sellerUpiId || '');
  const [bankAccount, setBankAccount] = useState(user?.sellerDetails?.bankAccountNumber || '');
  const [ifsc, setIfsc] = useState(user?.sellerDetails?.ifscCode || '');
  const [profileMsg, setProfileMsg] = useState('');

  const sellerId = user?.id || 'usr_seller_1';

  const loadSellerData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [prodRes, earnRes, ordRes] = await Promise.all([
        apiFetchSellerProducts(sellerId),
        apiFetchSellerEarnings(sellerId),
        apiFetchSellerOrders(sellerId)
      ]);
      setProducts(prodRes.products || []);
      setEarnings(earnRes);
      setOrders(ordRes.orders || []);
    } catch (err) {
      console.error('Error loading seller hub data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'seller') {
      loadSellerData();
    }
  }, [user]);

  // If not logged in or not a seller
  if (!isAuthenticated || user?.role !== 'seller') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center" id="seller-auth-guard">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-extrabold text-gray-900 mb-2">XANTRO RETAIL — Seller Portal</h1>
        <p className="text-xs text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
          XANTRO provides high-performance marketplace infrastructure for independent merchants. Sell your products with transparent 1% listing activation and direct buyer fulfillment.
        </p>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 max-w-md mx-auto mb-6 space-y-2 text-left">
          <div className="font-bold text-gray-900">Seller Highlights:</div>
          <div className="flex items-center gap-2">✓ 1% automated listing activation fee</div>
          <div className="flex items-center gap-2">✓ Keep full control over product pricing & delivery fees</div>
          <div className="flex items-center gap-2">✓ Optional ₹100 homepage banner advertising</div>
          <div className="flex items-center gap-2">✓ Automated order dispatch & tracking management</div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('signup', 'seller')}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
            id="btn-seller-signup-cta"
          >
            Register as Seller
          </button>
          <button
            onClick={() => onOpenAuth('login', 'seller')}
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold transition-colors"
            id="btn-seller-login-cta"
          >
            Seller Log In
          </button>
        </div>

        <p className="text-[11px] text-gray-400 mt-6">
          By registering, you agree to the{' '}
          <button onClick={() => onOpenTerms('seller')} className="underline hover:text-blue-600">
            XANTRO Seller Terms & Responsibilities
          </button>
          .
        </p>
      </div>
    );
  }

  // Listing Fee Calculation: 1% of product price
  const numPrice = Number(price) || 0;
  const listingFee = Math.max(1, Math.round((numPrice * 1) / 100));

  // Handle Product Submission
  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (images.length === 0) {
      setCreateError('Please upload at least one product picture.');
      return;
    }
    if (!name.trim()) {
      setCreateError('Please enter product name.');
      return;
    }
    if (!numPrice || numPrice <= 0) {
      setCreateError('Please enter a valid product price.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiCreateProduct({
        sellerId: user.id,
        sellerName: user.sellerDetails?.storeName || user.name,
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        deliveryFee: Number(deliveryFee) || 0,
        category,
        images,
        quantity: Number(quantity) || 1
      });

      setCreatedProductPending(res.product);

      // Open automated UPI payment modal for the 1% fee
      setUpiModalConfig({
        isOpen: true,
        title: '1% Seller Listing Activation Fee',
        subtitle: `Activate "${res.product.name}" on XANTRO Marketplace`,
        amount: res.listingFee,
        paymentType: 'LISTING_FEE',
        onSuccess: async (utr) => {
          await apiVerifyListingFee({
            productId: res.product.id,
            sellerId: user.id,
            paymentReference: utr
          });
          // Reset form & reload
          setName('');
          setDescription('');
          setPrice('');
          setDeliveryFee('40');
          setImages([]);
          setCreatedProductPending(null);
          await loadSellerData();
          setActiveTab('my-products');
        }
      });
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  // Pay pending 1% fee on existing product
  const handlePayPendingListingFee = (prod: Product) => {
    setUpiModalConfig({
      isOpen: true,
      title: '1% Seller Listing Activation Fee',
      subtitle: `Activate "${prod.name}" on XANTRO`,
      amount: prod.listingFeeAmount,
      paymentType: 'LISTING_FEE',
      onSuccess: async (utr) => {
        await apiVerifyListingFee({
          productId: prod.id,
          sellerId: user.id,
          paymentReference: utr
        });
        await loadSellerData();
      }
    });
  };

  // Advertise Product (₹100)
  const handleAdvertiseProduct = async (prod: Product) => {
    try {
      const res = await apiCreateAd({
        productId: prod.id,
        sellerId: user.id
      });

      setUpiModalConfig({
        isOpen: true,
        title: 'XANTRO Top Banner Advertisement',
        subtitle: `Promote "${prod.name}" for 7 Days (₹100 Fee)`,
        amount: res.fee || 100,
        paymentType: 'ADVERTISEMENT_FEE',
        onSuccess: async (utr) => {
          await apiVerifyAdFee(res.advertisement.id, utr);
          await loadSellerData();
          alert('Advertisement activated! Your product is now promoted at the top of the homepage.');
        }
      });
    } catch (err: any) {
      alert(err.message || 'Could not initiate ad.');
    }
  };

  // Mark Order as Shipped
  const handleConfirmShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingOrderId) return;

    try {
      await apiShipOrder(shippingOrderId, {
        courierName: courierName.trim() || 'Express Courier',
        trackingNumber: trackingNumber.trim() || `TRK-XAN-${Date.now().toString().slice(-6)}`,
        expectedDeliveryDate: expectedDate
      });
      setShippingOrderId(null);
      setTrackingNumber('');
      await loadSellerData();
    } catch (err: any) {
      alert(err.message || 'Failed to update shipping.');
    }
  };

  // Update order status directly
  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await apiUpdateOrderStatus(orderId, { status });
      await loadSellerData();
    } catch (err: any) {
      alert('Failed to update status.');
    }
  };

  // Save Seller Bank Details
  const handleSaveSellerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      const res = await apiUpdateProfile({
        userId: user.id,
        sellerDetails: {
          storeName: storeName.trim(),
          sellerUpiId: sellerUpiId.trim(),
          bankAccountNumber: bankAccount.trim(),
          ifscCode: ifsc.trim()
        }
      });
      updateUser(res.user);
      setProfileMsg('Store settings & settlement details saved successfully.');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileMsg('Failed to save settings.');
    }
  };

  // Quick helper image adder
  const handleAddSampleImage = (url: string) => {
    if (!images.includes(url)) {
      setImages([...images, url]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="seller-window-main">
      {/* SELLER WINDOW Top Navigation Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 leading-tight">SELLER WINDOW</h1>
            <p className="text-xs text-gray-500">
              {user.sellerDetails?.storeName || `${user.name}'s Store`} • Independent Merchant
            </p>
          </div>
        </div>

        {/* Action quick stats */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sell')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            id="btn-seller-sell-product-top"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Sell Product</span>
          </button>

          <button
            onClick={loadSellerData}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-2xs space-y-1 h-fit">
          <button
            onClick={() => setActiveTab('sell')}
            className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'sell'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>Sell Product</span>
          </button>

          <button
            onClick={() => setActiveTab('my-products')}
            className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'my-products'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package className="w-4 h-4 text-gray-500" />
            <span>My Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'orders'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-gray-500" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'delivery'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Truck className="w-4 h-4 text-gray-500" />
            <span>Delivery Management</span>
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'earnings'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span>Earnings</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'ads'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Megaphone className="w-4 h-4 text-yellow-600" />
            <span>Advertisement (₹100)</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Store className="w-4 h-4 text-gray-500" />
            <span>Profile & Settlement</span>
          </button>

          <div className="border-t border-gray-100 my-1 pt-1"></div>

          <button
            onClick={() => {
              logout();
              onNavigateHome();
            }}
            className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="md:col-span-3 space-y-6">
          {/* TAB 1: SELL PRODUCT */}
          {activeTab === 'sell' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-5">
              <div className="pb-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  List a New Product for Sale
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Enter product details, upload at least 1 image, and activate via automated 1% listing fee.
                </p>
              </div>

              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateProductSubmit} className="space-y-4 text-xs">
                {/* 1. Mandatory Product Pictures */}
                <div className="space-y-2">
                  <label className="block font-bold text-gray-800">
                    Product Picture(s) <span className="text-red-500">* (Minimum 1 Required)</span>
                  </label>

                  {/* Picture Preview Grid */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg border overflow-hidden bg-gray-50">
                        <img src={img} alt="Product preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Image Input / Instant Samples */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Paste Image URL (or select sample below)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (imageUrlInput.trim()) {
                          setImages([...images, imageUrlInput.trim()]);
                          setImageUrlInput('');
                        }
                      }}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 font-bold rounded-lg text-gray-700"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* Sample Quick Images for easy testing */}
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[10px]">
                    <span className="text-gray-400 font-semibold shrink-0">Quick Add:</span>
                    <button
                      type="button"
                      onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80')}
                      className="px-2 py-1 bg-gray-100 hover:bg-blue-50 rounded text-gray-700"
                    >
                      Smart Watch
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80')}
                      className="px-2 py-1 bg-gray-100 hover:bg-blue-50 rounded text-gray-700"
                    >
                      Camera Lens
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80')}
                      className="px-2 py-1 bg-gray-100 hover:bg-blue-50 rounded text-gray-700"
                    >
                      Headphones
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80')}
                      className="px-2 py-1 bg-gray-100 hover:bg-blue-50 rounded text-gray-700"
                    >
                      Sneakers
                    </button>
                  </div>
                </div>

                {/* 2. Product Name */}
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ultra-Bass ANC Bluetooth Earbuds"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-blue-600"
                  />
                </div>

                {/* Category & Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Product Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-blue-600 bg-white"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                      <option value="Mobile Accessories">Mobile Accessories</option>
                      <option value="Sports & Outdoors">Sports & Outdoors</option>
                      <option value="Books & Stationery">Books & Stationery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Available Quantity (Stock)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Pricing & Delivery Fee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                      Product Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                      Delivery Fee (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      placeholder="e.g. 40"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide accurate specifications, materials, warranty, and package contents..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-blue-600"
                  />
                </div>

                {/* 1% Listing Fee Calculation Preview Box */}
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span>Automated 1% Listing Activation Fee:</span>
                    <span className="text-sm text-blue-900 font-extrabold">₹{listingFee}</span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    Product Price (₹{numPrice || 0}) × 1% = <strong>₹{listingFee}</strong>. Upon submission, you will be prompted to authorize this listing fee via automated UPI to immediately activate the listing.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs flex items-center justify-center gap-2"
                  id="btn-submit-sell-product"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit Product & Pay ₹{listingFee} Listing Fee</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: MY PRODUCTS */}
          {activeTab === 'my-products' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    My Listed Products
                  </h2>
                  <p className="text-xs text-gray-500">Manage status, inventory and advertisements.</p>
                </div>
                <button
                  onClick={() => setActiveTab('sell')}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Product</span>
                </button>
              </div>

              {products.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500 space-y-3">
                  <Package className="w-8 h-8 text-gray-300 mx-auto" />
                  <p>You haven't listed any products yet.</p>
                  <button
                    onClick={() => setActiveTab('sell')}
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs"
                  >
                    Create Your First Listing
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {products.map((prod) => (
                    <div
                      key={prod.id}
                      className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                      id={`seller-prod-${prod.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 object-cover rounded-lg bg-gray-100 shrink-0 border border-gray-100"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 truncate">{prod.name}</h3>
                            {prod.status === 'ACTIVE' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                                ACTIVE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800">
                                PAYMENT REQUIRED (₹{prod.listingFeeAmount})
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-3">
                            <span>Price: <strong>₹{prod.price}</strong></span>
                            <span>Delivery: <strong>₹{prod.deliveryFee}</strong></span>
                            <span>Stock: <strong>{prod.quantity} units</strong></span>
                            <span>Sold: <strong>{prod.purchaseCount || 0}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {prod.status === 'PAYMENT_PENDING' ? (
                          <button
                            type="button"
                            onClick={() => handlePayPendingListingFee(prod)}
                            className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold rounded-lg text-xs"
                          >
                            Pay ₹{prod.listingFeeAmount} to Activate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAdvertiseProduct(prod)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg text-xs flex items-center gap-1"
                          >
                            <Megaphone className="w-3 h-3 text-blue-600" />
                            <span>Advertise (₹100)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Customer Orders for Your Store
                  </h2>
                  <p className="text-xs text-gray-500">View orders, prepare packages and update dispatch tracking.</p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500">
                  <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  No customer orders received yet. Once customers purchase your active items, orders will appear here.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">{ord.id}</span>
                          <span className="text-gray-500">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            {ord.orderStatus}
                          </span>
                          <span className="font-extrabold text-blue-900">
                            ₹{ord.grandTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100">
                            <img src={it.productImage} alt={it.productName} referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">{it.productName}</p>
                              <span className="text-[11px] text-gray-500">
                                Qty: {it.quantity} • Item: ₹{it.price} + Del: ₹{it.deliveryFee}
                              </span>
                            </div>
                            <span className="font-bold text-gray-900">₹{it.total}</span>
                          </div>
                        ))}
                      </div>

                      {/* Customer Delivery Info */}
                      <div className="p-3 bg-white rounded-lg border border-gray-200 text-[11px] text-gray-700">
                        <span className="font-bold block text-gray-900 mb-0.5">Shipping Destination:</span>
                        {ord.deliveryAddress?.fullName} • {ord.deliveryAddress?.phone}
                        <div className="text-gray-500">
                          {ord.deliveryAddress?.street}, {ord.deliveryAddress?.city}, {ord.deliveryAddress?.state} - {ord.deliveryAddress?.pinCode}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="text-[11px] text-gray-500">
                          {ord.trackingInfo.courierName && (
                            <span>
                              Shipped via <strong>{ord.trackingInfo.courierName}</strong> (ID: {ord.trackingInfo.trackingNumber})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {ord.orderStatus !== 'Delivered' && (
                            <button
                              type="button"
                              onClick={() => {
                                setShippingOrderId(ord.id);
                                setTrackingNumber(`BD-${Date.now().toString().slice(-8)}-IN`);
                                setExpectedDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                            >
                              {ord.orderStatus === 'Shipped' ? 'Update Tracking' : 'Mark as Shipped'}
                            </button>
                          )}

                          {ord.orderStatus === 'Shipped' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(ord.id, 'Out for Delivery')}
                              className="px-2.5 py-1.5 bg-yellow-500 text-yellow-950 font-bold rounded-lg text-xs"
                            >
                              Out for Delivery
                            </button>
                          )}

                          {ord.orderStatus === 'Out for Delivery' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(ord.id, 'Delivered')}
                              className="px-2.5 py-1.5 bg-green-600 text-white font-bold rounded-lg text-xs"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DELIVERY MANAGEMENT */}
          {activeTab === 'delivery' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4 text-xs">
              <div className="pb-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Delivery & Logistics Management
                </h2>
                <p className="text-gray-500 mt-0.5">
                  Sellers are responsible for packaging products securely and providing valid courier tracking details.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <span className="text-gray-500 font-semibold block">Pending Dispatch</span>
                  <span className="text-xl font-bold text-gray-900">
                    {orders.filter((o) => o.orderStatus === 'Order Placed' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing').length}
                  </span>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <span className="text-blue-700 font-semibold block">In Transit / Shipped</span>
                  <span className="text-xl font-bold text-blue-900">
                    {orders.filter((o) => o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery').length}
                  </span>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                  <span className="text-green-700 font-semibold block">Successfully Delivered</span>
                  <span className="text-xl font-bold text-green-900">
                    {orders.filter((o) => o.orderStatus === 'Delivered').length}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
                <strong>Seller Delivery Mandate:</strong>
                <p className="text-[11px] leading-relaxed">
                  Always inspect packaging, attach tamper-evident seals, and enter legitimate tracking IDs from authorized courier providers (such as Bluedart, Delhivery, DTDC, India Post, or Ecom Express).
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-5 text-xs">
              <div className="pb-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Store Financials & Settlements
                </h2>
                <p className="text-gray-500 mt-0.5">
                  Overview of total sales, listing fees, and settled amounts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-500 block mb-1">Total Products Sold</span>
                  <span className="text-xl font-extrabold text-gray-900">
                    {earnings?.totalProductsSold || 0} units
                  </span>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-blue-700 block mb-1">Total Gross Sales</span>
                  <span className="text-xl font-extrabold text-blue-900">
                    ₹{(earnings?.totalSales || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <span className="text-yellow-800 block mb-1">Listing Fees Paid (1%)</span>
                  <span className="text-xl font-extrabold text-yellow-900">
                    ₹{(earnings?.listingFeesPaid || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <span className="text-green-700 block mb-1">Pending Settlement</span>
                  <span className="text-xl font-extrabold text-green-900">
                    ₹{(earnings?.pendingSettlement || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 text-[11px] space-y-1">
                <strong>Settlement Policy:</strong>
                <p>
                  Customer order amounts are credited directly to your registered bank account/UPI ID according to configured payment provider settlement cycles.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: ADVERTISEMENT (₹100) */}
          {activeTab === 'ads' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-5 text-xs">
              <div className="pb-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  XANTRO ₹100 Advertisement Promotion
                </h2>
                <p className="text-gray-500 mt-0.5">
                  Boost your active product by paying ₹100 to display it as a featured advertisement at the top of the XANTRO customer homepage.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-900 flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-yellow-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-sm block">Promote Any Active Product for ₹100</span>
                  <p className="text-[11px] leading-relaxed">
                    Promoted products appear immediately in the top banner on the customer homepage with an eye-catching "ADVERTISEMENT" badge.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">Select an Active Product to Promote:</h3>

                {products.filter((p) => p.status === 'ACTIVE').length === 0 ? (
                  <p className="text-gray-500">You have no active products. List and activate a product first.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {products
                      .filter((p) => p.status === 'ACTIVE')
                      .map((prod) => (
                        <div key={prod.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img src={prod.images[0]} alt={prod.name} referrerPolicy="no-referrer" className="w-12 h-12 object-cover rounded" />
                            <div>
                              <p className="font-bold text-gray-900">{prod.name}</p>
                              <span className="text-[11px] text-gray-500">
                                ₹{prod.price} (+ ₹{prod.deliveryFee} Del.) {prod.isAdvertised ? '• Currently Promoted' : ''}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAdvertiseProduct(prod)}
                            className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold rounded-lg text-xs"
                          >
                            Pay ₹100 & Promote
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: PROFILE & SETTLEMENT */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4 text-xs">
              <div className="pb-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Store Profile & Private Settlement Details
                </h2>
                <p className="text-gray-500 mt-0.5">
                  Your settlement UPI and bank details are private and never exposed to customers.
                </p>
              </div>

              <form onSubmit={handleSaveSellerProfile} className="space-y-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Store / Business Name</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Private Bank & Settlement Configuration</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Seller UPI ID (Private)</label>
                    <input
                      type="text"
                      value={sellerUpiId}
                      onChange={(e) => setSellerUpiId(e.target.value)}
                      placeholder="e.g. yourstore@okaxis"
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Bank Account Number</label>
                      <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="e.g. 501004928192"
                        className="w-full px-3 py-2 border rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                        placeholder="e.g. HDFC0001234"
                        className="w-full px-3 py-2 border rounded-lg bg-white uppercase"
                      />
                    </div>
                  </div>
                </div>

                {profileMsg && <p className="text-xs text-green-700 font-bold">{profileMsg}</p>}

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                >
                  Save Store & Settlement Details
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Ship Order Modal */}
      {shippingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900">Mark Order as Shipped</h3>
            <p className="text-gray-500">Provide courier shipping provider and tracking code for the customer.</p>

            <form onSubmit={handleConfirmShipment} className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Courier / Shipping Provider</label>
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tracking Number / AWB</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  required
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShippingOrderId(null)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold"
                >
                  Confirm Shipment & Update Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Automated UPI Payment Modal (1% Listing Fee or ₹100 Ad) */}
      <UpiPaymentModal
        isOpen={upiModalConfig.isOpen}
        onClose={() => setUpiModalConfig((prev) => ({ ...prev, isOpen: false }))}
        title={upiModalConfig.title}
        subtitle={upiModalConfig.subtitle}
        amount={upiModalConfig.amount}
        paymentType={upiModalConfig.paymentType}
        onPaymentSuccess={upiModalConfig.onSuccess}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetchAdminDashboard, apiUpdateAdminSettings } from '../api';
import {
  ShieldAlert,
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  Megaphone,
  Settings,
  Lock,
  CheckCircle,
  Eye,
  ArrowRight
} from 'lucide-react';

interface AdminViewProps {
  onNavigateHome: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onNavigateHome }) => {
  const { user, switchRoleDemo } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'products' | 'orders' | 'fees' | 'ads' | 'settings'>('metrics');

  // Settings form state
  const [listingFeePercent, setListingFeePercent] = useState('1');
  const [adFeeAmount, setAdFeeAmount] = useState('100');
  const [ownerUpiId, setOwnerUpiId] = useState('6363048473@ybl');
  const [settingsMsg, setSettingsMsg] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiFetchAdminDashboard();
      setData(res);
      if (res.settings) {
        setListingFeePercent(String(res.settings.sellerListingFeePercent || 1));
        setAdFeeAmount(String(res.settings.advertisementFeeAmount || 100));
        setOwnerUpiId(res.settings.ownerUpiId || '6363048473@ybl');
      }
    } catch (err) {
      console.error('Error fetching admin dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg('');
    try {
      await apiUpdateAdminSettings({
        sellerListingFeePercent: Number(listingFeePercent),
        advertisementFeeAmount: Number(adFeeAmount),
        ownerUpiId: ownerUpiId.trim()
      });
      setSettingsMsg('Platform settings updated successfully.');
      setTimeout(() => setSettingsMsg(''), 3000);
      await loadDashboard();
    } catch (err) {
      setSettingsMsg('Failed to update settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Restricted Admin Area</h2>
        <p className="text-xs text-gray-500 mb-4">
          This portal is restricted to authorized platform administrators and owners.
        </p>
        <button
          onClick={async () => {
            await switchRoleDemo('admin');
            await loadDashboard();
          }}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold rounded-lg text-xs"
        >
          Sign in as Admin Demo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="admin-dashboard-container">
      {/* Header */}
      <div className="bg-gray-900 text-white rounded-xl p-6 mb-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-500 text-yellow-950 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold leading-tight">XANTRO OWNER & ADMIN DASHBOARD</h1>
            <p className="text-xs text-gray-400">Platform Governance, Revenue & Settlement Controls</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-yellow-400 font-bold uppercase block">Total Platform Revenue</span>
            <span className="text-lg font-black text-white">
              ₹{(data?.metrics?.totalPlatformRevenue || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <button
            onClick={loadDashboard}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold rounded-lg text-gray-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-2xs space-y-1 h-fit text-xs font-bold">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`w-full text-left px-3.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
              activeTab === 'metrics' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Platform Revenue & Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full text-left px-3.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
              activeTab === 'users' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Merchants</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full text-left px-3.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
              activeTab === 'products' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-3.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
              activeTab === 'orders' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>All Marketplace Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className={`w-full text-left px-3.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
              activeTab === 'fees' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>1% Seller Listing Fees</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`w-full text-left px-3.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
              activeTab === 'ads' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>₹100 Advertisements</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-3.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
              activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Platform Settings</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* TAB 1: METRICS */}
          {activeTab === 'metrics' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
                Marketplace Revenue Summary
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-yellow-50/70 rounded-xl border border-yellow-200">
                  <span className="text-xs font-semibold text-yellow-800 block">Total Platform Revenue</span>
                  <span className="text-2xl font-black text-gray-900 mt-1 block">
                    ₹{(data?.metrics?.totalPlatformRevenue || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-gray-500">Combined listing & advertising fees</span>
                </div>

                <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200">
                  <span className="text-xs font-semibold text-blue-700 block">1% Listing Fees Collected</span>
                  <span className="text-2xl font-black text-gray-900 mt-1 block">
                    ₹{(data?.metrics?.listingFeesRevenue || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-gray-500">From activated seller products</span>
                </div>

                <div className="p-4 bg-green-50/70 rounded-xl border border-green-200">
                  <span className="text-xs font-semibold text-green-700 block">₹100 Ad Revenue</span>
                  <span className="text-2xl font-black text-gray-900 mt-1 block">
                    ₹{(data?.metrics?.advertisementRevenue || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-gray-500">From homepage sponsored slots</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-4 border-t border-gray-100">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <span className="text-gray-500 block">Total Buyers</span>
                  <span className="text-lg font-bold text-gray-900">{data?.metrics?.buyersCount || 0}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <span className="text-gray-500 block">Total Sellers</span>
                  <span className="text-lg font-bold text-gray-900">{data?.metrics?.sellersCount || 0}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <span className="text-gray-500 block">Active Listings</span>
                  <span className="text-lg font-bold text-gray-900">{data?.metrics?.activeProducts || 0}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <span className="text-gray-500 block">Orders Placed</span>
                  <span className="text-lg font-bold text-gray-900">{data?.metrics?.totalOrders || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4 text-xs">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
                Platform Users & Verified Sellers
              </h2>

              <div className="divide-y divide-gray-100">
                {(data?.users || []).map((u: any) => (
                  <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        <span>{u.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-blue-100 text-blue-800">
                          {u.role}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        {u.phone || u.email} • Provider: {u.authProvider}
                      </span>
                    </div>
                    {u.sellerDetails?.storeName && (
                      <span className="text-gray-600 font-medium">
                        Store: <strong>{u.sellerDetails.storeName}</strong>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4 text-xs">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
                Marketplace Listings Database
              </h2>

              <div className="divide-y divide-gray-100">
                {(data?.products || []).map((prod: any) => (
                  <div key={prod.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={prod.images[0]} alt={prod.name} referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded" />
                      <div>
                        <p className="font-bold text-gray-900">{prod.name}</p>
                        <span className="text-[11px] text-gray-500">
                          Seller: {prod.sellerName} • Price: ₹{prod.price} (+ ₹{prod.deliveryFee} Del.)
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      prod.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {prod.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4 text-xs">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
                All Orders Across Platform
              </h2>

              <div className="space-y-3">
                {(data?.orders || []).map((ord: any) => (
                  <div key={ord.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-gray-900">{ord.id} • {ord.buyerName}</div>
                      <span className="text-[11px] text-gray-500">
                        {ord.items.length} item(s) • Total: ₹{ord.grandTotal} • {ord.paymentMethod}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {ord.orderStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: 1% LISTING FEES */}
          {activeTab === 'fees' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4 text-xs">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
                1% Seller Listing Fee Transactions
              </h2>

              <div className="divide-y divide-gray-100">
                {(data?.listingFeeTransactions || []).map((tx: any) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900">{tx.productName}</p>
                      <span className="text-[11px] text-gray-500 font-mono">
                        Ref: {tx.utrReference} • {new Date(tx.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-blue-900 text-sm">₹{tx.amount}</span>
                      <span className="block text-[10px] text-green-700 font-bold">{tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ADS */}
          {activeTab === 'ads' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4 text-xs">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
                ₹100 Homepage Advertisements
              </h2>

              <div className="divide-y divide-gray-100">
                {(data?.advertisements || []).map((ad: any) => (
                  <div key={ad.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={ad.productImage} alt={ad.productName} referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded" />
                      <div>
                        <p className="font-bold text-gray-900">{ad.productName}</p>
                        <span className="text-[11px] text-gray-500">
                          Seller: {ad.sellerName} • Ad Fee Paid: ₹{ad.amount}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                      {ad.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: PLATFORM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-5 text-xs">
              <div className="pb-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Platform Fee & Owner Private Configuration
                </h2>
                <p className="text-gray-500 mt-0.5">
                  Configure platform fee percentages and owner settlement UPI ID.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                      Seller Listing Activation Fee (%)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={listingFeePercent}
                      onChange={(e) => setListingFeePercent(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg font-bold"
                    />
                    <span className="text-[10px] text-gray-500">Default: 1%</span>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                      Advertisement Fee (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={adFeeAmount}
                      onChange={(e) => setAdFeeAmount(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg font-bold"
                    />
                    <span className="text-[10px] text-gray-500">Default: ₹100</span>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50/70 border border-yellow-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-yellow-900">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Owner UPI ID (Private & Secure Server-Side)</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={ownerUpiId}
                    onChange={(e) => setOwnerUpiId(e.target.value)}
                    placeholder="6363048473@ybl"
                    className="w-full px-3 py-2 border rounded-lg font-mono bg-white text-xs"
                  />
                  <p className="text-[11px] text-yellow-800">
                    <strong>Owner Privacy Protection:</strong> This UPI ID is protected on the server and is NEVER exposed through public APIs, frontend clients, or public checkout pages.
                  </p>
                </div>

                {settingsMsg && <p className="text-xs text-green-700 font-bold">{settingsMsg}</p>}

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                >
                  {savingSettings ? 'Saving...' : 'Save Platform Settings'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRedeemGiftCard, apiUpdateProfile } from '../api';
import { User, GiftCard, UserAddress } from '../types';
import { User as UserIcon, Gift, FileText, MapPin, Settings, LogOut, Package, Check, AlertCircle, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProfileViewProps {
  onNavigateToOrders: () => void;
  onNavigateHome: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToOrders, onNavigateHome }) => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'giftcards' | 'files' | 'addresses' | 'settings'>('profile');

  // Gift Card State
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftMsg, setGiftMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Settings State
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Address State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<UserAddress>({
    id: '',
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    isDefault: false
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Please Log In</h2>
        <p className="text-xs text-gray-500 mb-4">Sign in to access your customer profile and gift cards.</p>
        <button
          onClick={onNavigateHome}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const handleRedeemGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCardCode.trim()) return;
    setGiftLoading(true);
    setGiftMsg(null);
    try {
      const res = await apiRedeemGiftCard(user.id, giftCardCode);
      updateUser(res.user);
      setGiftMsg({ type: 'success', text: res.message });
      setGiftCardCode('');
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (err) {}
    } catch (err: any) {
      setGiftMsg({ type: 'error', text: err.message || 'Failed to redeem gift card.' });
    } finally {
      setGiftLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveMsg('');
    try {
      const res = await apiUpdateProfile({
        userId: user.id,
        name: editName,
        phone: editPhone
      });
      updateUser(res.user);
      setSaveMsg('Profile updated successfully.');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err: any) {
      setSaveMsg('Failed to update profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [...(user.addresses || []), { ...newAddr, id: `addr_${Date.now()}` }];
    const res = await apiUpdateProfile({
      userId: user.id,
      addresses: updated
    });
    updateUser(res.user);
    setShowAddAddress(false);
    setNewAddr({
      id: '',
      fullName: user.name,
      phone: user.phone,
      street: '',
      city: '',
      state: '',
      pinCode: '',
      isDefault: false
    });
  };

  const handleDeleteAddress = async (addrId: string) => {
    const updated = (user.addresses || []).filter((a) => a.id !== addrId);
    const res = await apiUpdateProfile({
      userId: user.id,
      addresses: updated
    });
    updateUser(res.user);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="profile-view-container">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-black">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
            <p className="text-xs text-gray-500">{user.email || user.phone}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                {user.role}
              </span>
              <span className="text-[11px] text-gray-400">
                Member since {new Date(user.agreedTermsAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Gift Card Balance Badge */}
        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
              XANTRO Gift Balance
            </span>
            <span className="text-base font-extrabold text-gray-900">
              ₹{(user.giftCardBalance || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs & Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-2xs space-y-1 h-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile Overview</span>
          </button>

          <button
            onClick={onNavigateToOrders}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
          >
            <Package className="w-4 h-4 text-gray-500" />
            <span>Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('giftcards')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'giftcards'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Gift Cards</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'files'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Files & Invoices</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'addresses'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Account Settings</span>
          </button>

          <div className="border-t border-gray-100 my-1 pt-1"></div>

          <button
            onClick={() => {
              logout();
              onNavigateHome();
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Right Main Content */}
        <div className="md:col-span-3 space-y-6">
          {/* TAB 1: PROFILE OVERVIEW */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-400 font-semibold block mb-1">Full Name</span>
                  <span className="text-sm font-bold text-gray-900">{user.name}</span>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-400 font-semibold block mb-1">Mobile / Email</span>
                  <span className="text-sm font-bold text-gray-900">{user.phone || user.email}</span>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-400 font-semibold block mb-1">Account Role</span>
                  <span className="text-sm font-bold text-blue-700 capitalize">{user.role}</span>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-400 font-semibold block mb-1">Terms Agreement</span>
                  <span className="text-xs font-semibold text-green-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Verified (Version {user.agreedTermsVersion || '1.0'})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GIFT CARDS */}
          {activeTab === 'giftcards' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-6">
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  XANTRO Gift Cards
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Redeem promotional vouchers and gift cards directly into your balance.
                </p>
              </div>

              {/* Balance Box */}
              <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-blue-100 font-semibold">Available Gift Balance</span>
                  <div className="text-2xl font-black mt-0.5">
                    ₹{(user.giftCardBalance || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <Gift className="w-8 h-8 text-yellow-300" />
              </div>

              {/* Redeem Form */}
              <form onSubmit={handleRedeemGiftCard} className="space-y-3">
                <label className="block text-xs font-bold text-gray-700">
                  Enter Gift Card Voucher Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                    placeholder="e.g. XANTRO100, XANTRO250, XANTRO500, FESTIVE1000"
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-blue-600 uppercase font-mono tracking-wider outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={giftLoading || !giftCardCode.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {giftLoading ? 'Redeeming...' : 'Redeem Code'}
                  </button>
                </div>
              </form>

              {giftMsg && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                    giftMsg.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {giftMsg.type === 'success' ? (
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  )}
                  <span>{giftMsg.text}</span>
                </div>
              )}

              {/* Demo Voucher Codes list */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-[11px] text-gray-600">
                <strong>Try Demo Gift Codes:</strong>{' '}
                <span className="font-mono font-bold text-blue-700">XANTRO100</span>,{' '}
                <span className="font-mono font-bold text-blue-700">XANTRO250</span>,{' '}
                <span className="font-mono font-bold text-blue-700">XANTRO500</span>,{' '}
                <span className="font-mono font-bold text-blue-700">FESTIVE1000</span>
              </div>
            </div>
          )}

          {/* TAB 3: FILES */}
          {activeTab === 'files' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Files & Account Documents
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Generated tax invoices, order receipts, and account documents.
                </p>
              </div>

              {(!user.files || user.files.length === 0) ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  No documents generated yet. Order invoices will appear here automatically.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {user.files.map((file) => (
                    <div key={file.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{file.fileName}</p>
                          <span className="text-[10px] text-gray-400">
                            {file.fileType} • {file.fileSize} • {new Date(file.uploadedAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => alert(`Downloading ${file.fileName}...`)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold text-gray-700"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Saved Delivery Addresses
                  </h2>
                  <p className="text-xs text-gray-500">Manage addresses for faster checkout.</p>
                </div>
                {!showAddAddress && (
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                )}
              </div>

              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 text-xs">
                  <h3 className="font-bold text-gray-900">Add New Delivery Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newAddr.fullName}
                        onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        required
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-gray-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        value={newAddr.street}
                        onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">PIN Code</label>
                      <input
                        type="text"
                        required
                        value={newAddr.pinCode}
                        onChange={(e) => setNewAddr({ ...newAddr, pinCode: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {(user.addresses || []).map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white flex items-start justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        <span>{addr.fullName}</span>
                        <span className="text-gray-500 font-normal">• {addr.phone}</span>
                      </div>
                      <p className="text-gray-600 mt-1">
                        {addr.street}, {addr.city}, {addr.state} - {addr.pinCode}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Account Settings
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update your contact details and preferences.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                {saveMsg && (
                  <p className="text-xs text-green-700 font-semibold">{saveMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  {saveLoading ? 'Saving...' : 'Update Settings'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

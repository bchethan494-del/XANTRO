import { Product, User, Order, Advertisement, PlatformSettings } from './types';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchPublicSettings(): Promise<{ sellerListingFeePercent: number; advertisementFeeAmount: number; termsVersion: string }> {
  const res = await fetch(`${API_BASE}/settings/public`);
  return res.json();
}

export async function fetchActiveAds(): Promise<{ advertisements: Advertisement[] }> {
  const res = await fetch(`${API_BASE}/advertisements/active`);
  return res.json();
}

export async function fetchProducts(params?: { search?: string; category?: string; sort?: string }): Promise<{ products: Product[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category && params.category !== 'All') query.set('category', params.category);
  if (params?.sort) query.set('sort', params.sort);

  const res = await fetch(`${API_BASE}/products?${query.toString()}`);
  return res.json();
}

export async function fetchRecentProducts(): Promise<{ products: Product[] }> {
  const res = await fetch(`${API_BASE}/products/recent`);
  return res.json();
}

export async function fetchPopularProducts(): Promise<{ products: Product[] }> {
  const res = await fetch(`${API_BASE}/products/popular`);
  return res.json();
}

export async function apiFetchCatalog(params?: { search?: string; category?: string; sort?: string }): Promise<{
  products: Product[];
  recent: Product[];
  popular: Product[];
  total: number;
}> {
  const [prodsRes, recentRes, popularRes] = await Promise.all([
    fetchProducts(params),
    fetchRecentProducts(),
    fetchPopularProducts()
  ]);

  return {
    products: prodsRes.products || [],
    recent: recentRes.products || [],
    popular: popularRes.products || [],
    total: prodsRes.total || 0
  };
}

export async function apiFetchAdvertisements(): Promise<{ advertisements: Advertisement[] }> {
  return fetchActiveAds();
}

export async function fetchProductById(id: string): Promise<{ product: Product }> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function apiRegister(payload: {
  name: string;
  phone?: string;
  email?: string;
  password?: string;
  role: 'buyer' | 'seller';
  authProvider?: 'mobile' | 'google' | 'facebook';
  agreedTerms: boolean;
  termsVersion?: string;
  sellerDetails?: {
    storeName: string;
    sellerUpiId?: string;
    bankAccountNumber?: string;
    ifscCode?: string;
  };
}): Promise<{ user: User; message: string }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function apiLogin(payload: {
  identifier?: string;
  password?: string;
  provider?: 'mobile' | 'google' | 'facebook';
  name?: string;
  email?: string;
  phone?: string;
}): Promise<{ user: User; message?: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function apiUpdateProfile(payload: {
  userId: string;
  name?: string;
  phone?: string;
  addresses?: any[];
  sellerDetails?: any;
}): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Update failed');
  return data;
}

export async function apiRedeemGiftCard(userId: string, code: string): Promise<{ message: string; newBalance: number; user: User }> {
  const res = await fetch(`${API_BASE}/auth/giftcards/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, code })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Redemption failed');
  return data;
}

export async function apiCreateProduct(payload: {
  sellerId: string;
  sellerName: string;
  name: string;
  description: string;
  price: number;
  deliveryFee: number;
  category: string;
  images: string[];
  quantity: number;
}): Promise<{ product: Product; listingFee: number; message: string }> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Product creation failed');
  return data;
}

export async function apiVerifyListingFee(payload: {
  productId: string;
  sellerId: string;
  paymentReference?: string;
  paymentMethod?: string;
}): Promise<{ product: Product; message: string; transaction: any }> {
  const res = await fetch(`${API_BASE}/payments/verify-listing-fee`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Listing fee verification failed');
  return data;
}

export async function apiFetchSellerProducts(sellerId: string): Promise<{ products: Product[] }> {
  const res = await fetch(`${API_BASE}/seller/products?sellerId=${sellerId}`);
  return res.json();
}

export async function apiFetchSellerEarnings(sellerId: string): Promise<{
  totalProductsSold: number;
  totalSales: number;
  listingFeesPaid: number;
  settledAmount: number;
  pendingSettlement: number;
  storeName: string;
}> {
  const res = await fetch(`${API_BASE}/seller/earnings?sellerId=${sellerId}`);
  return res.json();
}

export async function apiFetchSellerOrders(sellerId: string): Promise<{ orders: Order[] }> {
  const res = await fetch(`${API_BASE}/seller/orders?sellerId=${sellerId}`);
  return res.json();
}

export async function apiShipOrder(orderId: string, payload: { courierName: string; trackingNumber: string; expectedDeliveryDate?: string }): Promise<{ order: Order; message: string }> {
  const res = await fetch(`${API_BASE}/seller/orders/${orderId}/ship`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ship order failed');
  return data;
}

export async function apiUpdateOrderStatus(orderId: string, payload: { status: string; note?: string; location?: string }): Promise<{ order: Order; message: string }> {
  const res = await fetch(`${API_BASE}/seller/orders/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Status update failed');
  return data;
}

export async function apiCreateAd(payload: { productId: string; sellerId: string }): Promise<{ advertisement: Advertisement; fee: number; message: string }> {
  const res = await fetch(`${API_BASE}/advertisements/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ad creation failed');
  return data;
}

export async function apiVerifyAdFee(advertisementId: string, paymentReference?: string): Promise<{ advertisement: Advertisement; message: string }> {
  const res = await fetch(`${API_BASE}/payments/verify-ad-fee`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ advertisementId, paymentReference })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ad verification failed');
  return data;
}

export async function apiCreateOrder(payload: {
  buyerId: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone: string;
  items: any[];
  deliveryAddress: any;
  paymentMethod: 'ONLINE_UPI' | 'COD';
}): Promise<{ order: Order; message: string }> {
  const res = await fetch(`${API_BASE}/orders/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Order creation failed');
  return data;
}

export async function apiFetchMyOrders(buyerId: string): Promise<{ orders: Order[] }> {
  const res = await fetch(`${API_BASE}/orders/my-orders?buyerId=${buyerId}`);
  return res.json();
}

export async function apiFetchOrderById(orderId: string): Promise<{ order: Order }> {
  const res = await fetch(`${API_BASE}/orders/${orderId}`);
  if (!res.ok) throw new Error('Order not found');
  return res.json();
}

export async function apiFetchAdminDashboard(): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/dashboard`);
  return res.json();
}

export async function apiUpdateAdminSettings(payload: {
  sellerListingFeePercent?: number;
  advertisementFeeAmount?: number;
  ownerUpiId?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

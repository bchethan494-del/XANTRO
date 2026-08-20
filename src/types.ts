export type UserRole = 'buyer' | 'seller' | 'admin';

export interface UserAddress {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault?: boolean;
}

export interface UserFile {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  fileUrl: string;
}

export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  redeemedBy?: string;
  redeemedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  authProvider: 'mobile' | 'google' | 'facebook';
  agreedTermsVersion: string;
  agreedTermsAt: string;
  addresses: UserAddress[];
  giftCardBalance: number;
  files: UserFile[];
  sellerDetails?: {
    storeName: string;
    sellerUpiId: string; // Private
    bankAccountNumber?: string; // Private
    ifscCode?: string; // Private
    listingFeesPaid: number;
    totalSales: number;
    settledAmount: number;
    pendingSettlement: number;
  };
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  description: string;
  price: number;
  deliveryFee: number;
  category: string;
  images: string[];
  quantity: number;
  status: 'ACTIVE' | 'PAYMENT_PENDING' | 'REMOVED';
  listingFeeAmount: number;
  listingFeePaid: boolean;
  isAdvertised: boolean;
  viewsCount: number;
  purchaseCount: number;
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  sellerId: string;
  sellerName: string;
  price: number;
  deliveryFee: number;
  quantity: number;
  total: number;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export interface TrackingEvent {
  status: OrderStatus;
  timestamp: string;
  location?: string;
  note?: string;
}

export interface TrackingInfo {
  courierName?: string;
  trackingNumber?: string;
  expectedDeliveryDate?: string;
  lastUpdated: string;
  history: TrackingEvent[];
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFeeTotal: number;
  grandTotal: number;
  deliveryAddress: UserAddress;
  paymentMethod: 'ONLINE_UPI' | 'COD';
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  orderStatus: OrderStatus;
  trackingInfo: TrackingInfo;
  createdAt: string;
}

export interface Advertisement {
  id: string;
  sellerId: string;
  sellerName: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  deliveryFee: number;
  amount: number;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface PlatformSettings {
  sellerListingFeePercent: number; // default 1%
  advertisementFeeAmount: number; // default ₹100
  ownerUpiId: string; // Private server-side owner UPI ID (e.g. 6363048473@ybl)
  termsVersion: string;
  platformRevenue: {
    listingFeesTotal: number;
    advertisementTotal: number;
  };
}

export interface ListingFeeTransaction {
  id: string;
  sellerId: string;
  productId: string;
  productName: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'FAILED';
  utrReference?: string;
  createdAt: string;
}

export interface GiftCardHistory {
  id: string;
  code: string;
  amount: number;
  action: 'REDEEMED' | 'ISSUED' | 'USED';
  date: string;
  note: string;
}

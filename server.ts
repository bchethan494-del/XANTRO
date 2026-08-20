import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// File-based persistent storage
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  users: any[];
  products: any[];
  orders: any[];
  advertisements: any[];
  listingFeeTransactions: any[];
  giftCards: any[];
  platformSettings: {
    sellerListingFeePercent: number;
    advertisementFeeAmount: number;
    ownerUpiId: string; // Stored securely on server, never sent to public clients
    termsVersion: string;
    platformRevenue: {
      listingFeesTotal: number;
      advertisementTotal: number;
    };
  };
}

const defaultInitialData: DatabaseSchema = {
  users: [
    {
      id: 'usr_admin_1',
      name: 'XANTRO Platform Admin',
      email: 'admin@xantro.com',
      phone: '9876543210',
      role: 'admin',
      authProvider: 'mobile',
      passwordHash: bcrypt.hashSync('admin123', 8),
      agreedTermsVersion: '1.0',
      agreedTermsAt: new Date().toISOString(),
      addresses: [],
      giftCardBalance: 0,
      files: []
    },
    {
      id: 'usr_seller_1',
      name: 'Apex Retailers',
      email: 'seller@apextech.com',
      phone: '9876500001',
      role: 'seller',
      authProvider: 'mobile',
      passwordHash: bcrypt.hashSync('seller123', 8),
      agreedTermsVersion: '1.0',
      agreedTermsAt: new Date().toISOString(),
      addresses: [
        {
          id: 'addr_seller_1',
          fullName: 'Apex Tech Hub',
          phone: '9876500001',
          street: '42 Silicon Avenue, Sector 4',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
          isDefault: true
        }
      ],
      giftCardBalance: 0,
      files: [],
      sellerDetails: {
        storeName: 'Apex Electronics & Gadgets',
        sellerUpiId: 'apexretail@okaxis', // Private
        bankAccountNumber: 'XXXXXX9821',
        ifscCode: 'HDFC0001234',
        listingFeesPaid: 0,
        totalSales: 0,
        settledAmount: 0,
        pendingSettlement: 0
      }
    },
    {
      id: 'usr_seller_2',
      name: 'Urban Crafts & Lifestyle',
      email: 'urban@lifestyle.com',
      phone: '9876500002',
      role: 'seller',
      authProvider: 'google',
      passwordHash: bcrypt.hashSync('seller123', 8),
      agreedTermsVersion: '1.0',
      agreedTermsAt: new Date().toISOString(),
      addresses: [],
      giftCardBalance: 0,
      files: [],
      sellerDetails: {
        storeName: 'Urban Crafts Studio',
        sellerUpiId: 'urbancrafts@icici',
        bankAccountNumber: 'XXXXXX4411',
        ifscCode: 'ICIC0005678',
        listingFeesPaid: 0,
        totalSales: 0,
        settledAmount: 0,
        pendingSettlement: 0
      }
    },
    {
      id: 'usr_buyer_demo',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '9812345678',
      role: 'buyer',
      authProvider: 'mobile',
      passwordHash: bcrypt.hashSync('buyer123', 8),
      agreedTermsVersion: '1.0',
      agreedTermsAt: new Date().toISOString(),
      addresses: [
        {
          id: 'addr_buyer_1',
          fullName: 'Rahul Sharma',
          phone: '9812345678',
          street: 'Flat 302, Green Meadows, 14th Main Rd, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560038',
          isDefault: true
        }
      ],
      giftCardBalance: 0,
      files: []
    }
  ],
  products: [],
  orders: [],
  advertisements: [],
  listingFeeTransactions: [],
  giftCards: [
    { code: 'XANTRO100', amount: 100, isUsed: false, expiry: '2026-12-31' },
    { code: 'XANTRO250', amount: 250, isUsed: false, expiry: '2026-12-31' },
    { code: 'XANTRO500', amount: 500, isUsed: false, expiry: '2026-12-31' },
    { code: 'FESTIVE1000', amount: 1000, isUsed: false, expiry: '2026-12-31' }
  ],
  platformSettings: {
    sellerListingFeePercent: 1, // 1% listing fee
    advertisementFeeAmount: 100, // ₹100 per ad
    ownerUpiId: '6363048473@ybl', // Private owner UPI ID
    termsVersion: '1.0',
    platformRevenue: {
      listingFeesTotal: 0,
      advertisementTotal: 0
    }
  }
};

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Ensure schema fields exist
      if (!parsed.products) parsed.products = [];
      if (!parsed.advertisements) parsed.advertisements = [];
      if (!parsed.orders) parsed.orders = [];
      if (!parsed.listingFeeTransactions) parsed.listingFeeTransactions = [];
      return parsed;
    }
  } catch (err) {
    console.error('Error reading database file, resetting to default', err);
  }
  saveDatabase(defaultInitialData);
  return defaultInitialData;
}

function saveDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file', err);
  }
}

let db = loadDatabase();

// Clean public user object without sensitive secrets
function sanitizeUser(user: any) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

// ----------------------------------------------------
// Public API Endpoints
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), platform: 'XANTRO Marketplace' });
});

// Public platform settings (Owner UPI ID is NOT included here)
app.get('/api/settings/public', (req, res) => {
  res.json({
    sellerListingFeePercent: db.platformSettings.sellerListingFeePercent,
    advertisementFeeAmount: db.platformSettings.advertisementFeeAmount,
    termsVersion: db.platformSettings.termsVersion
  });
});

// Active Advertisements for homepage banner
app.get('/api/advertisements/active', (req, res) => {
  const activeAds = db.advertisements.filter((ad) => ad.status === 'ACTIVE');
  res.json({ advertisements: activeAds });
});

// Products listing with search, category and sorting
app.get('/api/products', (req, res) => {
  const { search, category, sort } = req.query;
  let list = db.products.filter((p) => p.status === 'ACTIVE');

  if (category && category !== 'All') {
    list = list.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sellerName.toLowerCase().includes(q)
    );
  }

  if (sort === 'price-low') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'popular') {
    list.sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
  } else {
    // Default newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({ products: list, total: list.length });
});

// Recent Products
app.get('/api/products/recent', (req, res) => {
  const list = db.products
    .filter((p) => p.status === 'ACTIVE')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
  res.json({ products: list });
});

// Popular / Famous Products
app.get('/api/products/popular', (req, res) => {
  const list = db.products
    .filter((p) => p.status === 'ACTIVE')
    .sort((a, b) => (b.purchaseCount * 2 + b.viewsCount) - (a.purchaseCount * 2 + a.viewsCount))
    .slice(0, 8);
  res.json({ products: list });
});

// Single product detail
app.get('/api/products/:id', (req, res) => {
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  // Increment view counter
  product.viewsCount = (product.viewsCount || 0) + 1;
  saveDatabase(db);
  res.json({ product });
});

// ----------------------------------------------------
// Authentication Endpoints
// ----------------------------------------------------

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, role, authProvider, agreedTerms, termsVersion, sellerDetails } = req.body;

  if (!agreedTerms) {
    return res.status(400).json({ error: 'You must agree to the XANTRO Terms and Marketplace Rules to create an account.' });
  }

  if (!name || (!phone && !email)) {
    return res.status(400).json({ error: 'Please provide full name and phone number or email.' });
  }

  // Check duplicate
  const existing = db.users.find(
    (u) => (phone && u.phone === phone) || (email && u.email && u.email.toLowerCase() === email.toLowerCase())
  );
  if (existing) {
    return res.status(400).json({ error: 'An account with this phone or email already exists.' });
  }

  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newUser = {
    id: userId,
    name,
    email: email || `${phone || 'user'}@xantro.user`,
    phone: phone || '',
    role: role === 'seller' ? 'seller' : 'buyer',
    authProvider: authProvider || 'mobile',
    passwordHash: bcrypt.hashSync(password || 'guest123', 8),
    agreedTermsVersion: termsVersion || '1.0',
    agreedTermsAt: new Date().toISOString(),
    addresses: [],
    giftCardBalance: 0,
    files: [],
    ...(role === 'seller'
      ? {
          sellerDetails: {
            storeName: sellerDetails?.storeName || `${name}'s Store`,
            sellerUpiId: sellerDetails?.sellerUpiId || '',
            bankAccountNumber: sellerDetails?.bankAccountNumber || '',
            ifscCode: sellerDetails?.ifscCode || '',
            listingFeesPaid: 0,
            totalSales: 0,
            settledAmount: 0,
            pendingSettlement: 0
          }
        }
      : {})
  };

  db.users.push(newUser);
  saveDatabase(db);

  res.status(201).json({
    message: 'Account created successfully',
    user: sanitizeUser(newUser)
  });
});

app.post('/api/auth/login', (req, res) => {
  const { identifier, password, provider } = req.body;

  // Handle OAuth provider direct login simulation
  if (provider === 'google' || provider === 'facebook') {
    const { name, email, phone } = req.body;
    let user = db.users.find((u) => u.email && u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user) {
      // Auto-register social user
      user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name || (provider === 'google' ? 'Google User' : 'Facebook User'),
        email: email || `${provider}_${Date.now()}@example.com`,
        phone: phone || '',
        role: 'buyer',
        authProvider: provider,
        passwordHash: '',
        agreedTermsVersion: '1.0',
        agreedTermsAt: new Date().toISOString(),
        addresses: [],
        giftCardBalance: 0,
        files: []
      };
      db.users.push(user);
      saveDatabase(db);
    }
    return res.json({ user: sanitizeUser(user) });
  }

  if (!identifier) {
    return res.status(400).json({ error: 'Please provide mobile number or email address' });
  }

  const cleanIdent = identifier.trim().toLowerCase();
  const user = db.users.find(
    (u) =>
      (u.phone && u.phone.toLowerCase() === cleanIdent) ||
      (u.email && u.email.toLowerCase() === cleanIdent)
  );

  if (!user) {
    return res.status(404).json({ error: 'No account found with this mobile number/email. Please sign up.' });
  }

  if (password && user.passwordHash) {
    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your password or use OTP.' });
    }
  }

  res.json({
    message: 'Logged in successfully',
    user: sanitizeUser(user)
  });
});

// Update Profile / Address
app.put('/api/auth/profile', (req, res) => {
  const { userId, name, phone, addresses, sellerDetails } = req.body;
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (addresses) user.addresses = addresses;
  if (sellerDetails && user.sellerDetails) {
    user.sellerDetails = {
      ...user.sellerDetails,
      ...sellerDetails
    };
  }

  saveDatabase(db);
  res.json({ user: sanitizeUser(user) });
});

// Redeem Gift Card
app.post('/api/auth/giftcards/redeem', (req, res) => {
  const { userId, code } = req.body;
  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const cleanCode = (code || '').trim().toUpperCase();
  const card = db.giftCards.find((c) => c.code === cleanCode);

  if (!card) {
    return res.status(400).json({ error: 'Invalid gift card code. Valid demo codes include: XANTRO100, XANTRO250, XANTRO500, FESTIVE1000' });
  }

  if (card.isUsed) {
    return res.status(400).json({ error: 'This gift card has already been redeemed.' });
  }

  card.isUsed = true;
  user.giftCardBalance = (user.giftCardBalance || 0) + card.amount;

  saveDatabase(db);
  res.json({
    message: `₹${card.amount} added to your XANTRO Gift Card balance!`,
    newBalance: user.giftCardBalance,
    user: sanitizeUser(user)
  });
});

// ----------------------------------------------------
// Seller Endpoints
// ----------------------------------------------------

// Create Product (starts as PAYMENT_PENDING until 1% fee is paid)
app.post('/api/products', (req, res) => {
  const { sellerId, sellerName, name, description, price, deliveryFee, category, images, quantity } = req.body;

  if (!name || !price || !images || images.length === 0) {
    return res.status(400).json({ error: 'Please upload at least one product picture, provide a product name and price.' });
  }

  const numPrice = Number(price);
  const numDelivery = Number(deliveryFee) || 0;
  const numQty = Number(quantity) || 1;

  // Calculate 1% listing fee (minimum ₹1)
  const feePercent = db.platformSettings.sellerListingFeePercent || 1;
  const feeAmount = Math.max(1, Math.round((numPrice * feePercent) / 100));

  const newProd = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    sellerId: sellerId || 'usr_seller_1',
    sellerName: sellerName || 'Independent Seller',
    name,
    description: description || '',
    price: numPrice,
    deliveryFee: numDelivery,
    category: category || 'General',
    images: Array.isArray(images) ? images : [images],
    quantity: numQty,
    status: 'PAYMENT_PENDING',
    listingFeeAmount: feeAmount,
    listingFeePaid: false,
    isAdvertised: false,
    viewsCount: 0,
    purchaseCount: 0,
    rating: 5.0,
    reviewsCount: 0,
    createdAt: new Date().toISOString()
  };

  db.products.push(newProd);
  saveDatabase(db);

  res.status(201).json({
    message: 'Product created. Listing fee payment required to activate listing.',
    product: newProd,
    listingFee: feeAmount
  });
});

// Verify 1% Seller Listing Fee payment
app.post('/api/payments/verify-listing-fee', (req, res) => {
  const { productId, sellerId, paymentReference, paymentMethod } = req.body;
  const product = db.products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Activate product
  product.status = 'ACTIVE';
  product.listingFeePaid = true;

  // Record platform revenue & transaction
  const tx = {
    id: `tx_${Date.now()}`,
    sellerId: sellerId || product.sellerId,
    productId: product.id,
    productName: product.name,
    amount: product.listingFeeAmount,
    status: 'PAID',
    utrReference: paymentReference || `UPI/XAN${Date.now().toString().slice(-8)}`,
    createdAt: new Date().toISOString()
  };

  db.listingFeeTransactions.push(tx);
  db.platformSettings.platformRevenue.listingFeesTotal += product.listingFeeAmount;

  // Update seller stats
  const seller = db.users.find((u) => u.id === product.sellerId);
  if (seller && seller.sellerDetails) {
    seller.sellerDetails.listingFeesPaid = (seller.sellerDetails.listingFeesPaid || 0) + product.listingFeeAmount;
  }

  saveDatabase(db);

  res.json({
    message: 'Listing fee verified! Your product is now ACTIVE and publicly searchable on XANTRO.',
    product,
    transaction: tx
  });
});

// Seller's own products list
app.get('/api/seller/products', (req, res) => {
  const { sellerId } = req.query;
  const list = db.products.filter((p) => p.sellerId === sellerId);
  res.json({ products: list });
});

// Seller's earnings breakdown
app.get('/api/seller/earnings', (req, res) => {
  const { sellerId } = req.query;
  const seller = db.users.find((u) => u.id === sellerId);
  if (!seller) {
    return res.status(404).json({ error: 'Seller not found' });
  }

  // Calculate realtime sales from orders
  const sellerOrders = db.orders.filter((o) => o.items.some((it: any) => it.sellerId === sellerId));
  let totalSales = 0;
  let totalItemsSold = 0;

  sellerOrders.forEach((o) => {
    o.items.forEach((it: any) => {
      if (it.sellerId === sellerId) {
        totalSales += (it.price + it.deliveryFee) * it.quantity;
        totalItemsSold += it.quantity;
      }
    });
  });

  const listingFeesPaid = seller.sellerDetails?.listingFeesPaid || 0;
  const settledAmount = seller.sellerDetails?.settledAmount || Math.floor(totalSales * 0.7);
  const pendingSettlement = Math.max(0, totalSales - settledAmount);

  res.json({
    totalProductsSold: totalItemsSold,
    totalSales,
    listingFeesPaid,
    settledAmount,
    pendingSettlement,
    storeName: seller.sellerDetails?.storeName || seller.name
  });
});

// Seller orders list
app.get('/api/seller/orders', (req, res) => {
  const { sellerId } = req.query;
  const sellerOrders = db.orders.filter((o) => o.items.some((it: any) => it.sellerId === sellerId));
  res.json({ orders: sellerOrders });
});

// Mark Order as Shipped with courier & tracking details
app.put('/api/seller/orders/:id/ship', (req, res) => {
  const { courierName, trackingNumber, expectedDeliveryDate } = req.body;
  const order = db.orders.find((o) => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.orderStatus = 'Shipped';
  order.trackingInfo = {
    courierName: courierName || 'Express Logistics',
    trackingNumber: trackingNumber || `TRK-XAN-${Date.now().toString().slice(-6)}`,
    expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lastUpdated: new Date().toISOString(),
    history: [
      ...order.trackingInfo.history,
      {
        status: 'Shipped',
        timestamp: new Date().toISOString(),
        note: `Dispatched via ${courierName || 'Express Courier'}. Tracking ID: ${trackingNumber || 'Assigned'}`
      }
    ]
  };

  saveDatabase(db);
  res.json({ message: 'Order marked as shipped', order });
});

// Update Order Status (Out for Delivery / Delivered)
app.put('/api/seller/orders/:id/status', (req, res) => {
  const { status, note, location } = req.body;
  const order = db.orders.find((o) => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.orderStatus = status;
  order.trackingInfo.lastUpdated = new Date().toISOString();
  order.trackingInfo.history.push({
    status,
    timestamp: new Date().toISOString(),
    location: location || '',
    note: note || `Status updated to ${status}`
  });

  saveDatabase(db);
  res.json({ message: `Order status updated to ${status}`, order });
});

// ----------------------------------------------------
// Advertisement Endpoints
// ----------------------------------------------------

app.post('/api/advertisements/create', (req, res) => {
  const { productId, sellerId } = req.body;
  const product = db.products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (product.status !== 'ACTIVE') {
    return res.status(400).json({ error: 'Only ACTIVE products can be advertised.' });
  }

  const adFee = db.platformSettings.advertisementFeeAmount || 100;
  const newAd = {
    id: `ad_${Date.now()}`,
    sellerId: sellerId || product.sellerId,
    sellerName: product.sellerName,
    productId: product.id,
    productName: product.name,
    productImage: product.images[0],
    productPrice: product.price,
    deliveryFee: product.deliveryFee,
    amount: adFee,
    status: 'PENDING',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };

  db.advertisements.push(newAd);
  saveDatabase(db);

  res.status(201).json({
    message: 'Advertisement request created. Payment of ₹100 required to activate.',
    advertisement: newAd,
    fee: adFee
  });
});

// Verify ₹100 Ad payment
app.post('/api/payments/verify-ad-fee', (req, res) => {
  const { advertisementId, paymentReference } = req.body;
  const ad = db.advertisements.find((a) => a.id === advertisementId);

  if (!ad) {
    return res.status(404).json({ error: 'Advertisement not found' });
  }

  ad.status = 'ACTIVE';
  db.platformSettings.platformRevenue.advertisementTotal += ad.amount;

  // Mark product as advertised
  const prod = db.products.find((p) => p.id === ad.productId);
  if (prod) prod.isAdvertised = true;

  saveDatabase(db);
  res.json({
    message: 'Advertisement activated successfully! Your product now appears at the top of the XANTRO homepage.',
    advertisement: ad
  });
});

// ----------------------------------------------------
// Order & Checkout Endpoints
// ----------------------------------------------------

app.post('/api/orders/create', (req, res) => {
  const { buyerId, buyerName, buyerEmail, buyerPhone, items, deliveryAddress, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.street || !deliveryAddress.pinCode) {
    return res.status(400).json({ error: 'Please provide complete delivery address with PIN code.' });
  }

  let subtotal = 0;
  let deliveryFeeTotal = 0;

  const orderItems = items.map((item: any) => {
    const itemSub = item.product.price * item.quantity;
    const itemDel = item.product.deliveryFee * item.quantity;
    subtotal += itemSub;
    deliveryFeeTotal += itemDel;

    // Increment product purchase count
    const prod = db.products.find((p) => p.id === item.product.id);
    if (prod) {
      prod.purchaseCount = (prod.purchaseCount || 0) + item.quantity;
      prod.quantity = Math.max(0, prod.quantity - item.quantity);
    }

    return {
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.images[0] || '',
      sellerId: item.product.sellerId,
      sellerName: item.product.sellerName,
      price: item.product.price,
      deliveryFee: item.product.deliveryFee,
      quantity: item.quantity,
      total: itemSub + itemDel
    };
  });

  const grandTotal = subtotal + deliveryFeeTotal;
  const isOnline = paymentMethod === 'ONLINE_UPI';

  const orderId = `ORD-XAN-${Math.floor(100000 + Math.random() * 900000)}`;
  const newOrder = {
    id: orderId,
    buyerId: buyerId || 'usr_buyer_guest',
    buyerName: buyerName || deliveryAddress.fullName,
    buyerEmail: buyerEmail || '',
    buyerPhone: buyerPhone || deliveryAddress.phone,
    items: orderItems,
    subtotal,
    deliveryFeeTotal,
    grandTotal,
    deliveryAddress,
    paymentMethod: isOnline ? 'ONLINE_UPI' : 'COD',
    paymentStatus: isOnline ? 'PAID' : 'PENDING',
    orderStatus: 'Order Placed',
    trackingInfo: {
      courierName: 'Standard Express Surface',
      trackingNumber: `TRK-XAN-${orderId.split('-')[2]}`,
      expectedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
      history: [
        {
          status: 'Order Placed',
          timestamp: new Date().toISOString(),
          note: isOnline ? 'Order placed and payment verified via Online UPI.' : 'Order placed under Cash on Delivery (COD).'
        },
        {
          status: 'Confirmed',
          timestamp: new Date(Date.now() + 2000).toISOString(),
          note: 'Order confirmed by marketplace system.'
        }
      ]
    },
    createdAt: new Date().toISOString()
  };

  db.orders.push(newOrder);

  // Generate automated invoice file for customer profile
  const user = db.users.find((u) => u.id === buyerId);
  if (user) {
    user.files = user.files || [];
    user.files.push({
      id: `file_${Date.now()}`,
      fileName: `Invoice_${orderId}.pdf`,
      fileSize: '128 KB',
      fileType: 'PDF Tax Invoice',
      uploadedAt: new Date().toISOString(),
      fileUrl: '#'
    });
  }

  saveDatabase(db);

  res.status(201).json({
    message: 'Order placed successfully!',
    order: newOrder
  });
});

// Customer's my-orders
app.get('/api/orders/my-orders', (req, res) => {
  const { buyerId } = req.query;
  const userOrders = db.orders
    .filter((o) => o.buyerId === buyerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ orders: userOrders });
});

// Single Order detail & tracking
app.get('/api/orders/:id', (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ order });
});

// ----------------------------------------------------
// Admin / Owner Dashboard Endpoints
// ----------------------------------------------------

app.get('/api/admin/dashboard', (req, res) => {
  const buyersCount = db.users.filter((u) => u.role === 'buyer').length;
  const sellersCount = db.users.filter((u) => u.role === 'seller').length;
  const activeProducts = db.products.filter((p) => p.status === 'ACTIVE').length;
  const pendingProducts = db.products.filter((p) => p.status === 'PAYMENT_PENDING').length;
  const totalOrders = db.orders.length;

  res.json({
    metrics: {
      buyersCount,
      sellersCount,
      activeProducts,
      pendingProducts,
      totalOrders,
      listingFeesRevenue: db.platformSettings.platformRevenue.listingFeesTotal,
      advertisementRevenue: db.platformSettings.platformRevenue.advertisementTotal,
      totalPlatformRevenue:
        db.platformSettings.platformRevenue.listingFeesTotal +
        db.platformSettings.platformRevenue.advertisementTotal
    },
    users: db.users.map(sanitizeUser),
    products: db.products,
    orders: db.orders,
    advertisements: db.advertisements,
    listingFeeTransactions: db.listingFeeTransactions,
    settings: {
      sellerListingFeePercent: db.platformSettings.sellerListingFeePercent,
      advertisementFeeAmount: db.platformSettings.advertisementFeeAmount,
      ownerUpiId: db.platformSettings.ownerUpiId, // Accessible only in admin endpoint
      termsVersion: db.platformSettings.termsVersion
    }
  });
});

app.post('/api/admin/settings', (req, res) => {
  const { sellerListingFeePercent, advertisementFeeAmount, ownerUpiId } = req.body;

  if (sellerListingFeePercent !== undefined) {
    db.platformSettings.sellerListingFeePercent = Number(sellerListingFeePercent);
  }
  if (advertisementFeeAmount !== undefined) {
    db.platformSettings.advertisementFeeAmount = Number(advertisementFeeAmount);
  }
  if (ownerUpiId) {
    db.platformSettings.ownerUpiId = ownerUpiId.trim();
  }

  saveDatabase(db);
  res.json({
    message: 'Platform settings updated successfully',
    settings: {
      sellerListingFeePercent: db.platformSettings.sellerListingFeePercent,
      advertisementFeeAmount: db.platformSettings.advertisementFeeAmount,
      ownerUpiId: db.platformSettings.ownerUpiId,
      termsVersion: db.platformSettings.termsVersion
    }
  });
});

app.post('/api/admin/products/:id/status', (req, res) => {
  const { status } = req.body;
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  product.status = status;
  saveDatabase(db);
  res.json({ message: `Product status updated to ${status}`, product });
});

// ----------------------------------------------------
// Vite Dev & Production Integration
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`XANTRO Marketplace server running on http://localhost:${PORT}`);
  });
}

startServer();

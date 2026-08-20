import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  totalItemsCount: number;
  subtotal: number;
  deliveryFeeTotal: number;
  grandTotal: number;
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'xantro_cart_items';
const MAX_CART_ITEMS = 100;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFeeTotal = items.reduce((sum, item) => sum + item.product.deliveryFee * item.quantity, 0);
  const grandTotal = subtotal + deliveryFeeTotal;

  const addToCart = (product: Product, quantity = 1): { success: boolean; message?: string } => {
    const currentTotal = items.reduce((sum, it) => sum + it.quantity, 0);
    if (currentTotal + quantity > MAX_CART_ITEMS) {
      return {
        success: false,
        message: 'Your cart can contain a maximum of 100 items.'
      };
    }

    const existingIndex = items.findIndex((it) => it.product.id === product.id);
    let updated: CartItem[];

    if (existingIndex > -1) {
      updated = items.map((it, idx) => {
        if (idx === existingIndex) {
          return { ...it, quantity: it.quantity + quantity };
        }
        return it;
      });
    } else {
      updated = [...items, { product, quantity }];
    }

    saveCart(updated);
    return { success: true };
  };

  const updateQuantity = (productId: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const otherItemsCount = items
      .filter((it) => it.product.id !== productId)
      .reduce((sum, it) => sum + it.quantity, 0);

    if (otherItemsCount + quantity > MAX_CART_ITEMS) {
      return {
        success: false,
        message: 'Your cart can contain a maximum of 100 items.'
      };
    }

    const updated = items.map((it) => (it.product.id === productId ? { ...it, quantity } : it));
    saveCart(updated);
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    const updated = items.filter((it) => it.product.id !== productId);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemsCount,
        subtotal,
        deliveryFeeTotal,
        grandTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

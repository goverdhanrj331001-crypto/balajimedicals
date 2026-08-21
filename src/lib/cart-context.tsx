'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import type { Product, CartItem } from '@/types';

interface CartContextValue {
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'medidemo-cart';
const EVENT_NAME = 'medidemo-cart-change';

// ─── External store for cart persistence ─────────────────────────
// Uses useSyncExternalStore so React 19's strict rules are satisfied.

const EMPTY_CART: CartItem[] = [];
let cachedCart: CartItem[] = EMPTY_CART;
let cachedRaw: string = '__init__';

function readCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return EMPTY_CART;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? '';
    // Cache by raw string to avoid returning a new array reference each call
    // when the underlying data hasn't changed.
    if (raw === cachedRaw) return cachedCart;
    cachedRaw = raw;
    cachedCart = raw ? (JSON.parse(raw) as CartItem[]) : EMPTY_CART;
    return cachedCart;
  } catch {
    return EMPTY_CART;
  }
}

function writeCartToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    const raw = JSON.stringify(items);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedCart = items;
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // ignore
  }
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): CartItem[] {
  return readCartFromStorage();
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addToCart = useCallback((product: Product, qty = 1) => {
    const current = readCartFromStorage();
    const existing = current.find((i) => i.id === product.id);
    const next = existing
      ? current.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + qty } : i))
      : [...current, { ...product, quantity: qty }];
    writeCartToStorage(next);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    const current = readCartFromStorage();
    writeCartToStorage(current.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    const current = readCartFromStorage();
    writeCartToStorage(current.map((i) => (i.id === id ? { ...i, quantity } : i)));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    writeCartToStorage(EMPTY_CART);
  }, []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

import { useCallback } from 'react';

const STORAGE_KEY = 'standardfare_order_history';
const MAX_ORDERS = 50;

function generateId() {
  // Simple UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function readOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // localStorage unavailable or full
  }
}

export default function useOrderHistory() {
  const addOrder = useCallback((order) => {
    const newOrder = {
      id: order.id || generateId(),
      date: order.date || new Date().toISOString(),
      items: (order.items || []).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        type: item.type || 'item',
      })),
      total: order.total ?? 0,
      status: order.status || 'completed',
      customerName: order.customerName || '',
      customerEmail: order.customerEmail || '',
    };

    const orders = readOrders();
    orders.unshift(newOrder);

    // Enforce max limit
    if (orders.length > MAX_ORDERS) {
      orders.length = MAX_ORDERS;
    }

    writeOrders(orders);
    return newOrder;
  }, []);

  const getOrders = useCallback(() => {
    return readOrders();
  }, []);

  const clearHistory = useCallback(() => {
    writeOrders([]);
  }, []);

  return { addOrder, getOrders, clearHistory };
}

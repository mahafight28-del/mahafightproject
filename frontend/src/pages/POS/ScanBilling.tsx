import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Input, message } from 'antd';
import type { InputRef } from 'antd';
import { MinusOutlined, PlusOutlined, ShoppingCartOutlined, ScanOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface CartItem {
  id: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  stock: number;
}

const ScanBilling: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [scanCode, setScanCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const scanInputRef = useRef<InputRef>(null);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token || !user) {
      message.error('Please login first');
      navigate('/login');
      return;
    }
    scanInputRef.current?.focus();
  }, [token, user, navigate]);

  const scanProduct = async (code: string) => {
    if (!code.trim()) return;
    
    console.log('Token:', token ? 'Present' : 'Missing');
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/pos/scan/${encodeURIComponent(code)}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        message.error(error.message || 'Product not found');
        return;
      }

      const product = await response.json();
      addToCart(product);
      message.success(`${product.name} added to cart`);
      
    } catch (error) {
      message.error('Scan failed');
    } finally {
      setIsProcessing(false);
      setScanCode('');
      scanInputRef.current?.focus();
    }
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      
      if (existing) {
        if (existing.quantity >= existing.stock) {
          message.error('Insufficient stock');
          return prev;
        }
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, {
        id: product.id,
        sku: product.sku,
        name: product.name,
        unitPrice: product.unitPrice,
        quantity: 1,
        stock: product.stockQuantity
      }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        if (newQty > item.stock) {
          message.error('Insufficient stock');
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleScanSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    scanProduct(scanCode);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const generateBill = async () => {
    if (cart.length === 0) {
      message.error('Cart is empty');
      return;
    }

    try {
      // First get dealer ID from user ID
      const dealerResponse = await fetch('/api/dealers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!dealerResponse.ok) {
        message.error('Failed to get dealer information');
        return;
      }
      
      const dealersData = await dealerResponse.json();
      const userDealer = dealersData.data?.find((d: any) => d.userId === user?.id);
      
      if (!userDealer) {
        message.error('Dealer record not found');
        return;
      }

      const saleData = {
        dealerId: userDealer.id,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        paymentMethod: 'Cash'
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saleData)
      });

      if (response.ok) {
        const result = await response.json();
        message.success('Bill generated successfully!');
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        
        // Download receipt with token
        const receiptResponse = await fetch(`/api/sales/${result.id}/pdf`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (receiptResponse.ok) {
          const blob = await receiptResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `receipt-${result.saleNumber}.txt`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    } catch (error) {
      message.error('Failed to generate bill');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card title={<><ScanOutlined /> POS - Scan & Bill</>}>
        <form onSubmit={handleScanSubmit} className="mb-6">
          <div className="flex gap-2">
            <Input
              ref={scanInputRef}
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value)}
              placeholder="Scan barcode or enter SKU..."
              style={{ flex: 1 }}
              disabled={isProcessing}
            />
            <Button type="primary" htmlType="submit" disabled={isProcessing}>
              <ScanOutlined />
            </Button>
          </div>
        </form>

        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <Input
            placeholder="Customer Name (Optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={{ flex: 1 }}
          />
          <Input
            placeholder="Customer Phone (Optional)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: '1px solid #d9d9d9', borderRadius: 6, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#666' }}>SKU: {item.sku}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Button
                  size="small"
                  onClick={() => updateQuantity(item.id, -1)}
                >
                  <MinusOutlined />
                </Button>
                <span style={{ width: 32, textAlign: 'center' }}>{item.quantity}</span>
                <Button
                  size="small"
                  onClick={() => updateQuantity(item.id, 1)}
                >
                  <PlusOutlined />
                </Button>
              </div>
              <div style={{ textAlign: 'right', minWidth: 80 }}>
                <div>₹{item.unitPrice}</div>
                <div style={{ fontWeight: 500 }}>₹{(item.unitPrice * item.quantity).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid #d9d9d9', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Tax (18%):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <Button 
              onClick={generateBill} 
              type="primary"
              size="large"
              block
            >
              <ShoppingCartOutlined /> Generate Bill
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ScanBilling;
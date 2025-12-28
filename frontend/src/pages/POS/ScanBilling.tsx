import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Input, message, Modal, Row, Col, Space, Divider } from 'antd';
import type { InputRef } from 'antd';
import { MinusOutlined, PlusOutlined, ShoppingCartOutlined, ScanOutlined, CameraOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Html5QrcodeScanner } from 'html5-qrcode';

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
  const [showCamera, setShowCamera] = useState(false);
  const scanInputRef = useRef<InputRef>(null);
  const navigate = useNavigate();
  const { token, user } = useAuth();
  let html5QrcodeScanner: Html5QrcodeScanner | null = null;

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
    
    setIsProcessing(true);
    try {
      const response = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://localhost:5000/api'}/pos/scan/${encodeURIComponent(code)}`, {
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

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleScanSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    scanProduct(scanCode);
  };

  const startCameraScanning = () => {
    setShowCamera(true);
    setTimeout(() => {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: Math.min(250, window.innerWidth - 100), height: Math.min(250, window.innerWidth - 100) },
          aspectRatio: 1.0
        },
        false
      );
      
      html5QrcodeScanner.render(
        (decodedText) => {
          scanProduct(decodedText);
          stopCameraScanning();
        },
        (error) => {
          // Ignore errors - they're mostly "No QR code found"
        }
      );
    }, 100);
  };

  const stopCameraScanning = () => {
    if (html5QrcodeScanner) {
      html5QrcodeScanner.clear();
      html5QrcodeScanner = null;
    }
    setShowCamera(false);
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
    <div style={{ padding: 0 }}>
      <Row gutter={[16, 16]}>
        {/* Scanner Section */}
        <Col xs={24} lg={14}>
          <Card 
            title={
              <Space>
                <ScanOutlined />
                <span>Product Scanner</span>
              </Space>
            }
            size="small"
          >
            <form onSubmit={handleScanSubmit} style={{ marginBottom: 16 }}>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  ref={scanInputRef}
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  placeholder="Scan barcode or enter SKU..."
                  disabled={isProcessing}
                  style={{ flex: 1 }}
                />
                <Button type="primary" htmlType="submit" disabled={isProcessing}>
                  <ScanOutlined />
                </Button>
                <Button onClick={startCameraScanning} disabled={isProcessing}>
                  <CameraOutlined />
                </Button>
              </Space.Compact>
            </form>

            {/* Customer Info */}
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={12}>
                <Input
                  placeholder="Customer Name (Optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  size="middle"
                />
              </Col>
              <Col xs={24} sm={12}>
                <Input
                  placeholder="Customer Phone (Optional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  size="middle"
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Cart Section */}
        <Col xs={24} lg={10}>
          <Card 
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>Cart ({cart.length} items)</span>
              </Space>
            }
            size="small"
            style={{ position: 'sticky', top: 16 }}
          >
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  <ShoppingCartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <div>Cart is empty</div>
                  <div style={{ fontSize: 12 }}>Scan products to add them</div>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{ 
                    padding: '12px', 
                    border: '1px solid #f0f0f0', 
                    borderRadius: 6, 
                    marginBottom: 8,
                    backgroundColor: '#fafafa'
                  }}>
                    <Row align="middle" gutter={8}>
                      <Col flex="auto">
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: '#666' }}>SKU: {item.sku}</div>
                        <div style={{ fontSize: 12, color: '#1890ff' }}>₹{item.unitPrice} each</div>
                      </Col>
                      <Col>
                        <Space.Compact>
                          <Button
                            size="small"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <MinusOutlined />
                          </Button>
                          <Input
                            size="small"
                            value={item.quantity}
                            style={{ width: 50, textAlign: 'center' }}
                            readOnly
                          />
                          <Button
                            size="small"
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <PlusOutlined />
                          </Button>
                        </Space.Compact>
                      </Col>
                      <Col>
                        <div style={{ textAlign: 'right', minWidth: 60 }}>
                          <div style={{ fontWeight: 600, color: '#52c41a' }}>
                            ₹{(item.unitPrice * item.quantity).toFixed(2)}
                          </div>
                          <Button 
                            type="text" 
                            size="small" 
                            danger
                            onClick={() => removeFromCart(item.id)}
                            style={{ padding: 0, height: 'auto' }}
                          >
                            <DeleteOutlined />
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <>
                <Divider style={{ margin: '16px 0' }} />
                <div style={{ padding: '0 4px' }}>
                  <Row justify="space-between" style={{ marginBottom: 4 }}>
                    <Col>Subtotal:</Col>
                    <Col>₹{subtotal.toFixed(2)}</Col>
                  </Row>
                  <Row justify="space-between" style={{ marginBottom: 4 }}>
                    <Col>Tax (18%):</Col>
                    <Col>₹{tax.toFixed(2)}</Col>
                  </Row>
                  <Row justify="space-between" style={{ 
                    fontWeight: 'bold', 
                    fontSize: 16, 
                    marginBottom: 16,
                    padding: '8px 0',
                    borderTop: '1px solid #d9d9d9'
                  }}>
                    <Col>Total:</Col>
                    <Col style={{ color: '#52c41a' }}>₹{total.toFixed(2)}</Col>
                  </Row>
                  <Button 
                    onClick={generateBill} 
                    type="primary"
                    size="large"
                    block
                    style={{ height: 48 }}
                  >
                    <ShoppingCartOutlined /> Generate Bill
                  </Button>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
      
      <Modal
        title="Camera Scanner"
        open={showCamera}
        onCancel={stopCameraScanning}
        footer={[
          <Button key="close" onClick={stopCameraScanning}>
            Close
          </Button>
        ]}
        width={Math.min(450, window.innerWidth - 32)}
        centered
      >
        <div id="qr-reader" style={{ width: '100%' }}></div>
        <p style={{ marginTop: 16, textAlign: 'center', color: '#666', fontSize: 12 }}>
          Point your camera at a barcode or QR code
        </p>
      </Modal>
    </div>
  );
};

export default ScanBilling;
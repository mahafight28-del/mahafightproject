import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, InputNumber, message, Empty } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  };

  const updateQuantity = (id: string, quantity: number) => {
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    message.success('Item removed from cart');
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (!user || !user.roles?.includes('Customer')) {
      message.info('Please login to proceed with checkout');
      navigate('/customer/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <Title level={2}>Shopping Cart</Title>
        <Empty
          description="Your cart is empty"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Shopping Cart</Title>

      <Row gutter={24}>
        <Col span={16}>
          {cartItems.map(item => (
            <Card key={item.id} style={{ marginBottom: 16 }}>
              <Row align="middle">
                <Col span={4}>
                  <div style={{ width: 80, height: 80, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%' }} />
                    ) : (
                      <Text type="secondary">No Image</Text>
                    )}
                  </div>
                </Col>
                <Col span={8}>
                  <Title level={4}>{item.name}</Title>
                  <Text strong>₹{item.price}</Text>
                </Col>
                <Col span={6}>
                  <InputNumber
                    min={1}
                    max={10}
                    value={item.quantity}
                    onChange={(value) => updateQuantity(item.id, value || 1)}
                  />
                </Col>
                <Col span={4}>
                  <Text strong>₹{item.price * item.quantity}</Text>
                </Col>
                <Col span={2}>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeItem(item.id)}
                  />
                </Col>
              </Row>
            </Card>
          ))}
        </Col>

        <Col span={8}>
          <Card title="Order Summary">
            <Row justify="space-between" style={{ marginBottom: 16 }}>
              <Text>Subtotal:</Text>
              <Text strong>₹{getTotalAmount()}</Text>
            </Row>
            <Row justify="space-between" style={{ marginBottom: 16 }}>
              <Text>Shipping:</Text>
              <Text>Free</Text>
            </Row>
            <hr />
            <Row justify="space-between" style={{ marginTop: 16, marginBottom: 24 }}>
              <Title level={4}>Total:</Title>
              <Title level={4}>₹{getTotalAmount()}</Title>
            </Row>
            <Button
              type="primary"
              size="large"
              block
              icon={<ShoppingOutlined />}
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Cart;
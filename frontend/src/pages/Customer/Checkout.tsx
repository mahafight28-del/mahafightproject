import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, message, Divider } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const Checkout: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      message.warning('Your cart is empty');
      navigate('/');
      return;
    }
    setCartItems(cart);
  }, [navigate]);

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        shippingAddress: values.address,
        city: values.city,
        state: values.state,
        pinCode: values.pinCode,
        phone: values.phone,
        notes: values.notes
      };

      const order = await customerService.placeOrder(orderData);
      localStorage.removeItem('cart');
      message.success('Order placed successfully!');
      navigate(`/order-success/${order.id}`);
    } catch (error) {
      message.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Checkout</Title>

      <Row gutter={24}>
        <Col span={16}>
          <Card title="Shipping Information">
            <Form
              name="checkout"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please enter your address!' }]}
              >
                <TextArea rows={3} placeholder="Enter your full address" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="city"
                    label="City"
                    rules={[{ required: true, message: 'Please enter city!' }]}
                  >
                    <Input placeholder="City" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="state"
                    label="State"
                    rules={[{ required: true, message: 'Please enter state!' }]}
                  >
                    <Input placeholder="State" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="pinCode"
                    label="PIN Code"
                    rules={[
                      { required: true, message: 'Please enter PIN code!' },
                      { pattern: /^[0-9]{6}$/, message: 'Please enter valid 6-digit PIN code!' }
                    ]}
                  >
                    <Input placeholder="PIN Code" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="phone"
                label="Mobile Number"
                rules={[
                  { required: true, message: 'Please enter mobile number!' },
                  { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10-digit mobile number!' }
                ]}
              >
                <Input placeholder="Mobile Number" />
              </Form.Item>

              <Form.Item
                name="notes"
                label="Order Notes (Optional)"
              >
                <TextArea rows={2} placeholder="Any special instructions..." />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  icon={<ShoppingOutlined />}
                  block
                >
                  Place Order (Cash on Delivery)
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Order Summary">
            {cartItems.map(item => (
              <Row key={item.id} justify="space-between" style={{ marginBottom: 8 }}>
                <Col span={16}>
                  <Text>{item.name} x {item.quantity}</Text>
                </Col>
                <Col span={8} style={{ textAlign: 'right' }}>
                  <Text>₹{item.price * item.quantity}</Text>
                </Col>
              </Row>
            ))}
            
            <Divider />
            
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Text>Subtotal:</Text>
              <Text strong>₹{getTotalAmount()}</Text>
            </Row>
            
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Text>Shipping:</Text>
              <Text>Free</Text>
            </Row>
            
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Text>Payment Method:</Text>
              <Text>Cash on Delivery</Text>
            </Row>
            
            <Divider />
            
            <Row justify="space-between">
              <Title level={4}>Total:</Title>
              <Title level={4}>₹{getTotalAmount()}</Title>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Checkout;
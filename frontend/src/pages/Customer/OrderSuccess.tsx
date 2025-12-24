import React, { useEffect, useState } from 'react';
import { Result, Button, Card, Typography, Row, Col, Divider } from 'antd';
import { CheckCircleOutlined, HomeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { customerService, CustomerOrder } from '../../services/customerService';

const { Title, Text } = Typography;

const OrderSuccess: React.FC = () => {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId);
    }
  }, [orderId]);

  const loadOrder = async (id: string) => {
    try {
      const orderData = await customerService.getOrder(id);
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to load order');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Result
        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
        title="Order Placed Successfully!"
        subTitle="Thank you for your order. We'll process it shortly and keep you updated."
        extra={[
          <Button type="primary" key="home" icon={<HomeOutlined />} onClick={() => navigate('/')}>
            Continue Shopping
          </Button>,
          <Button key="orders" onClick={() => navigate('/my-orders')}>
            View My Orders
          </Button>
        ]}
      />

      {order && (
        <Row justify="center">
          <Col span={12}>
            <Card title="Order Details">
              <Row justify="space-between" style={{ marginBottom: 16 }}>
                <Text strong>Order Number:</Text>
                <Text>{order.orderNumber}</Text>
              </Row>
              
              <Row justify="space-between" style={{ marginBottom: 16 }}>
                <Text strong>Order Date:</Text>
                <Text>{new Date(order.orderDate).toLocaleDateString()}</Text>
              </Row>
              
              <Row justify="space-between" style={{ marginBottom: 16 }}>
                <Text strong>Status:</Text>
                <Text>{order.status}</Text>
              </Row>
              
              <Row justify="space-between" style={{ marginBottom: 16 }}>
                <Text strong>Payment Method:</Text>
                <Text>Cash on Delivery</Text>
              </Row>

              <Divider />

              <Title level={4}>Items Ordered</Title>
              {order.items.map(item => (
                <Row key={item.productId} justify="space-between" style={{ marginBottom: 8 }}>
                  <Col span={16}>
                    <Text>{item.productName} x {item.quantity}</Text>
                  </Col>
                  <Col span={8} style={{ textAlign: 'right' }}>
                    <Text>₹{item.totalPrice}</Text>
                  </Col>
                </Row>
              ))}

              <Divider />

              <Row justify="space-between">
                <Title level={4}>Total Amount:</Title>
                <Title level={4}>₹{order.totalAmount}</Title>
              </Row>

              <Divider />

              <Title level={4}>Shipping Address</Title>
              <Text>
                {order.shippingAddress}<br />
                {order.city}, {order.state} - {order.pinCode}
              </Text>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default OrderSuccess;
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Typography, Input, Select, message, Layout, Badge } from 'antd';
import { ShoppingCartOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { publicService, PublicProduct } from '../../services/publicService';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Header, Content } = Layout;

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const loadProducts = async () => {
    try {
      const data = await publicService.getProducts();
      setProducts(data);
    } catch (error) {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product: PublicProduct) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    message.success('Added to cart');
  };

  const getCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((total: number, item: any) => total + item.quantity, 0);
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>MAHA FIGHT</Title>
          </Col>
          <Col>
            <Badge count={getCartCount()} showZero>
              <Button 
                type="primary" 
                icon={<ShoppingCartOutlined />}
                onClick={() => navigate('/cart')}
                size="large"
              >
                Cart
              </Button>
            </Badge>
          </Col>
        </Row>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
          <Row gutter={16} align="middle">
            <Col span={12}>
              <Search
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="large"
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col span={8}>
              <Select
                placeholder="All Categories"
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%' }}
                size="large"
                allowClear
              >
                {categories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Text type="secondary">{filteredProducts.length} products</Text>
            </Col>
          </Row>
        </div>

        <Row gutter={[24, 24]}>
          {filteredProducts.map(product => (
            <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                style={{ height: '100%', borderRadius: '12px', overflow: 'hidden' }}
                cover={
                  <div 
                    style={{ 
                      height: 200, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images.find(img => img.isDefault)?.url || product.images[0]?.url} 
                        alt={product.name} 
                        style={{ height: '100%', width: '100%', objectFit: 'cover' }} 
                      />
                    ) : product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        style={{ height: '100%', width: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <Text style={{ color: '#fff', fontSize: '16px' }}>No Image</Text>
                    )}
                  </div>
                }
                actions={[
                  <Button 
                    type="link" 
                    onClick={() => navigate(`/products/${product.id}`)}
                    style={{ fontWeight: 500 }}
                  >
                    View Details
                  </Button>,
                  <Button 
                    type="primary"
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    icon={<ShoppingCartOutlined />}
                  >
                    Add to Cart
                  </Button>
                ]}
              >
                <Card.Meta
                  title={
                    <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${product.id}`)}>
                      {product.name}
                    </div>
                  }
                  description={
                    <div>
                      <Title level={4} style={{ color: '#52c41a', margin: '8px 0' }}>₹{product.price}</Title>
                      <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                        {product.category}
                      </Text>
                      {product.inStock ? (
                        <Text type="success" style={{ fontWeight: 500 }}>✓ In Stock</Text>
                      ) : (
                        <Text type="danger" style={{ fontWeight: 500 }}>✗ Out of Stock</Text>
                      )}
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        {filteredProducts.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Title level={3} type="secondary">No products found</Title>
            <Text type="secondary">Try adjusting your search or filter criteria</Text>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default ProductCatalog;
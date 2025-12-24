import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Image, Typography, Button, Tag, Spin } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'
import { publicService, PublicProduct } from '../../services/publicService'

const { Title, Text } = Typography

const PublicProductList: React.FC = () => {
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await publicService.getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProductImage = (product: PublicProduct) => {
    // Use primary image or first available image
    const primaryImage = product.images?.find(img => img.isDefault)
    const fallbackImage = product.images?.[0]
    return primaryImage?.url || fallbackImage?.url || product.imageUrl || '/placeholder-product.png'
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Our Products</Title>
      <Row gutter={[16, 16]}>
        {products.map((product) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <Card
              hoverable
              cover={
                <div style={{ height: 200, overflow: 'hidden' }}>
                  <Image
                    alt={product.name}
                    src={getProductImage(product)}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                    fallback="/placeholder-product.png"
                    preview={false}
                  />
                </div>
              }
              actions={[
                <Button 
                  type="primary" 
                  icon={<ShoppingCartOutlined />}
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              ]}
            >
              <Card.Meta
                title={
                  <div>
                    <Text strong>{product.name}</Text>
                    {!product.inStock && (
                      <Tag color="red" style={{ marginLeft: 8 }}>
                        Out of Stock
                      </Tag>
                    )}
                  </div>
                }
                description={
                  <div>
                    <Text type="secondary">{product.category}</Text>
                    {product.brand && (
                      <Text type="secondary"> • {product.brand}</Text>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                        ${product.price.toFixed(2)}
                      </Text>
                    </div>
                    {product.description && (
                      <Text 
                        type="secondary" 
                        style={{ 
                          display: 'block', 
                          marginTop: 8,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {product.description}
                      </Text>
                    )}
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default PublicProductList
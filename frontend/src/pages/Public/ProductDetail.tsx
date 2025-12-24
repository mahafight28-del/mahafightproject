import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Row, Col, Image, Typography, Button, Tag, Spin, Card, Divider } from 'antd'
import { ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { publicService, PublicProduct } from '../../services/publicService'

const { Title, Text, Paragraph } = Typography

const PublicProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('')

  useEffect(() => {
    if (id) {
      loadProduct(id)
    }
  }, [id])

  const loadProduct = async (productId: string) => {
    try {
      const data = await publicService.getProduct(productId)
      setProduct(data)
      
      // Set initial selected image
      const primaryImage = data.images?.find(img => img.isDefault)
      const fallbackImage = data.images?.[0]
      setSelectedImage(primaryImage?.url || fallbackImage?.url || data.imageUrl || '/placeholder-product.png')
    } catch (error) {
      console.error('Failed to load product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Product not found</Title>
        <Button icon={<ArrowLeftOutlined />} onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => window.history.back()}
        style={{ marginBottom: '16px' }}
      >
        Back to Products
      </Button>

      <Row gutter={[32, 32]}>
        {/* Image Gallery */}
        <Col xs={24} md={12}>
          <Card>
            {/* Main Image */}
            <div style={{ marginBottom: '16px' }}>
              <Image
                width="100%"
                height={400}
                src={selectedImage}
                style={{ objectFit: 'cover' }}
                fallback="/placeholder-product.png"
              />
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.images.map((image, index) => (
                  <div
                    key={image.id}
                    style={{
                      cursor: 'pointer',
                      border: selectedImage === image.url ? '2px solid #1890ff' : '2px solid transparent',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}
                    onClick={() => setSelectedImage(image.url)}
                  >
                    <Image
                      width={80}
                      height={80}
                      src={image.url}
                      style={{ objectFit: 'cover' }}
                      fallback="/placeholder-product.png"
                      preview={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Product Details */}
        <Col xs={24} md={12}>
          <div>
            <Title level={2}>{product.name}</Title>
            
            <div style={{ marginBottom: '16px' }}>
              <Tag color="blue">{product.category}</Tag>
              {product.brand && <Tag color="green">{product.brand}</Tag>}
              {product.inStock ? (
                <Tag color="success">In Stock</Tag>
              ) : (
                <Tag color="error">Out of Stock</Tag>
              )}
            </div>

            <Title level={3} style={{ color: '#1890ff', marginBottom: '24px' }}>
              ${product.price.toFixed(2)}
            </Title>

            {product.description && (
              <>
                <Title level={4}>Description</Title>
                <Paragraph>{product.description}</Paragraph>
                <Divider />
              </>
            )}

            <div style={{ marginTop: '32px' }}>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                disabled={!product.inStock}
                style={{ width: '100%', height: '50px' }}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>

            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <Text type="secondary">
                <strong>Product ID:</strong> {product.id}
              </Text>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default PublicProductDetail
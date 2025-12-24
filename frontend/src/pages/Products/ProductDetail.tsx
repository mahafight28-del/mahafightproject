import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Tag, Row, Col, Statistic } from 'antd'
import { ArrowLeftOutlined, EditOutlined, ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons'
import { getProduct } from '../../services/productService'
import { Product } from '../../types/product'

const ProductDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getProduct(id)
      .then(setItem)
      .finally(() => setLoading(false))
  }, [id])

  if (!item && !loading) {
    return (
      <div style={{ padding: 24 }}>
        <Card title="Product Not Found">
          <p>The requested product could not be found.</p>
          <Button onClick={() => navigate('/products')}>Back to Products</Button>
        </Card>
      </div>
    )
  }

  const stock = item?.stockQuantity || item?.stock || 0
  const minLevel = item?.minStockLevel || 10
  const stockStatus = stock <= 0 ? 'Out of Stock' : stock <= minLevel ? 'Low Stock' : 'In Stock'
  const stockColor = stock <= 0 ? 'red' : stock <= minLevel ? 'orange' : 'green'
  const profit = (item?.unitPrice || item?.price || 0) - (item?.costPrice || 0)
  const profitMargin = item?.costPrice ? ((profit / (item?.unitPrice || item?.price || 1)) * 100).toFixed(1) : '0'

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={`Product: ${item?.name || 'Loading...'}`}
        extra={
          <div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 8 }}>
              Back
            </Button>
            <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/products/${id}/edit`)}>
              Edit
            </Button>
          </div>
        }
        loading={loading}
      >
        {item && (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Statistic 
                  title="Unit Price" 
                  value={item.unitPrice || item.price || 0} 
                  precision={2} 
                  prefix={<DollarOutlined />} 
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Cost Price" 
                  value={item.costPrice || 0} 
                  precision={2} 
                  prefix={<DollarOutlined />} 
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Profit Margin" 
                  value={profitMargin} 
                  suffix="%" 
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Stock Quantity" 
                  value={stock} 
                  prefix={<ShoppingCartOutlined />} 
                />
              </Col>
            </Row>

            <Descriptions column={2} bordered>
              <Descriptions.Item label="Product Name">{item.name}</Descriptions.Item>
              <Descriptions.Item label="SKU">{item.sku}</Descriptions.Item>
              <Descriptions.Item label="Category">{item.category}</Descriptions.Item>
              <Descriptions.Item label="Brand">{item.brand}</Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {item.description || 'No description available'}
              </Descriptions.Item>
              <Descriptions.Item label="Weight">
                {item.weight ? `${item.weight} kg` : 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Dimensions">
                {item.dimensions || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Stock Status">
                <Tag color={stockColor}>{stockStatus}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Min Stock Level">
                {item.minStockLevel || 10}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={item.isActive !== false ? 'green' : 'red'}>
                  {item.isActive !== false ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown'}
              </Descriptions.Item>
            </Descriptions>

            {stock <= minLevel && (
              <Card 
                size="small" 
                style={{ marginTop: 16, backgroundColor: '#fff2e8', borderColor: '#ffbb96' }}
              >
                <p style={{ margin: 0, color: '#d4380d' }}>
                  <strong>Stock Alert:</strong> This product is {stock <= 0 ? 'out of stock' : 'running low'}. 
                  Consider restocking soon.
                </p>
              </Card>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

export default ProductDetail

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Tag, Row, Col, Statistic, Space, Divider } from 'antd'
import { ArrowLeftOutlined, EditOutlined, ShoppingCartOutlined, DollarOutlined, PrinterOutlined } from '@ant-design/icons'
import { getProduct } from '../../services/productService'
import { Product } from '../../types/product'
import { useAuth } from '../../context/AuthContext'

const ProductDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const { hasRole } = useAuth()
  const isAdmin = hasRole('Admin')

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
    <div style={{ padding: 0 }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>
              {item?.name || 'Loading...'}
            </span>
            {item?.sku && (
              <Tag color="blue" style={{ margin: 0 }}>SKU: {item.sku}</Tag>
            )}
          </div>
        }
        extra={
          <Space wrap>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
              size="middle"
            >
              <span style={{ display: window.innerWidth < 576 ? 'none' : 'inline' }}>Back</span>
            </Button>
            {isAdmin && (
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => navigate(`/products/${id}/edit`)}
                size="middle"
              >
                <span style={{ display: window.innerWidth < 576 ? 'none' : 'inline' }}>Edit</span>
              </Button>
            )}
          </Space>
        }
        loading={loading}
        bodyStyle={{ padding: 0 }}
      >
        {item && (
          <>
            <div style={{ padding: '24px' }}>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Statistic 
                    title="Unit Price" 
                    value={item.unitPrice || item.price || 0} 
                    precision={2} 
                    prefix={<DollarOutlined />} 
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic 
                    title="Cost Price" 
                    value={item.costPrice || 0} 
                    precision={2} 
                    prefix={<DollarOutlined />} 
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic 
                    title="Profit Margin" 
                    value={profitMargin} 
                    suffix="%" 
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic 
                    title="Stock Quantity" 
                    value={stock} 
                    prefix={<ShoppingCartOutlined />} 
                  />
                </Col>
              </Row>
            </div>

            <Divider style={{ margin: 0 }} />

            <div style={{ padding: '24px' }}>
              <Descriptions 
                column={{ xs: 1, sm: 1, md: 2 }} 
                bordered
                size="middle"
              >
                <Descriptions.Item label="Product Name">{item.name}</Descriptions.Item>
                <Descriptions.Item label="Category">{item.category}</Descriptions.Item>
                <Descriptions.Item label="Brand">{item.brand}</Descriptions.Item>
                <Descriptions.Item label="Weight">
                  {item.weight ? `${item.weight} kg` : 'Not specified'}
                </Descriptions.Item>
                <Descriptions.Item label="Dimensions">
                  {item.dimensions || 'Not specified'}
                </Descriptions.Item>
                <Descriptions.Item label="Min Stock Level">
                  {item.minStockLevel || 10}
                </Descriptions.Item>
                <Descriptions.Item label="Stock Status">
                  <Tag color={stockColor}>{stockStatus}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={item.isActive !== false ? 'green' : 'red'}>
                    {item.isActive !== false ? 'Active' : 'Inactive'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown'}
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>
                  {item.description || 'No description available'}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {(item.barcodeUrl || item.qrCodeUrl) && (
              <>
                <Divider style={{ margin: 0 }} />
                <div style={{ padding: '24px' }}>
                  <h4 style={{ marginBottom: 16 }}>Scanning Codes</h4>
                  <Row gutter={[24, 24]}>
                    {item.barcodeUrl && (
                      <Col xs={24} sm={12}>
                        <Card size="small" title="Barcode">
                          <div style={{ textAlign: 'center' }}>
                            <img 
                              src={`${(import.meta as any).env?.VITE_API_BASE?.replace('/api', '') || 'http://localhost:5000'}/uploads/${item.barcodeUrl}`} 
                              alt="Barcode" 
                              style={{ 
                                maxHeight: 80, 
                                maxWidth: '100%',
                                border: '1px solid #d9d9d9', 
                                borderRadius: 4,
                                marginBottom: 8
                              }} 
                            />
                            <br />
                            <Button 
                              size="small" 
                              icon={<PrinterOutlined />}
                              onClick={() => window.print()}
                            >
                              Print
                            </Button>
                          </div>
                        </Card>
                      </Col>
                    )}
                    {item.qrCodeUrl && (
                      <Col xs={24} sm={12}>
                        <Card size="small" title="QR Code">
                          <div style={{ textAlign: 'center' }}>
                            <img 
                              src={`${(import.meta as any).env?.VITE_API_BASE?.replace('/api', '') || 'http://localhost:5000'}/uploads/${item.qrCodeUrl}`} 
                              alt="QR Code" 
                              style={{ 
                                height: 80, 
                                width: 80,
                                border: '1px solid #d9d9d9', 
                                borderRadius: 4,
                                marginBottom: 8
                              }} 
                            />
                            <br />
                            <Button 
                              size="small" 
                              icon={<PrinterOutlined />}
                              onClick={() => window.print()}
                            >
                              Print
                            </Button>
                          </div>
                        </Card>
                      </Col>
                    )}
                  </Row>
                </div>
              </>
            )}

            {stock <= minLevel && (
              <>
                <Divider style={{ margin: 0 }} />
                <div style={{ padding: '24px' }}>
                  <Card 
                    size="small" 
                    style={{ 
                      backgroundColor: '#fff2e8', 
                      borderColor: '#ffbb96',
                      border: '1px solid #ffbb96'
                    }}
                  >
                    <p style={{ margin: 0, color: '#d4380d' }}>
                      <strong>⚠️ Stock Alert:</strong> This product is {stock <= 0 ? 'out of stock' : 'running low'}. 
                      Consider restocking soon.
                    </p>
                  </Card>
                </div>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

export default ProductDetail

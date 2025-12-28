import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, message, Tag, Row, Col, Input, Select, Popconfirm } from 'antd'
import { DownloadOutlined, EditOutlined, PlusOutlined, SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { getProducts } from '../../services/productService'
import { Product } from '../../types/product'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const ProductsList: React.FC = () => {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const isAdmin = hasRole('Admin')

  useEffect(() => {
    setLoading(true)
    getProducts().then(setItems).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string, name: string) => {
    try {
      await api.delete(`/products/${id}`)
      message.success(`${name} deleted successfully`)
      setLoading(true)
      getProducts().then(setItems).finally(() => setLoading(false))
    } catch (error) {
      message.error('Failed to delete product')
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await api.get('/products/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `products_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      message.success('Products exported successfully')
    } catch {
      message.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchText || 
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchText.toLowerCase())
    const matchesCategory = !categoryFilter || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(items.map(item => item.category).filter(Boolean))]

  const columns = [
    { 
      title: 'Product', 
      key: 'product',
      render: (_: any, rec: Product) => (
        <div>
          <div style={{ fontWeight: 500 }}>{rec.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>SKU: {rec.sku}</div>
        </div>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any
    },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category',
      responsive: ['sm', 'md', 'lg', 'xl'] as any
    },
    { 
      title: 'Price', 
      key: 'price', 
      render: (_: any, rec: Product) => {
        const price = rec.unitPrice || rec.price || 0
        return `$${price.toFixed(2)}`
      },
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any
    },
    { 
      title: 'Stock', 
      key: 'stock', 
      render: (_: any, rec: Product) => {
        const stock = rec.stockQuantity || rec.stock || 0
        const minLevel = rec.minStockLevel || 10
        const color = stock <= 0 ? 'red' : stock <= minLevel ? 'orange' : 'green'
        return <Tag color={color}>{stock}</Tag>
      },
      responsive: ['sm', 'md', 'lg', 'xl'] as any
    },
    { 
      title: 'QR Code', 
      key: 'qrCode', 
      render: (_: any, rec: Product) => {
        const isExpired = rec.qrCodeExpiresAt && new Date(rec.qrCodeExpiresAt) <= new Date()
        
        if (!rec.qrCodeUrl) return <span style={{ fontSize: '12px', color: '#999' }}>Not generated</span>
        
        return (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img 
              src={`${(import.meta as any).env?.VITE_API_BASE?.replace('/api', '') || 'http://localhost:5000'}/uploads/${rec.qrCodeUrl}`} 
              alt="QR Code" 
              style={{ 
                height: 32, 
                width: 32, 
                objectFit: 'contain',
                opacity: isExpired ? 0.3 : 1,
                filter: isExpired ? 'grayscale(100%)' : 'none'
              }} 
            />
            {isExpired && (
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '8px',
                color: 'red',
                fontWeight: 'bold',
                background: 'rgba(255,255,255,0.8)'
              }}>
                EXP
              </div>
            )}
          </div>
        )
      },
      responsive: ['md', 'lg', 'xl'] as any
    },
    { 
      title: 'Status', 
      dataIndex: 'isActive', 
      key: 'isActive', 
      render: (active: boolean) => (
        <Tag color={active !== false ? 'green' : 'red'}>
          {active !== false ? 'Active' : 'Inactive'}
        </Tag>
      ),
      responsive: ['lg', 'xl'] as any
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      render: (_: any, rec: Product) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => navigate(`/products/${rec.id}`)}
            type="text"
            title="View"
          />
          {isAdmin && (
            <>
              <Button 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => navigate(`/products/${rec.id}/edit`)}
                type="text"
                title="Edit"
              />
              <Popconfirm
                title="Delete Product"
                description={`Are you sure you want to delete "${rec.name}"?`}
                onConfirm={() => handleDelete(rec.id, rec.name)}
                okText="Yes"
                cancelText="No"
                okType="danger"
              >
                <Button 
                  size="small" 
                  icon={<DeleteOutlined />}
                  type="text"
                  danger
                  title="Delete"
                />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
      width: isAdmin ? 120 : 80,
      fixed: 'right' as any,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any
    }
  ]

  return (
    <div style={{ padding: 0 }}>
      <Card 
        title={<span style={{ fontSize: '18px', fontWeight: 600 }}>Products</span>}
        extra={
          isAdmin ? (
            <Space wrap>
              <Button 
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={exporting}
                size="middle"
              >
                <span style={{ display: window.innerWidth < 576 ? 'none' : 'inline' }}>Export</span>
              </Button>
              <Button type="primary" icon={<PlusOutlined />} size="middle">
                <Link to="/products/new" style={{ color: 'inherit' }}>
                  <span style={{ display: window.innerWidth < 576 ? 'none' : 'inline' }}>New Product</span>
                </Link>
              </Button>
            </Space>
          ) : undefined
        }
        bodyStyle={{ padding: 0 }}
      >
        {/* Filters */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search products..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filter by category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                allowClear
                style={{ width: '100%' }}
              >
                {categories.map(cat => (
                  <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <Table 
          rowKey="id" 
          dataSource={filteredItems} 
          columns={columns} 
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`,
            responsive: true
          }}
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>
    </div>
  )
}

export default ProductsList
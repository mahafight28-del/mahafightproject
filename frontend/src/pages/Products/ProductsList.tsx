import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, message, Tag } from 'antd'
import { DownloadOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { getProducts } from '../../services/productService'
import { Product } from '../../types/product'
import api from '../../services/api'

const ProductsList: React.FC = () => {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    getProducts().then(setItems).finally(() => setLoading(false))
  }, [])

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

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Price', key: 'price', render: (_: any, rec: Product) => {
      const price = rec.unitPrice || rec.price || 0
      return `$${price.toFixed(2)}`
    }},
    { title: 'Stock', key: 'stock', render: (_: any, rec: Product) => {
      const stock = rec.stockQuantity || rec.stock || 0
      const minLevel = rec.minStockLevel || 10
      const color = stock <= minLevel ? 'red' : stock <= minLevel * 2 ? 'orange' : 'green'
      return <Tag color={color}>{stock}</Tag>
    }},
    { title: 'Status', dataIndex: 'isActive', key: 'isActive', render: (active: boolean) => (
      <Tag color={active !== false ? 'green' : 'red'}>{active !== false ? 'Active' : 'Inactive'}</Tag>
    )},
    { title: 'Actions', key: 'actions', render: (_: any, rec: Product) => (
      <Space>
        <Button 
          size="small" 
          onClick={() => navigate(`/products/${rec.id}`)}
        >
          View
        </Button>
        <Button 
          size="small" 
          icon={<EditOutlined />}
          onClick={() => navigate(`/products/${rec.id}/edit`)}
        >
          Edit
        </Button>
      </Space>
    )}
  ]

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title="Products" 
        extra={
          <Space>
            <Button 
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={exporting}
            >
              Export CSV
            </Button>
            <Button type="primary" icon={<PlusOutlined />}>
              <Link to="/products/new">New Product</Link>
            </Button>
          </Space>
        }
      >
        <Table rowKey="id" dataSource={Array.isArray(items) ? items : []} columns={columns} loading={loading} />
      </Card>
    </div>
  )
}

export default ProductsList

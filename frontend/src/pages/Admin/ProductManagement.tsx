import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, Popconfirm, message, Tag, Input, Select } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import { getProducts, deleteProduct, exportProducts } from '../../services/productService'
import { Product } from '../../types/product'
import { Link, useNavigate } from 'react-router-dom'

const ProductManagement: React.FC = () => {
  const [items, setItems] = useState<Product[]>([])
  const [filteredItems, setFilteredItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try { 
      const res = await getProducts()
      setItems(res || [])
      setFilteredItems(res || [])
    } finally { setLoading(false) }
  }
  
  useEffect(() => { load() }, [])

  useEffect(() => {
    let filtered = items
    if (searchText) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchText.toLowerCase())
      )
    }
    if (categoryFilter) {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }
    setFilteredItems(filtered)
  }, [items, searchText, categoryFilter])

  const handleDelete = async (id: string) => {
    try { 
      await deleteProduct(id)
      message.success('Product deleted successfully')
      load()
    } catch { 
      message.error('Delete failed')
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await exportProducts()
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `products_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      message.success('Products exported successfully')
    } catch {
      message.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const categories = [...new Set(items.map(p => p.category).filter(Boolean))]
  const lowStockCount = items.filter(p => (p.stockQuantity || p.stock || 0) <= (p.minStockLevel || 10)).length

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
          icon={<EditOutlined />}
          onClick={() => navigate(`/products/${rec.id}/edit`)}
        >
          Edit
        </Button>
        <Popconfirm 
          title="Delete this product?" 
          onConfirm={() => handleDelete(rec.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button size="small" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      </Space>
    )}
  ]

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={`Product Management (${filteredItems.length} products${lowStockCount > 0 ? `, ${lowStockCount} low stock` : ''})`}
        extra={
          <Space>
            <Button 
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={exporting}
            >
              Export
            </Button>
            <Button type="primary" icon={<PlusOutlined />}>
              <Link to="/products/new">New Product</Link>
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by category"
            value={categoryFilter || undefined}
            onChange={setCategoryFilter}
            allowClear
            style={{ width: 200 }}
          >
            {categories.map(cat => (
              <Select.Option key={cat} value={cat}>{cat}</Select.Option>
            ))}
          </Select>
        </div>
        
        <Table 
          rowKey="id" 
          dataSource={filteredItems} 
          columns={columns} 
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  )
}

export default ProductManagement

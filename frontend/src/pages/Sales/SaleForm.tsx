import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Input, Button, Select, InputNumber, Table, Space, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { createSale, getSale } from '../../services/saleService'
import { getProducts } from '../../services/productService'
import { getDealers } from '../../services/dealerService'
import { useAuth } from '../../context/AuthContext'
import { Sale } from '../../types/sale'
import { Product } from '../../types/product'
import { Dealer } from '../../types/dealer'

type SaleItem = {
  key: string
  productId: string
  productName?: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

const SaleForm: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const auth = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [items, setItems] = useState<SaleItem[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsData = await getProducts()
        setProducts(productsData || [])
        
        // Only load dealers if user is admin
        if (auth.hasRole('Admin')) {
          const dealersData = await getDealers()
          setDealers(dealersData || [])
        } else {
          // For dealers, load their dealer info from API
          const dealersData = await getDealers()
          const dealerInfo = dealersData?.[0] // First dealer should be current user's dealer
          if (dealerInfo) {
            setDealers([dealerInfo])
            form.setFieldValue('dealerId', dealerInfo.id)
          }
        }
      } catch {}
    }
    loadData()
  }, [])

  const addItem = () => {
    const newItem: SaleItem = {
      key: Date.now().toString(),
      productId: '',
      quantity: 1,
      unitPrice: 0,
      lineTotal: 0
    }
    setItems([...items, newItem])
  }

  const updateItem = (key: string, field: keyof SaleItem, value: any) => {
    setItems(items.map(item => {
      if (item.key !== key) return item
      const updated = { ...item, [field]: value }
      if (field === 'productId') {
        const product = products.find(p => p.id === value)
        updated.productName = product?.name
        updated.unitPrice = product?.price || 0
      }
      if (field === 'quantity' || field === 'unitPrice') {
        updated.lineTotal = updated.quantity * updated.unitPrice
      }
      return updated
    }))
  }

  const removeItem = (key: string) => {
    setItems(items.filter(item => item.key !== key))
  }

  const onFinish = async (values: any) => {
    if (!items.length) {
      message.error('Please add at least one item')
      return
    }
    
    const saleData = {
      dealerId: values.dealerId,
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone,
      paymentMethod: values.paymentMethod || 'Cash',
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    }

    setLoading(true)
    try {
      await createSale(saleData)
      message.success('Sale created successfully')
      navigate('/sales')
    } catch {
      message.error('Failed to create sale')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: SaleItem) => (
        <Select
          style={{ width: 200 }}
          placeholder="Select product"
          value={record.productId || undefined}
          onChange={(value) => updateItem(record.key, 'productId', value)}
        >
          {products.map(p => (
            <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (_: any, record: SaleItem) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => updateItem(record.key, 'quantity', value || 1)}
        />
      )
    },
    {
      title: 'Unit Price',
      key: 'unitPrice',
      render: (_: any, record: SaleItem) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.unitPrice}
          onChange={(value) => updateItem(record.key, 'unitPrice', value || 0)}
        />
      )
    },
    {
      title: 'Line Total',
      key: 'lineTotal',
      render: (_: any, record: SaleItem) => record.lineTotal.toFixed(2)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SaleItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.key)}
        />
      )
    }
  ]

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0)

  return (
    <div style={{ padding: 24 }}>
      <Card title="New Sale">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="dealerId" label="Dealer" rules={[{ required: true }]}>
            <Select placeholder="Select dealer" disabled={!auth.hasRole('Admin')}>
              {Array.isArray(dealers) ? dealers.map(d => (
                <Select.Option key={d.id} value={d.id}>{d.businessName || d.name}</Select.Option>
              )) : []}
            </Select>
          </Form.Item>
          
          <Form.Item name="customerName" label="Customer Name">
            <Input />
          </Form.Item>
          
          <Form.Item name="customerEmail" label="Customer Email">
            <Input type="email" />
          </Form.Item>
          
          <Form.Item name="customerPhone" label="Customer Phone">
            <Input />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <Space>
              <Button type="dashed" onClick={addItem} icon={<PlusOutlined />}>
                Add Item
              </Button>
            </Space>
          </div>

          <Table
            dataSource={items}
            columns={columns}
            pagination={false}
            size="small"
            style={{ marginBottom: 16 }}
          />

          <div style={{ textAlign: 'right', marginBottom: 16, fontSize: 16, fontWeight: 'bold' }}>
            Total: ${total.toFixed(2)}
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Sale
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default SaleForm

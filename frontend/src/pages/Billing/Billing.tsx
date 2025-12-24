import React, { useEffect, useMemo, useState } from 'react'
import { Card, Row, Col, Table, InputNumber, Button, message, Input, Select } from 'antd'
import { getProducts } from '../../services/productService'
import { getDealers } from '../../services/dealerService'
import { createSale } from '../../services/saleService'
import { Product } from '../../types/product'
import { useSearchParams, useNavigate } from 'react-router-dom'

type Line = { productId: string; name: string; price: number; qty: number }

const Billing: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [dealers, setDealers] = useState<any[]>([])
  const [lines, setLines] = useState<Line[]>([])
  const [loading, setLoading] = useState(false)
  const [dealerId, setDealerId] = useState<string>('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      const [productsData, dealersData] = await Promise.all([
        getProducts(),
        getDealers()
      ])
      setProducts(productsData || [])
      setDealers(dealersData || [])
    }
    loadData()
  }, [])

  useEffect(() => {
    const pid = searchParams.get('product')
    if (pid && products.length) {
      const prod = products.find(p => p.id === pid)
      if (prod) addLine(prod)
    }
  }, [searchParams, products])

  const addLine = (p: Product) => {
    setLines(prev => {
      const exists = prev.find(l => l.productId === p.id)
      if (exists) return prev.map(l => l.productId===p.id?{...l, qty: l.qty+1}:l)
      return [...prev, { productId: p.id, name: p.name, price: p.price||0, qty: 1 }]
    })
  }

  const updateQty = (productId: string, qty: number) => {
    setLines(prev => prev.map(l => l.productId===productId?{...l, qty}:l))
  }

  const removeLine = (productId: string) => {
    setLines(prev => prev.filter(l => l.productId !== productId))
  }

  const total = useMemo(() => lines.reduce((s, l) => s + (l.price||0) * (l.qty||0), 0), [lines])

  const handleCreateSale = async () => {
    if (!lines.length) { message.warning('Add items first'); return }
    if (!dealerId) { message.warning('Select dealer'); return }
    
    setLoading(true)
    try {
      const saleData = {
        dealerId,
        customerName,
        customerEmail,
        paymentMethod: 'Cash',
        items: lines.map(l => ({
          productId: l.productId,
          quantity: l.qty,
          unitPrice: l.price
        }))
      }
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
    { title: 'Product', dataIndex: 'name', key: 'name' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (v: any) => `$${v?.toFixed(2)}` },
    { title: 'Qty', dataIndex: 'qty', key: 'qty', render: (_: any, rec: Line) => (
      <InputNumber min={0} value={rec.qty} onChange={(v) => updateQty(rec.productId, Number(v)||0)} />
    )},
    { title: 'Line Total', key: 'lt', render: (_: any, rec: Line) => `$${((rec.price||0)*(rec.qty||0)).toFixed(2)}` },
    { title: 'Action', key: 'action', render: (_: any, rec: Line) => (
      <Button size="small" danger onClick={() => removeLine(rec.productId)}>Remove</Button>
    )}
  ]

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16}>
        <Col span={10}>
          <Card title="Products">
            <Table 
              dataSource={Array.isArray(products) ? products : []} 
              rowKey="id" 
              pagination={{ pageSize: 8 }}
              columns={[
                { title: 'Name', dataIndex: 'name', key: 'name' },
                { title: 'Price', dataIndex: 'price', key: 'price', render: (v:any) => `$${v?.toFixed(2)}` },
                { title: 'Stock', dataIndex: 'stock', key: 'stock' },
                { title: 'Action', key: 'action', render: (_: any, rec: Product) => (
                  <Button onClick={() => addLine(rec)}>Add</Button>
                )}
              ]} 
            />
          </Card>
        </Col>
        
        <Col span={14}>
          <Card title="Sale Details">
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <label>Dealer:</label>
                  <Select 
                    style={{ width: '100%' }} 
                    placeholder="Select dealer"
                    value={dealerId || undefined}
                    onChange={setDealerId}
                  >
                    {Array.isArray(dealers) ? dealers.map(d => (
                      <Select.Option key={d.id} value={d.id}>
                        {d.businessName || d.name}
                      </Select.Option>
                    )) : []}
                  </Select>
                </Col>
                <Col span={12}>
                  <label>Customer Name:</label>
                  <Input 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer name"
                  />
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <label>Customer Email:</label>
                  <Input 
                    value={customerEmail} 
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Customer email"
                  />
                </Col>
              </Row>
            </div>
            
            <Table 
              dataSource={lines} 
              columns={columns} 
              rowKey="productId" 
              pagination={false} 
              footer={() => (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>Total: <b>${total.toFixed(2)}</b></div>
                  <Button type="primary" loading={loading} onClick={handleCreateSale}>
                    Create Sale
                  </Button>
                </div>
              )} 
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Billing

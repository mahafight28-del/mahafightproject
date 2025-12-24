import React, { useEffect, useState } from 'react'
import { Card, Row, Col, List, Button, Tag, Statistic } from 'antd'
import { ShoppingCartOutlined, DollarOutlined, FileTextOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { getProducts } from '../../services/productService'
import { getSales } from '../../services/saleService'
import { getCommissions } from '../../services/commissionService'
import { useAuth } from '../../context/AuthContext'
import { Product } from '../../types/product'

const DealerDashboard: React.FC = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [commissions, setCommissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, salesData, commissionsData] = await Promise.all([
          getProducts(),
          getSales(),
          getCommissions()
        ])
        setProducts(productsData || [])
        setSales(salesData || [])
        setCommissions(commissionsData || [])
      } catch {}
      finally { setLoading(false) }
    }
    loadData()
  }, [])

  const totalSales = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
  const totalCommissions = commissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0)
  const pendingCommissions = commissions.filter(c => c.paymentStatus === 'Pending').reduce((sum, c) => sum + (c.commissionAmount || 0), 0)

  return (
    <div style={{ padding: 24 }}>
      <h2>Welcome, {user?.name || 'Dealer'}!</h2>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Sales"
              value={totalSales}
              precision={2}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Commissions"
              value={totalCommissions}
              precision={2}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Pending Commissions"
              value={pendingCommissions}
              precision={2}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="Available Products" loading={loading}>
            <List
              dataSource={Array.isArray(products) ? products.slice(0, 10) : []}
              renderItem={(item: Product) => (
                <List.Item actions={[
                  <Link key="sale" to={`/sales/new?product=${item.id}`}>
                    <Button type="primary" icon={<ShoppingCartOutlined />}>Create Sale</Button>
                  </Link>
                ]}> 
                  <List.Item.Meta 
                    title={item.name} 
                    description={`SKU: ${item.sku} • $${item.price?.toFixed(2) || '0.00'}`} 
                  />
                  <div>
                    {item.stock != null ? (
                      <Tag color={item.stock > 0 ? 'green' : 'red'}>
                        {item.stock} in stock
                      </Tag>
                    ) : null}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card title="Quick Actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button type="primary" icon={<ShoppingCartOutlined />} block>
                <Link to="/sales/new">Create New Sale</Link>
              </Button>
              <Button type="default" icon={<FileTextOutlined />} block>
                <Link to="/sales">View My Sales</Link>
              </Button>
              <Button type="default" icon={<DollarOutlined />} block>
                <Link to="/commissions">View Commissions</Link>
              </Button>
              <Button type="default" block>
                <Link to="/invoices">View Invoices</Link>
              </Button>
            </div>
          </Card>
          
          <Card title="Recent Sales" style={{ marginTop: 16 }} loading={loading}>
            <List
              size="small"
              dataSource={Array.isArray(sales) ? sales.slice(0, 5) : []}
              renderItem={(sale: any) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div>{sale.saleNumber}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      ${sale.totalAmount?.toFixed(2)} • {new Date(sale.saleDate).toLocaleDateString()}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DealerDashboard

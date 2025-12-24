import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Button, DatePicker, Space, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { getSales } from '../../services/saleService'
import { getCommissions } from '../../services/commissionService'
import api from '../../services/api'

const { RangePicker } = DatePicker

const Reports: React.FC = () => {
  const [sales, setSales] = useState<any[]>([])
  const [commissions, setCommissions] = useState<any[]>([])
  const [dateRange, setDateRange] = useState<[any, any] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, c] = await Promise.all([getSales(), getCommissions()])
        setSales(s || [])
        setCommissions(c || [])
      } catch {}
    }
    load()
  }, [])

  const handleExportSales = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateRange?.[0]) params.append('fromDate', dateRange[0].format('YYYY-MM-DD'))
      if (dateRange?.[1]) params.append('toDate', dateRange[1].format('YYYY-MM-DD'))
      
      const response = await api.get(`/reports/export/sales?${params}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `sales_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      message.success('Sales exported successfully')
    } catch {
      message.error('Export failed')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCommissions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateRange?.[0]) params.append('fromDate', dateRange[0].format('YYYY-MM-DD'))
      if (dateRange?.[1]) params.append('toDate', dateRange[1].format('YYYY-MM-DD'))
      
      const response = await api.get(`/reports/export/commissions?${params}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `commissions_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      message.success('Commissions exported successfully')
    } catch {
      message.error('Export failed')
    } finally {
      setLoading(false)
    }
  }

  const handleExportDealers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/dealers/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `dealers_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      message.success('Dealers exported successfully')
    } catch {
      message.error('Export failed')
    } finally {
      setLoading(false)
    }
  }

  const handleExportProducts = async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  const totalSales = sales.reduce((acc, s) => acc + (s.totalAmount || s.total || 0), 0)
  const totalCommissions = commissions.reduce((acc, c) => acc + (c.commissionAmount || c.amount || 0), 0)

  const salesColumns = [
    { title: 'Sale Number', dataIndex: 'saleNumber', key: 'saleNumber' },
    { title: 'Dealer', dataIndex: 'dealerName', key: 'dealerName' },
    { title: 'Total', dataIndex: 'totalAmount', key: 'totalAmount', render: (val: number) => `$${(val || 0).toFixed(2)}` },
    { title: 'Date', dataIndex: 'saleDate', key: 'saleDate', render: (val: string) => val ? new Date(val).toLocaleDateString() : '' },
  ]

  const commissionColumns = [
    { title: 'Commission ID', dataIndex: 'id', key: 'id' },
    { title: 'Dealer', dataIndex: 'dealerName', key: 'dealerName' },
    { title: 'Amount', dataIndex: 'commissionAmount', key: 'commissionAmount', render: (val: number) => `$${(val || 0).toFixed(2)}` },
    { title: 'Status', dataIndex: 'paymentStatus', key: 'paymentStatus' },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Card title="Export Data" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label>Date Range (for Sales & Commissions): </label>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ marginLeft: 8 }}
            />
          </div>
          <Space wrap>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportSales}
              loading={loading}
            >
              Export Sales
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportCommissions}
              loading={loading}
            >
              Export Commissions
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportDealers}
              loading={loading}
            >
              Export Dealers
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportProducts}
              loading={loading}
            >
              Export Products
            </Button>
          </Space>
        </Space>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}><Statistic title="Total Sales" value={sales.length} /></Col>
          <Col span={8}><Statistic title="Sales Revenue" value={totalSales} precision={2} prefix="$" /></Col>
          <Col span={8}><Statistic title="Total Commissions" value={totalCommissions} precision={2} prefix="$" /></Col>
        </Row>
      </Card>

      <Card title="Recent Sales" style={{ marginBottom: 16 }}>
        <Table rowKey="id" dataSource={sales.slice(0, 50)} columns={salesColumns} pagination={{ pageSize: 10 }} />
      </Card>

      <Card title="Commissions">
        <Table rowKey="id" dataSource={commissions.slice(0, 50)} columns={commissionColumns} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  )
}

export default Reports

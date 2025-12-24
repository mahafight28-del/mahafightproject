import React, { useEffect, useMemo, useState } from 'react'
import { Table, Card, Button, Space, Tag, Popconfirm, message, DatePicker, Row, Col, Statistic } from 'antd'
import { DownloadOutlined, DollarOutlined } from '@ant-design/icons'
import { getCommissions, markCommissionPaid, exportCommissions } from '../../services/commissionService'
import { Commission } from '../../types/commission'

const { RangePicker } = DatePicker

const CommissionReport: React.FC = () => {
  const [items, setItems] = useState<Commission[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [dateRange, setDateRange] = useState<any>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getCommissions()
      setItems(data || [])
    } catch {
      message.error('Failed to load commissions')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filteredItems = useMemo(() => {
    if (!dateRange) return items
    const [start, end] = dateRange
    return items.filter(item => {
      const date = new Date(item.commissionDate || item.createdAt || '')
      return date >= start && date <= end
    })
  }, [items, dateRange])

  const totalsByDealer = useMemo(() => {
    const map: Record<string, { dealerId: string; dealerName: string; total: number; pending: number; paid: number; count: number }> = {}
    filteredItems.forEach(c => {
      const id = c.dealerId || 'Unknown'
      const name = (c as any).dealerName || id
      if (!map[id]) map[id] = { dealerId: id, dealerName: name, total: 0, pending: 0, paid: 0, count: 0 }
      const amount = c.commissionAmount || c.amount || 0
      map[id].total += amount
      map[id].count += 1
      if (c.paymentStatus === 'Paid') map[id].paid += amount
      else map[id].pending += amount
    })
    return Object.values(map)
  }, [filteredItems])

  const handleMarkPaid = async (id: string) => {
    try {
      await markCommissionPaid(id)
      message.success('Marked as paid')
      await load()
    } catch {
      message.error('Could not mark as paid')
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const fromDate = dateRange?.[0]?.format ? dateRange[0].format('YYYY-MM-DD') : undefined
      const toDate = dateRange?.[1]?.format ? dateRange[1].format('YYYY-MM-DD') : undefined
      const response = await exportCommissions(fromDate, toDate)
      
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `commission-report_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      
      message.success('Report exported successfully')
    } catch {
      message.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const tableColumns = [
    { title: 'Dealer', dataIndex: 'dealerName', key: 'dealerName' },
    { title: 'Sale Amount', dataIndex: 'saleAmount', key: 'saleAmount', render: (v:any) => v ? `$${v.toFixed(2)}` : '' },
    { title: 'Rate', dataIndex: 'commissionRate', key: 'commissionRate', render: (v:any) => v ? `${v}%` : '' },
    { title: 'Commission', dataIndex: 'commissionAmount', key: 'commissionAmount', render: (v:any) => v ? `$${v.toFixed(2)}` : '' },
    { title: 'Status', dataIndex: 'paymentStatus', key: 'paymentStatus', render: (s:any) => {
      const color = s === 'Paid' ? 'green' : 'orange'
      return <Tag color={color}>{s}</Tag>
    }},
    { title: 'Date', dataIndex: 'commissionDate', key: 'commissionDate', render: (v:any) => v ? new Date(v).toLocaleDateString() : '' },
    { title: 'Actions', key: 'actions', render: (_: any, rec: Commission) => (
      <Space>
        { rec.paymentStatus !== 'Paid' && (
          <Popconfirm title="Mark commission as paid?" onConfirm={() => handleMarkPaid(rec.id)}>
            <Button type="primary" size="small">Mark Paid</Button>
          </Popconfirm>
        )}
      </Space>
    )}
  ]

  const summaryColumns = [
    { title: 'Dealer', dataIndex: 'dealerName', key: 'dealerName' },
    { title: 'Count', dataIndex: 'count', key: 'count' },
    { title: 'Total', dataIndex: 'total', key: 'total', render: (v:any) => `$${v.toFixed(2)}` },
    { title: 'Pending', dataIndex: 'pending', key: 'pending', render: (v:any) => `$${v.toFixed(2)}` },
    { title: 'Paid', dataIndex: 'paid', key: 'paid', render: (v:any) => `$${v.toFixed(2)}` },
  ]

  const totalCommissions = filteredItems.reduce((sum, c) => sum + (c.commissionAmount || c.amount || 0), 0)
  const paidCommissions = filteredItems.filter(c => c.paymentStatus === 'Paid').reduce((sum, c) => sum + (c.commissionAmount || c.amount || 0), 0)
  const pendingCommissions = totalCommissions - paidCommissions

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
          <Col span={16}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="Total" value={totalCommissions} precision={2} prefix={<DollarOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic title="Paid" value={paidCommissions} precision={2} prefix={<DollarOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic title="Pending" value={pendingCommissions} precision={2} prefix={<DollarOutlined />} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Card 
        title="Dealer Commission Summary" 
        style={{ marginBottom: 16 }} 
        extra={
          <Button 
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exporting}
          >
            Export Report
          </Button>
        }
      >
        <Table 
          dataSource={totalsByDealer} 
          columns={summaryColumns} 
          rowKey="dealerId" 
          pagination={false} 
        />
      </Card>

      <Card title="Commission Details">
        <Table 
          dataSource={filteredItems} 
          columns={tableColumns} 
          rowKey="id" 
          loading={loading} 
        />
      </Card>
    </div>
  )
}

export default CommissionReport

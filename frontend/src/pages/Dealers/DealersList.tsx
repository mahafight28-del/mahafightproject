import React, { useEffect, useState } from 'react'
import { Table, Button, Card, Space, Tag, message } from 'antd'
import { DownloadOutlined, UserOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { getDealers } from '../../services/dealerService'
import { Dealer } from '../../types/dealer'
import api from '../../services/api'

const DealersList: React.FC = () => {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setLoading(true)
    getDealers()
      .then(setDealers)
      .finally(() => setLoading(false))
  }, [])

  const handleExport = async () => {
    setExporting(true)
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
      setExporting(false)
    }
  }

  const columns = [
    { title: 'Business Name', dataIndex: 'businessName', key: 'businessName', render: (val: string, rec: any) => val || rec.name },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Business Type', dataIndex: 'businessType', key: 'businessType' },
    { title: 'Status', key: 'status', render: (_: any, record: any) => {
      const isActive = record.isActive
      const color = isActive ? 'green' : 'red'
      const text = isActive ? 'Active' : 'Inactive'
      return <Tag color={color}>{text}</Tag>
    }},
    { title: 'KYC Status', key: 'kycStatus', render: (_: any, record: any) => {
      const s = record.kycStatus || record.status
      if (!s) return <span />
      const color = s === 'Approved' ? 'green' : s === 'Rejected' ? 'red' : 'orange'
      return <Tag color={color}>{s}</Tag>
    }},
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Dealer) => (
        <Space>
          <Link to={`/dealers/${record.id}`}>
            <Button type="link" icon={<UserOutlined />}>View</Button>
          </Link>
        </Space>
      ),
    },
  ]

  const activeCount = Array.isArray(dealers) ? dealers.filter(d => d.isActive).length : 0
  const pendingCount = Array.isArray(dealers) ? dealers.filter(d => (d as any).kycStatus === 'Pending').length : 0

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Card size="small">
          <div>Total: <strong>{dealers.length}</strong></div>
        </Card>
        <Card size="small">
          <div>Active: <strong>{activeCount}</strong></div>
        </Card>
        <Card size="small">
          <div>Pending KYC: <strong>{pendingCount}</strong></div>
        </Card>
      </div>
      
      <Card title="Dealers" extra={
        <Space>
          <Button 
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exporting}
          >
            Export CSV
          </Button>
          <Button type="primary">
            <Link to="/dealers/new">New Dealer</Link>
          </Button>
        </Space>
      }>
        <Table rowKey="id" dataSource={Array.isArray(dealers) ? dealers : []} columns={columns} loading={loading} />
      </Card>
    </div>
  )
}

export default DealersList

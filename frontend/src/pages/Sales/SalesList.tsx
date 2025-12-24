import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, message, Tag, Popconfirm } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { getSales } from '../../services/saleService'
import { updateSalePaymentStatus } from '../../services/dealerService'
import { Sale } from '../../types/sale'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const SalesList: React.FC = () => {
  const [items, setItems] = useState<Sale[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null)
  const { hasRole } = useAuth()

  const loadSales = async () => {
    setLoading(true)
    try {
      const data = await getSales()
      setItems(data)
    } catch {
      message.error('Failed to load sales')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSales()
  }, [])

  const updatePaymentStatus = async (saleId: string, status: string) => {
    try {
      console.log('Updating payment status:', saleId, status)
      await updateSalePaymentStatus(saleId, status)
      message.success(`Payment status updated to ${status}`)
      loadSales()
    } catch (error) {
      console.error('Payment status update error:', error)
      message.error('Failed to update payment status')
    }
  }

  const generateInvoice = async (saleId: string) => {
    setGeneratingInvoice(saleId)
    try {
      const response = await api.post('/invoices', { saleId }, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${saleId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      message.success('Invoice generated successfully')
    } catch {
      message.error('Failed to generate invoice')
    } finally {
      setGeneratingInvoice(null)
    }
  }

  const columns = [
    { title: 'Sale Number', dataIndex: 'saleNumber', key: 'saleNumber' },
    { title: 'Dealer', dataIndex: 'dealerName', key: 'dealerName' },
    { title: 'Total', dataIndex: 'totalAmount', key: 'totalAmount', render: (val: number) => val ? `$${val.toFixed(2)}` : '' },
    { title: 'Payment Status', dataIndex: 'paymentStatus', key: 'paymentStatus', render: (status: string) => (
      <Tag color={status === 'Paid' ? 'green' : 'orange'}>{status}</Tag>
    )},
    { title: 'Date', dataIndex: 'saleDate', key: 'saleDate', render: (val: string) => val ? new Date(val).toLocaleDateString() : '' },
    { title: 'Actions', key: 'actions', render: (_: any, rec: Sale) => (
      <Space>
        <Link to={`/sales/${rec.id}`}><Button type="link">View</Button></Link>
        <Button 
          type="primary" 
          icon={<FileTextOutlined />}
          loading={generatingInvoice === rec.id}
          onClick={() => generateInvoice(rec.id)}
        >
          Generate Invoice
        </Button>
        {hasRole('Admin') && (
          <>
            {rec.paymentStatus === 'Pending' && (
              <Popconfirm title="Mark as Paid?" onConfirm={() => updatePaymentStatus(rec.id, 'Paid')}>
                <Button type="primary" size="small">Mark Paid</Button>
              </Popconfirm>
            )}
            {rec.paymentStatus === 'Paid' && (
              <Popconfirm title="Mark as Pending?" onConfirm={() => updatePaymentStatus(rec.id, 'Pending')}>
                <Button size="small">Mark Pending</Button>
              </Popconfirm>
            )}
          </>
        )}
      </Space>
    )}
  ]

  return (
    <div style={{ padding: 24 }}>
      <Card title="Sales" extra={
        <Button type="primary">
          <Link to="/sales/new">New Sale</Link>
        </Button>
      }>
        <Table rowKey="id" dataSource={Array.isArray(items) ? items : []} columns={columns} loading={loading} />
      </Card>
    </div>
  )
}

export default SalesList

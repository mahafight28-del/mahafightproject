import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, Tag, message } from 'antd'
import { DownloadOutlined, FileTextOutlined, CheckOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { getInvoices, downloadInvoicePdf, updateInvoiceStatus } from '../../services/invoiceService'
import { Invoice } from '../../types/invoice'

const InvoicesList: React.FC = () => {
  const [items, setItems] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getInvoices().then(setItems).finally(() => setLoading(false))
  }, [])

  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await downloadInvoicePdf(invoiceId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice_${invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      message.success('Invoice downloaded successfully')
    } catch {
      message.error('Download failed')
    }
  }

  const handleMarkAsPaid = async (invoiceId: string, totalAmount: number) => {
    try {
      await updateInvoiceStatus(invoiceId, { status: 'Paid', paidAmount: totalAmount })
      message.success('Invoice marked as paid')
      // Refresh the list
      setLoading(true)
      getInvoices().then(setItems).finally(() => setLoading(false))
    } catch {
      message.error('Failed to update invoice status')
    }
  }

  const columns = [
    { title: 'Invoice #', dataIndex: 'invoiceNumber', key: 'invoiceNumber' },
    { title: 'Dealer', dataIndex: 'dealerName', key: 'dealerName' },
    { title: 'Total', dataIndex: 'totalAmount', key: 'totalAmount', render: (val: number) => val ? `$${val.toFixed(2)}` : '' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => {
      const color = status === 'Paid' ? 'green' : status === 'Overdue' ? 'red' : 'orange'
      return <Tag color={color}>{status}</Tag>
    }},
    { title: 'Date', dataIndex: 'invoiceDate', key: 'invoiceDate', render: (val: string) => val ? new Date(val).toLocaleDateString() : '' },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', render: (val: string) => val ? new Date(val).toLocaleDateString() : '' },
    { title: 'Actions', key: 'actions', render: (_: any, rec: Invoice) => (
      <Space>
        <Link to={`/invoices/${rec.id}`}><Button type="link" icon={<FileTextOutlined />}>View</Button></Link>
        <Button 
          type="link" 
          icon={<DownloadOutlined />}
          onClick={() => handleDownloadPdf(rec.id, rec.invoiceNumber || rec.id)}
        >
          PDF
        </Button>
        {rec.status === 'Pending' && (
          <Button 
            type="link" 
            icon={<CheckOutlined />}
            onClick={() => handleMarkAsPaid(rec.id, rec.totalAmount)}
          >
            Mark Paid
          </Button>
        )}
      </Space>
    )}
  ]

  return (
    <div style={{ padding: 24 }}>
      <Card title="Invoices">
        <Table rowKey="id" dataSource={items} columns={columns} loading={loading} />
      </Card>
    </div>
  )
}

export default InvoicesList
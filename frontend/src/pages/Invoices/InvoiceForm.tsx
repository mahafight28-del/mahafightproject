import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Input, Button, DatePicker, Select, message, Alert } from 'antd'
import { getSales } from '../../services/saleService'
import { createInvoice } from '../../services/invoiceService'

const InvoiceForm: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [sales, setSales] = useState<any[]>([])

  useEffect(() => {
    const loadSales = async () => {
      try {
        const salesData = await getSales()
        setSales(salesData || [])
      } catch {}
    }
    loadSales()
  }, [])

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      await createInvoice(values)
      message.success('Invoice created successfully')
      navigate('/invoices')
    } catch {
      message.error('Failed to create invoice')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ padding: 24 }}>
      <Card title="Create Invoice">
        <Alert 
          message="Note: Invoices are typically auto-generated from sales. This form is for manual invoice creation." 
          type="info" 
          style={{ marginBottom: 16 }}
        />
        
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="saleId" label="Sale" rules={[{ required: true }]}>
            <Select placeholder="Select a sale to invoice">
              {sales.map(s => (
                <Select.Option key={s.id} value={s.id}>
                  {s.saleNumber} - {s.dealerName} - ${s.totalAmount?.toFixed(2)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="paymentTerms" label="Payment Terms">
            <Select>
              <Select.Option value="Net 30">Net 30</Select.Option>
              <Select.Option value="Net 15">Net 15</Select.Option>
              <Select.Option value="Due on Receipt">Due on Receipt</Select.Option>
              <Select.Option value="Net 60">Net 60</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Invoice
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default InvoiceForm

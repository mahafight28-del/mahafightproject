import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Input, Button, Select, Switch, message } from 'antd'
import { createDealer, getDealer, updateDealer } from '../../services/dealerService'
import { Dealer } from '../../types/dealer'

const DealerForm: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getDealer(id).then((d: Dealer) => form.setFieldsValue(d)).finally(() => setLoading(false))
  }, [id])

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      if (id) {
        await updateDealer(id, values)
        message.success('Dealer updated successfully')
      } else {
        await createDealer(values)
        message.success('Dealer created successfully')
      }
      navigate('/dealers')
    } catch {
      message.error('Save failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ padding: 24 }}>
      <Card title={id ? 'Edit Dealer' : 'New Dealer'}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isActive: true }}>
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="businessName" label="Business Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="businessType" label="Business Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Individual">Individual</Select.Option>
              <Select.Option value="Partnership">Partnership</Select.Option>
              <Select.Option value="Corporation">Corporation</Select.Option>
              <Select.Option value="LLC">LLC</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="registrationNumber" label="Registration Number">
            <Input />
          </Form.Item>
          <Form.Item name="taxId" label="Tax ID">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="city" label="City" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="state" label="State" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="postalCode" label="Postal Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {id ? 'Update Dealer' : 'Create Dealer'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default DealerForm

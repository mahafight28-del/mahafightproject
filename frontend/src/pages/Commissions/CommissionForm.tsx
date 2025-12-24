import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Input, Button, InputNumber } from 'antd'
import { createCommission, getCommission, updateCommission } from '../../services/commissionService'
import { Commission } from '../../types/commission'

const CommissionForm: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getCommission(id).then((c: Commission) => form.setFieldsValue(c)).finally(() => setLoading(false))
  }, [id])

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      if (id) await updateCommission(id, values)
      else await createCommission(values)
      navigate('/commissions')
    } catch {
      alert('Save failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ padding: 24 }}>
      <Card title={id ? 'Edit Commission' : 'New Commission'}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ amount: 0, rate: 0 }}>
          <Form.Item name="dealerId" label="Dealer ID">
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="Amount">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="rate" label="Rate">
            <InputNumber style={{ width: '100%' }} min={0} max={100} />
          </Form.Item>
          <Form.Item name="period" label="Period">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>{id ? 'Update' : 'Create'}</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default CommissionForm

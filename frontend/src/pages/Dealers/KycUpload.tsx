import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Upload, message, Tag, Alert, Timeline, Image } from 'antd'
import { UploadOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { RcFile, UploadFile } from 'antd/es/upload/interface'
import { uploadKycDocument, getDealerKycStatus } from '../../services/dealerService'
import { useAuth } from '../../context/AuthContext'

const { TextArea } = Input

type KycDocument = {
  id: string
  documentType: string
  documentNumber: string
  documentUrl?: string
  verificationStatus: string
  verifiedAt?: string
  notes?: string
}

const KycUpload: React.FC = () => {
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<KycDocument[]>([])
  const [kycStatus, setKycStatus] = useState<string>('Not Submitted')
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const loadKycStatus = async () => {
    if (!user?.id) return
    
    try {
      const docs = await getDealerKycStatus(user.id)
      setDocuments(Array.isArray(docs) ? docs : [])
      
      // Determine overall KYC status
      if (docs.length === 0) {
        setKycStatus('Not Submitted')
      } else if (docs.some((d: KycDocument) => d.verificationStatus === 'APPROVED')) {
        setKycStatus('Approved')
      } else if (docs.some((d: KycDocument) => d.verificationStatus === 'REJECTED')) {
        setKycStatus('Rejected')
      } else {
        setKycStatus('Pending')
      }
    } catch {
      setKycStatus('Not Submitted')
    }
  }

  useEffect(() => {
    loadKycStatus()
  }, [user?.id])

  const beforeUpload = (file: RcFile) => {
    const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf'
    if (!isValidType) {
      message.error('You can only upload image or PDF files')
      return false
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('File must be smaller than 5MB')
      return false
    }
    
    return false // Prevent auto upload
  }

  const handleUploadChange = ({ fileList: next }: { fileList: UploadFile[] }) => {
    setFileList(next)
  }

  const onFinish = async (values: any) => {
    if (!user?.id) {
      message.error('User not found')
      return
    }

    if (fileList.length === 0) {
      message.error('Please select a file to upload')
      return
    }

    setLoading(true)
    try {
      const file = fileList[0].originFileObj as File
      await uploadKycDocument(user.id, values.documentType, values.documentNumber, file)
      
      message.success('Document uploaded successfully')
      form.resetFields()
      setFileList([])
      loadKycStatus()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'REJECTED': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'PENDING': return <ClockCircleOutlined style={{ color: '#faad14' }} />
      default: return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'green'
      case 'REJECTED': return 'red'
      case 'PENDING': return 'orange'
      default: return 'default'
    }
  }

  const getStatusMessage = () => {
    switch (kycStatus) {
      case 'Approved':
        return { type: 'success' as const, message: 'Your KYC is approved! You can now access all business features.' }
      case 'Rejected':
        return { type: 'error' as const, message: 'Your KYC has been rejected. Please re-upload correct documents.' }
      case 'Pending':
        return { type: 'warning' as const, message: 'Your KYC is under review. Business features are temporarily locked.' }
      default:
        return { type: 'info' as const, message: 'Please upload your KYC documents to access business features.' }
    }
  }

  const statusMessage = getStatusMessage()

  return (
    <div style={{ padding: 24 }}>
      <Card title="KYC Document Management">
        <Alert
          message={`KYC Status: ${kycStatus}`}
          description={statusMessage.message}
          type={statusMessage.type}
          showIcon
          style={{ marginBottom: 24 }}
        />

        {kycStatus !== 'Approved' && (
          <Card title="Upload Documents" style={{ marginBottom: 24 }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item 
                name="documentType" 
                label="Document Type" 
                rules={[{ required: true, message: 'Please select document type' }]}
              >
                <Input placeholder="e.g., PAN, Aadhaar, GST Certificate" />
              </Form.Item>

              <Form.Item 
                name="documentNumber" 
                label="Document Number" 
                rules={[{ required: true, message: 'Please enter document number' }]}
              >
                <Input placeholder="Enter document number" />
              </Form.Item>

              <Form.Item label="Upload Document" required>
                <Upload
                  beforeUpload={beforeUpload}
                  fileList={fileList}
                  onChange={handleUploadChange}
                  maxCount={1}
                  accept="image/*,.pdf"
                >
                  <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
                <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
                  Supported formats: Images (JPG, PNG) and PDF. Max size: 5MB
                </div>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Upload Document
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}

        <Card title="Uploaded Documents">
          {documents.length > 0 ? (
            <Timeline>
              {documents.map(doc => (
                <Timeline.Item key={doc.id} dot={getStatusIcon(doc.verificationStatus)}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <strong>{doc.documentType}:</strong>
                      <span>{doc.documentNumber}</span>
                      <Tag color={getStatusColor(doc.verificationStatus)}>
                        {doc.verificationStatus}
                      </Tag>
                    </div>
                    
                    {doc.verifiedAt && (
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                        Reviewed on: {new Date(doc.verifiedAt).toLocaleDateString()}
                      </div>
                    )}
                    
                    {doc.notes && (
                      <div style={{ marginBottom: 8 }}>
                        <strong>Admin Notes:</strong>
                        <TextArea value={doc.notes} readOnly rows={2} />
                      </div>
                    )}
                    
                    {doc.documentUrl && (
                      <div>
                        <Image
                          width={200}
                          src={`${import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads/${doc.documentUrl.replace(/\\/g, '/')}`}
                          placeholder="Document preview"
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                        />
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
              No documents uploaded yet
            </div>
          )}
        </Card>
      </Card>
    </div>
  )
}

export default KycUpload
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Input, Button, InputNumber, Select, message, Upload, Image } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import { createProduct, getProduct, updateProduct, uploadProductImage, deleteProductImage } from '../../services/productService'
import { Product } from '../../types/product'

const ProductForm: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [tempProductId, setTempProductId] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getProduct(id).then((p: Product) => {
      console.log('Product data:', p)
      form.setFieldsValue(p)
      setImages(p.images || [])
      console.log('Images loaded:', p.images)
    }).finally(() => setLoading(false))
  }, [id])

  const handleImageUpload = async (file: File) => {
    const currentProductId = id || tempProductId
    if (!currentProductId) {
      message.error('Please save the product first before uploading images')
      return false
    }
    
    setUploading(true)
    try {
      const imageData = await uploadProductImage(currentProductId, file)
      setImages(prev => [...prev, imageData])
      message.success('Image uploaded successfully')
    } catch {
      message.error('Image upload failed')
    } finally {
      setUploading(false)
    }
    return false
  }

  const handleImageDelete = async (imageId: string) => {
    if (!id) return
    
    try {
      await deleteProductImage(id, imageId)
      setImages(prev => prev.filter(img => img.id !== imageId))
      message.success('Image deleted successfully')
    } catch {
      message.error('Image delete failed')
    }
  }

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      if (id) {
        // Update existing product
        const updateData = { ...values, id }
        await updateProduct(id, updateData)
        message.success('Product updated successfully')
        navigate('/products')
      } else {
        // Create new product
        const response = await createProduct(values)
        const newProductId = response.data.id
        setTempProductId(newProductId)
        message.success('Product created successfully! You can now upload images.')
        // Don't navigate away, stay on form to allow image upload
      }
    } catch {
      message.error('Save failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ padding: 24 }}>
      <Card title={id ? 'Edit Product' : 'New Product'}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Equipment">Equipment</Select.Option>
              <Select.Option value="Apparel">Apparel</Select.Option>
              <Select.Option value="Accessories">Accessories</Select.Option>
              <Select.Option value="Training">Training</Select.Option>
              <Select.Option value="Nutrition">Nutrition</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="brand" label="Brand" rules={[{ required: true }]}>
            <Input placeholder="Enter brand name" />
          </Form.Item>
          <Form.Item name="unitPrice" label="Unit Price" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} prefix="$" />
          </Form.Item>
          <Form.Item name="costPrice" label="Cost Price" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} prefix="$" />
          </Form.Item>
          <Form.Item name="stockQuantity" label="Stock Quantity" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="minStockLevel" label="Minimum Stock Level">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="weight" label="Weight (kg)">
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="dimensions" label="Dimensions">
            <Input placeholder="L x W x H" />
          </Form.Item>
          
          <Form.Item label="Product Images">
            <div style={{ marginBottom: 16 }}>
              <Upload
                beforeUpload={handleImageUpload}
                showUploadList={false}
                accept="image/*"
                disabled={uploading || (!id && !tempProductId)}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {!id && !tempProductId ? 'Save product first to upload images' : 'Upload Image'}
                </Button>
              </Upload>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {images.map((image: any) => {
                // Use Cloudinary URL directly
                const imageUrl = image.url
                console.log('Cloudinary image URL:', imageUrl)
                return (
                  <div key={image.id} style={{ position: 'relative' }}>
                    <Image
                      width={100}
                      height={100}
                      src={imageUrl}
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                      onError={(e) => console.error('Image load error:', imageUrl, e)}
                    />
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleImageDelete(image.id)}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          background: 'rgba(255,255,255,0.8)'
                        }}
                      />
                      {image.isDefault && (
                        <div style={{
                          position: 'absolute',
                          bottom: 4,
                          left: 4,
                          background: '#52c41a',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 10
                        }}>
                          Default
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {id ? 'Update Product' : 'Create Product'}
            </Button>
            {tempProductId && (
              <Button 
                style={{ marginLeft: 8 }}
                onClick={() => navigate('/products')}
              >
                Done & Go Back
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default ProductForm

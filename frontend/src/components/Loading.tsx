import React from 'react'
import { Spin } from 'antd'

const Loading: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
    <Spin size="large" />
  </div>
)

export default Loading

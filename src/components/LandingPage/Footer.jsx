import { Layout, Typography, Space, Divider } from "antd"
import { BookOutlined, HeartOutlined, StarOutlined } from "@ant-design/icons"

const { Footer: AntFooter } = Layout
const { Text, Link, Title } = Typography

export default function Footer() {
  return (
    <AntFooter 
      className="mt-12 text-center shadow-lg"
      style={{ 
        background: 'linear-gradient(135deg, #fb923c 0%, #fbbf24 100%)',
        borderTop: '3px solid #ffd700',
        color: 'white'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Logo and Description */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow-lg"
              style={{ background: 'linear-gradient(45deg, #ffd700, #ffed4e)' }}
            >
              <BookOutlined className="text-2xl" style={{ color: '#fb923c' }} />
            </div>
            <Title 
              level={3} 
              className="m-0 text-white"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
            >
              EduSephia
            </Title>
          </div>
          <Text 
            className="text-lg block mb-4"
            style={{ 
              color: '#fff8dc',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            Hệ thống học tập dành cho học sinh - Nơi kết nối tri thức và tương lai
          </Text>
        </div>

        <Divider 
          style={{ 
            borderColor: '#ffd700',
            borderWidth: '2px',
            margin: '24px 0'
          }}
        />

        {/* Links */}
        <Space size="large" className="mb-6">
          <Link 
            href="#" 
            style={{ 
              color: '#fff8dc',
              fontSize: '16px',
              fontWeight: '500',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
            className="hover:text-yellow-200 transition-colors"
          >
            Chính sách bảo mật
          </Link>
          <Link 
            href="#" 
            style={{ 
              color: '#fff8dc',
              fontSize: '16px',
              fontWeight: '500',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
            className="hover:text-yellow-200 transition-colors"
          >
            FAQ
          </Link>
          <Link 
            href="#" 
            style={{ 
              color: '#fff8dc',
              fontSize: '16px',
              fontWeight: '500',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
            className="hover:text-yellow-200 transition-colors"
          >
            Liên hệ
          </Link>
        </Space>

        {/* Copyright */}
        <div className="mt-6">
          <Text 
            className="text-base"
            style={{ 
              color: '#fff8dc',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            © 2025 Hệ thống học tập dành cho học sinh. Tất cả quyền được bảo lưu.
          </Text>
        </div>

        {/* Decorative Icons */}
        <div className="mt-6 flex justify-center space-x-4">
          <HeartOutlined 
            className="text-2xl" 
            style={{ color: '#ffd700' }}
          />
          <StarOutlined 
            className="text-2xl" 
            style={{ color: '#ffd700' }}
          />
          <BookOutlined 
            className="text-2xl" 
            style={{ color: '#ffd700' }}
          />
        </div>
      </div>
    </AntFooter>
  )
}

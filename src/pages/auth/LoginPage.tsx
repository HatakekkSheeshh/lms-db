import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthProvider'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/lib/api/authService'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import '@/lib/animations/gsap-setup'

export default function LoginPage() {
  const [universityId, setUniversityId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.children, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      })
    }
  }, { scope: containerRef })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authService.login(universityId, password)
      if (result.success && result.user && result.role) {
        login(result.user, result.role)
        
        // Navigate based on role
        if (result.role === 'student') {
          navigate(ROUTES.STUDENT_DASHBOARD)
        } else if (result.role === 'tutor') {
          navigate(ROUTES.TUTOR_DASHBOARD)
        } else if (result.role === 'admin') {
          navigate(ROUTES.ADMIN_DASHBOARD)
        }
      } else {
        setError(result.error || 'Đăng nhập thất bại')
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f0f0f] px-4">
      <div ref={containerRef} className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/HCMCUT.png" 
              alt="HCMUT Logo" 
              className="w-[60px] h-[60px] object-contain"
            />
            <span className="text-4xl font-semibold text-[#211c37] dark:text-white">LMS</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#211c37] dark:text-white mb-2">Chào mừng trở lại!</h1>
          <p className="text-[#85878d] dark:text-gray-400 text-sm font-medium">Đăng nhập vào hệ thống LMS</p>
        </div>
        
        <Card className="border border-[#e5e7e7] dark:border-[#333] bg-white dark:bg-[#1a1a1a] rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="universityId" className="block text-sm font-medium text-[#211c37] dark:text-white">
                Mã số sinh viên/Giảng viên
              </label>
              <Input
                id="universityId"
                type="text"
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                className="w-full border-[#e7eae9] dark:border-[#333] bg-white dark:bg-[#0f0f0f] text-[#211c37] dark:text-white rounded-xl h-12"
                placeholder="Nhập mã số"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[#211c37] dark:text-white">
                Mật khẩu
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-[#e7eae9] dark:border-[#333] bg-white dark:bg-[#0f0f0f] text-[#211c37] dark:text-white rounded-xl h-12"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors h-12 font-medium"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}


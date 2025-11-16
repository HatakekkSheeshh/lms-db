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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import '@/lib/animations/gsap-setup'

export default function LoginPage() {
  const [universityId, setUniversityId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [neoBrutalismMode, setNeoBrutalismMode] = useState(false)
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
    <div className={cn(
      "min-h-screen flex items-center justify-center px-4 relative",
      neoBrutalismMode 
        ? "bg-[#FFFBEB] dark:bg-[#1a1a1a] neo-brutalism-bg"
        : "bg-white dark:bg-black"
    )}>
      {/* Theme Toggle - Góc trên phải */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        <Label htmlFor="theme-toggle" className={cn(
          "text-sm font-medium cursor-pointer",
          neoBrutalismMode ? "text-[#1a1a1a] dark:text-[#FFFBEB] font-bold" : "text-[#676767] dark:text-gray-400"
        )}>
          Normal
        </Label>
        <Switch
          id="theme-toggle"
          checked={neoBrutalismMode}
          onCheckedChange={setNeoBrutalismMode}
          className={cn(
            neoBrutalismMode && "data-[state=checked]:bg-[#1a1a1a] dark:data-[state=checked]:bg-[#FFFBEB]"
          )}
        />
        <Label htmlFor="theme-toggle" className={cn(
          "text-sm font-medium cursor-pointer",
          neoBrutalismMode ? "text-[#1a1a1a] dark:text-[#FFFBEB] font-bold" : "text-[#676767] dark:text-gray-400"
        )}>
          Neo-Brutalism
        </Label>
      </div>

      <div ref={containerRef} className="w-full max-w-md space-y-8">

        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={cn(
              neoBrutalismMode 
                ? "neo-brutalism-logo-container"
                : "p-2 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-200 dark:border-[#333]"
            )}>
              <img 
                src="/HCMCUT.png" 
                alt="HCMUT Logo" 
                className="w-[60px] h-[60px] object-contain"
              />
            </div>
            <span className={cn(
              "text-4xl font-bold",
              neoBrutalismMode 
                ? "text-[#1a1a1a] dark:text-[#FFFBEB] neo-brutalism-text"
                : "text-[#211c37] dark:text-white"
            )}>LMS</span>
          </div>
          <h1 className={cn(
            "text-3xl font-bold mb-2",
            neoBrutalismMode 
              ? "text-[#1a1a1a] dark:text-[#FFFBEB] neo-brutalism-text"
              : "text-[#211c37] dark:text-white"
          )}>Chào mừng trở lại!</h1>
          <p className={cn(
            "text-base font-semibold opacity-80",
            neoBrutalismMode 
              ? "text-[#1a1a1a] dark:text-[#FFFBEB]"
              : "text-[#676767] dark:text-gray-400"
          )}>Đăng nhập vào hệ thống LMS</p>
        </div>
        
        <Card className={cn(
          "p-8",
          neoBrutalismMode
            ? "neo-brutalism-card border-4 border-[#1a1a1a] dark:border-[#FFFBEB] bg-white dark:bg-[#2a2a2a] rounded-none shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,251,235,1)]"
            : "border border-[#e5e7e7] dark:border-[#333] bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl"
        )}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={cn(
                "bg-red-500 dark:bg-red-600 text-white px-4 py-3 text-sm font-semibold",
                neoBrutalismMode
                  ? "neo-brutalism-error border-4 border-[#1a1a1a] dark:border-[#FFFBEB] rounded-none shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,251,235,1)]"
                  : "rounded-lg border border-red-600 dark:border-red-700"
              )}>
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="universityId" className={cn(
                "block text-sm font-medium",
                neoBrutalismMode
                  ? "font-bold text-[#1a1a1a] dark:text-[#FFFBEB]"
                  : "text-[#211c37] dark:text-white"
              )}>
                Mã số sinh viên/Giảng viên
              </label>
              <Input
                id="universityId"
                type="text"
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                className={cn(
                  "w-full h-14 transition-all",
                  neoBrutalismMode
                    ? "neo-brutalism-input border-4 border-[#1a1a1a] dark:border-[#FFFBEB] bg-white dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-[#FFFBEB] rounded-none font-semibold focus:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,251,235,1)]"
                    : "border-[#e5e7e7] dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-[#211c37] dark:text-white rounded-xl focus:ring-2 focus:ring-[#3bafa8]"
                )}
                placeholder="Nhập mã số"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className={cn(
                "block text-sm font-medium",
                neoBrutalismMode
                  ? "font-bold text-[#1a1a1a] dark:text-[#FFFBEB]"
                  : "text-[#211c37] dark:text-white"
              )}>
                Mật khẩu
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full h-14 transition-all",
                  neoBrutalismMode
                    ? "neo-brutalism-input border-4 border-[#1a1a1a] dark:border-[#FFFBEB] bg-white dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-[#FFFBEB] rounded-none font-semibold focus:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,251,235,1)]"
                    : "border-[#e5e7e7] dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-[#211c37] dark:text-white rounded-xl focus:ring-2 focus:ring-[#3bafa8]"
                )}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-14 font-bold text-base transition-all",
                neoBrutalismMode
                  ? "neo-brutalism-button bg-[#1a1a1a] dark:bg-[#FFFBEB] text-white dark:text-[#1a1a1a] rounded-none border-4 border-[#1a1a1a] dark:border-[#FFFBEB] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,251,235,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,251,235,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                  : "bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}


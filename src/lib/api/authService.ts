import type { User, UserRole } from '@/types'
import { mockUsers } from '@/data/mock/users'

interface LoginResult {
  success: boolean
  user?: User
  role?: UserRole
  error?: string
}

// Mock delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const authService = {
  async login(universityId: string, password: string): Promise<LoginResult> {
    await delay(800) // Simulate API delay

    const userId = parseInt(universityId)
    if (isNaN(userId)) {
      return {
        success: false,
        error: 'Mã số không hợp lệ',
      }
    }

    // Find user in mock data
    const user = mockUsers.find(u => u.University_ID === userId)
    
    if (!user) {
      return {
        success: false,
        error: 'Người dùng không tồn tại',
      }
    }

    // Simple password check (in real app, this would be hashed)
    // For demo, accept any password
    if (!password) {
      return {
        success: false,
        error: 'Vui lòng nhập mật khẩu',
      }
    }

    // Determine role based on University_ID pattern or mock data
    // For demo: IDs starting with 1 = student, 2 = tutor, 3 = admin
    let role: UserRole = 'student'
    const firstDigit = Math.floor(userId / 100000)
    
    if (firstDigit === 2) {
      role = 'tutor'
    } else if (firstDigit === 3 || userId >= 3000000) {
      role = 'admin'
    }

    return {
      success: true,
      user: {
        ...user,
        role,
      },
      role,
    }
  },

  async logout(): Promise<void> {
    await delay(300)
    // In real app, this would call API to invalidate token
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(500)
    // In real app, this would fetch from API
    return null
  },
}


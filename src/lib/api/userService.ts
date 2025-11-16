import { mockUsers } from '@/data/mock/users'
import type { User, UserRole } from '@/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Determine user role based on University_ID
const getUserRole = (universityId: number): UserRole => {
  const firstDigit = Math.floor(universityId / 100000)
  if (firstDigit === 2) return 'tutor'
  if (firstDigit === 3 || universityId >= 3000000) return 'admin'
  return 'student'
}

export const userService = {
  async getAllUsers(): Promise<User[]> {
    await delay(500)
    return mockUsers.map(user => ({
      ...user,
      role: getUserRole(user.University_ID),
    }))
  },

  async getUserById(universityId: number): Promise<User | null> {
    await delay(300)
    const user = mockUsers.find(u => u.University_ID === universityId)
    if (!user) return null
    
    return {
      ...user,
      role: getUserRole(user.University_ID),
    }
  },

  async getUsersByRole(role: UserRole): Promise<User[]> {
    await delay(400)
    return mockUsers
      .filter(user => getUserRole(user.University_ID) === role)
      .map(user => ({
        ...user,
        role: getUserRole(user.University_ID),
      }))
  },

  async createUser(user: Omit<User, 'role'>): Promise<User> {
    await delay(500)
    // In real app, this would create user in database
    const newUser: User = {
      ...user,
      role: getUserRole(user.University_ID),
    }
    mockUsers.push(newUser)
    return newUser
  },

  async updateUser(universityId: number, updates: Partial<Omit<User, 'University_ID' | 'role'>>): Promise<User> {
    await delay(400)
    const index = mockUsers.findIndex(u => u.University_ID === universityId)
    if (index === -1) {
      throw new Error('User not found')
    }
    
    mockUsers[index] = {
      ...mockUsers[index],
      ...updates,
    }
    
    return {
      ...mockUsers[index],
      role: getUserRole(universityId),
    }
  },

  async deleteUser(universityId: number): Promise<void> {
    await delay(400)
    const index = mockUsers.findIndex(u => u.University_ID === universityId)
    if (index === -1) {
      throw new Error('User not found')
    }
    mockUsers.splice(index, 1)
  },
}


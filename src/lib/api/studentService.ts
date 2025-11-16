import type { User } from '@/types'
import { mockUsers } from '@/data/mock/users'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const studentService = {
  async getStudentsByCourse(_courseId: number): Promise<User[]> {
    await delay(300)
    // Mock: Return students enrolled in the course
    // In real app, this would query the Assessment or Registration table
    return mockUsers.filter(u => {
      // Students have University_ID starting with 1
      const firstDigit = Math.floor(u.University_ID / 100000)
      return firstDigit === 1
    })
  },
}


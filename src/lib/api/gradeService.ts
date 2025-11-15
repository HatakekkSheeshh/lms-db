import type { Assessment } from '@/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const gradeService = {
  async getGrades(userId: number): Promise<Assessment[]> {
    await delay(500)
    // Mock grades data
    return [
      {
        University_ID: userId,
        Section_ID: 1,
        Course_ID: 1,
        Assessment_ID: 1,
        Grade: 8.5,
        Registration_Date: '2024-09-01',
        Status: 'Approved',
      },
      {
        University_ID: userId,
        Section_ID: 1,
        Course_ID: 1,
        Assessment_ID: 2,
        Grade: 9.0,
        Registration_Date: '2024-09-01',
        Status: 'Approved',
      },
    ]
  },

  async getGradeByCourse(userId: number, courseId: number): Promise<Assessment[]> {
    await delay(300)
    const allGrades = await this.getGrades(userId)
    return allGrades.filter(g => g.Course_ID === courseId)
  },
}


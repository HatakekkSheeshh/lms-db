import type { Quiz } from '@/types'
import { mockQuizzes } from '@/data/mock/quizzes'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const quizService = {
  async getQuizzes(userId: number): Promise<Quiz[]> {
    await delay(500)
    return mockQuizzes.filter(q => q.University_ID === userId)
  },

  async getQuizById(quizId: number): Promise<Quiz | null> {
    await delay(300)
    return mockQuizzes.find(q => q.Assessment_ID === quizId) || null
  },

  async getQuizzesByCourse(userId: number, courseId: number): Promise<Quiz[]> {
    await delay(300)
    return mockQuizzes.filter(q => q.University_ID === userId && q.Course_ID === courseId)
  },

  async submitQuiz(
    quizId: number,
    _answers: Record<string, string>
  ): Promise<{ success: boolean; score?: number; error?: string }> {
    await delay(1000)
    
    const quiz = mockQuizzes.find(q => q.Assessment_ID === quizId)
    if (!quiz) {
      return { success: false, error: 'Quiz not found' }
    }

    // Simple scoring (in real app, this would be more complex)
    const score = Math.random() * 10 // Mock score

    return {
      success: true,
      score: parseFloat(score.toFixed(2)),
    }
  },
}


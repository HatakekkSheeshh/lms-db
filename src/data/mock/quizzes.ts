import type { Quiz } from '@/types'

export const mockQuizzes: Quiz[] = [
  {
    University_ID: 100001,
    Section_ID: 1,
    Course_ID: 1,
    Assessment_ID: 3,
    Grading_method: 'Highest Attemp',
    pass_score: 5,
    Time_limits: '01:00:00',
    Start_Date: '2024-12-01T00:00:00',
    End_Date: '2024-12-10T23:59:59',
    completion_status: 'Not Taken',
    score: 0,
    content: 'Quiz về SQL và Database Design',
    types: 'Multiple Choice',
    Weight: 0.3,
    Correct_answer: 'A',
  },
]


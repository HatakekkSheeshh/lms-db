import type { Assignment, Submission } from '@/types'
import { mockAssignments } from '@/data/mock/assignments'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const assignmentService = {
  async getAssignments(userId: number): Promise<Assignment[]> {
    await delay(500)
    return mockAssignments.filter(a => a.University_ID === userId)
  },

  async getAssignmentById(assignmentId: number): Promise<Assignment | null> {
    await delay(300)
    return mockAssignments.find(a => a.Assessment_ID === assignmentId) || null
  },

  async submitAssignment(
    assignmentId: number,
    file: File
  ): Promise<{ success: boolean; submission?: Submission; error?: string }> {
    await delay(1000)
    
    const assignment = mockAssignments.find(a => a.Assessment_ID === assignmentId)
    if (!assignment) {
      return { success: false, error: 'Assignment not found' }
    }

    const now = new Date()
    const deadline = new Date(assignment.submission_deadline)
    const isLate = now > deadline

    const submission: Submission = {
      Submission_No: Math.floor(Math.random() * 10000),
      University_ID: assignment.University_ID,
      Section_ID: assignment.Section_ID,
      Course_ID: assignment.Course_ID,
      Assessment_ID: assignment.Assessment_ID,
      accepted_specification: assignment.accepted_specification,
      late_flag_indicator: isLate,
      SubmitDate: now.toISOString(),
      attached_files: file.name,
      status: 'Submitted',
    }

    return { success: true, submission }
  },
}


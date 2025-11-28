import type { Assignment, Submission } from '@/types'
import apiClient from './client'

export const assignmentService = {
  async getAssignments(userId: number): Promise<Assignment[]> {
    const response = await apiClient.get(`/assignments/user/${userId}`)
    return response.data
  },

  async getAssignmentById(assignmentId: number, universityId?: number, sectionId?: string, courseId?: string): Promise<Assignment | null> {
    try {
      const params: any = {}
      if (universityId) params.university_id = universityId
      if (sectionId) params.section_id = sectionId
      if (courseId) params.course_id = courseId
      
      const response = await apiClient.get(`/assignments/${assignmentId}`, { params })
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  async submitAssignment(
    assignmentId: number,
    file: File,
    userId: number
  ): Promise<{ success: boolean; submission?: Submission; error?: string }> {
    try {
      const response = await apiClient.post(`/assignments/${assignmentId}/submit`, {
        userId,
        fileName: file.name,
      })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit assignment',
      }
    }
  },
}


import apiClient from './client'

export interface ScheduleItem {
  Section_ID: string | number
  Course_ID: string | number
  Course_Name: string
  Day: string
  Time: string
  Room: string
  Building: string
  Semester?: string
}

export const scheduleService = {
  async getSchedule(userId: number): Promise<ScheduleItem[]> {
    const response = await apiClient.get(`/schedule/user/${userId}`)
    return response.data
  },
}


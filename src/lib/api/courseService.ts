import type { Course, Section } from '@/types'
import { mockCourses } from '@/data/mock/courses'
import { mockSections } from '@/data/mock/sections'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const courseService = {
  async getCourses(): Promise<Course[]> {
    await delay(500)
    return mockCourses
  },

  async getCourseById(courseId: number): Promise<Course | null> {
    await delay(300)
    return mockCourses.find(c => c.Course_ID === courseId) || null
  },

  async getSectionsByCourse(courseId: number): Promise<Section[]> {
    await delay(300)
    return mockSections.filter(s => s.Course_ID === courseId)
  },

  async getSectionById(sectionId: number, courseId: number): Promise<Section | null> {
    await delay(300)
    return mockSections.find(s => s.Section_ID === sectionId && s.Course_ID === courseId) || null
  },
}


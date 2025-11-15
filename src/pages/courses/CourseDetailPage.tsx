import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { courseService } from '@/lib/api/courseService'
import type { Course, Section } from '@/types'
import { ROUTES } from '@/constants/routes'
import { ArrowLeft, BookOpen, Users, Award, Calendar } from 'lucide-react'

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!courseId) return
      
      try {
        const [courseData, sectionsData] = await Promise.all([
          courseService.getCourseById(parseInt(courseId)),
          courseService.getSectionsByCourse(parseInt(courseId)),
        ])
        
        setCourse(courseData)
        setSections(sectionsData)
      } catch (error) {
        console.error('Error loading course:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [courseId])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-[#85878d]">Course not found</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title={course.Course_Name || course.Name}
      subtitle={`Course ID: ${course.Course_ID}`}
    >
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.COURSES)}
          className="mb-4 border border-[#e5e7e7] hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>

        <Card className="border border-[#e5e7e7] rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-[#e1e2f6] rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-[#1f1d39]">{course.Course_Name || course.Name}</CardTitle>
                <CardDescription className="text-[#85878d]">Course ID: {course.Course_ID}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-4 bg-[#f5f7f9] rounded-lg">
                <Award className="h-5 w-5 text-[#85878d]" />
                <div>
                  <p className="text-sm font-medium text-[#676767] mb-1">Credits</p>
                  <p className="text-lg font-semibold text-[#1f1d39]">{course.Credit} credits</p>
                </div>
              </div>
              {course.Start_Date && (
                <div className="flex items-center gap-3 p-4 bg-[#f5f7f9] rounded-lg">
                  <Calendar className="h-5 w-5 text-[#85878d]" />
                  <div>
                    <p className="text-sm font-medium text-[#676767] mb-1">Start Date</p>
                    <p className="text-lg font-semibold text-[#1f1d39]">{new Date(course.Start_Date).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#e5e7e7] rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f8efe2] rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-[#1f1d39]">Sections</CardTitle>
                <CardDescription className="text-[#85878d]">List of sections for this course</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sections.length > 0 ? (
              <div className="space-y-3">
                {sections.map((section) => (
                  <div
                    key={section.Section_ID}
                    className="flex items-center justify-between p-4 border border-[#e5e7e7] rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(ROUTES.SECTION_DETAIL
                      .replace(':courseId', courseId!)
                      .replace(':sectionId', section.Section_ID.toString())
                    )}
                  >
                    <div>
                      <p className="font-semibold text-[#1f1d39]">Section {section.Section_ID}</p>
                      <p className="text-sm text-[#85878d]">Semester: {section.Semester}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="border border-[#e5e7e7]">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#85878d] text-center py-4">No sections available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { gradeService } from '@/lib/api/gradeService'
import { courseService } from '@/lib/api/courseService'
import type { Assessment, Course } from '@/types'
import { ROUTES } from '@/constants/routes'
import { ArrowLeft, BarChart3, Calendar, CheckCircle2, XCircle } from 'lucide-react'

export default function GradeDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [grades, setGrades] = useState<Assessment[]>([])
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!courseId) return
      
      try {
        const courseData = await courseService.getCourseById(parseInt(courseId))
        setCourse(courseData)
        
        // In real app, get grades for this course
        // For now, use mock data
        const allGrades = await gradeService.getGrades(100001) // Mock user ID
        const courseGrades = allGrades.filter(g => g.Course_ID === parseInt(courseId))
        setGrades(courseGrades)
      } catch (error) {
        console.error('Error loading grade details:', error)
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

  const averageGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + g.Grade, 0) / grades.length).toFixed(2)
    : 'N/A'

  return (
    <DashboardLayout 
      title={course?.Name || `Course ${courseId}`}
      subtitle="Grade details"
    >
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.GRADES)}
          className="mb-4 border border-[#e5e7e7] hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Grades
        </Button>

        <Card className="border border-[#e5e7e7] rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#e1e2f6] rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-[#1f1d39]">
                  {course?.Name || `Course ${courseId}`}
                </CardTitle>
                <CardDescription className="text-[#85878d]">Grade Details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#f5f7f9] rounded-lg">
              <span className="text-lg font-medium text-[#676767]">Average Grade:</span>
              <span className="text-2xl font-bold text-[#1f1d39]">{averageGrade}</span>
            </div>

            <div className="space-y-3">
              {grades.map((grade) => (
                <Card key={grade.Assessment_ID} className="border border-[#e5e7e7] rounded-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#1f1d39]">Assessment {grade.Assessment_ID}</p>
                          <Badge
                            className={
                              grade.Status === 'Approved'
                                ? 'bg-green-500 text-white'
                                : grade.Status === 'Rejected'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-500 text-white'
                            }
                          >
                            {grade.Status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#85878d]">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(grade.Registration_Date).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-[#3bafa8]">{grade.Grade.toFixed(2)}</div>
                        <p className="text-sm text-[#85878d]">points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {grades.length === 0 && (
              <div className="text-center py-8 text-[#85878d]">
                No grades available for this course
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


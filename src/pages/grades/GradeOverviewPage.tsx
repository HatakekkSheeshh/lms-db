import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { gradeService } from '@/lib/api/gradeService'
import { courseService } from '@/lib/api/courseService'
import { useAuth } from '@/context/AuthProvider'
import type { Assessment, Course } from '@/types'
import { ROUTES } from '@/constants/routes'
import { BarChart3, TrendingUp, BookOpen } from 'lucide-react'
import '@/lib/animations/gsap-setup'

export default function GradeOverviewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [grades, setGrades] = useState<Assessment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      })
    }
  }, { scope: containerRef })

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      
      try {
        const [gradesData, coursesData] = await Promise.all([
          gradeService.getGrades(user.University_ID),
          courseService.getCourses(),
        ])
        
        setGrades(gradesData)
        setCourses(coursesData)
      } catch (error) {
        console.error('Error loading grades:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

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

  const getCourseName = (courseId: number) => {
    return courses.find(c => c.Course_ID === courseId)?.Name || `Course ${courseId}`
  }

  const groupedGrades = grades.reduce((acc, grade) => {
    const courseId = grade.Course_ID
    if (!acc[courseId]) {
      acc[courseId] = []
    }
    acc[courseId].push(grade)
    return acc
  }, {} as Record<number, Assessment[]>)

  return (
    <DashboardLayout 
      title="Grades" 
      subtitle="View all your grades"
    >
      <div ref={containerRef} className="space-y-6">
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="border border-[#e5e7e7] rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#85878d]">Average Grade</CardTitle>
              <div className="w-10 h-10 bg-[#e1e2f6] rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1f1d39]">{averageGrade}</div>
              <p className="text-xs text-[#85878d] mt-1">Total {grades.length} grades</p>
            </CardContent>
          </Card>

          <Card className="border border-[#e5e7e7] rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#85878d]">Courses</CardTitle>
              <div className="w-10 h-10 bg-[#f8efe2] rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1f1d39]">{Object.keys(groupedGrades).length}</div>
              <p className="text-xs text-[#85878d] mt-1">Total courses with grades</p>
            </CardContent>
          </Card>

          <Card className="border border-[#e5e7e7] rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#85878d]">Total Grades</CardTitle>
              <div className="w-10 h-10 bg-[#eff7e2] rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1f1d39]">{grades.length}</div>
              <p className="text-xs text-[#85878d] mt-1">Total assessments</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedGrades).map(([courseId, courseGrades]) => {
            const courseAvg = (courseGrades.reduce((sum, g) => sum + g.Grade, 0) / courseGrades.length).toFixed(2)
            return (
              <Card 
                key={courseId} 
                className="border border-[#e5e7e7] rounded-xl hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-[#1f1d39]">{getCourseName(parseInt(courseId))}</CardTitle>
                      <CardDescription className="text-[#85878d]">Course ID: {courseId}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#1f1d39]">{courseAvg}</div>
                      <p className="text-sm text-[#85878d]">Average</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {courseGrades.map((grade) => (
                      <div 
                        key={grade.Assessment_ID} 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-[#1f1d39]">Assessment {grade.Assessment_ID}</p>
                          <p className="text-sm text-[#85878d]">
                            Status: {grade.Status}
                          </p>
                        </div>
                        <div className="text-lg font-bold text-[#3bafa8]">{grade.Grade.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-[#e5e7e7] hover:bg-gray-50"
                    onClick={() => navigate(ROUTES.GRADE_DETAIL.replace(':courseId', courseId))}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {grades.length === 0 && (
          <Card className="border border-[#e5e7e7] rounded-xl">
            <CardContent className="py-10 text-center">
              <p className="text-[#85878d]">No grades available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}


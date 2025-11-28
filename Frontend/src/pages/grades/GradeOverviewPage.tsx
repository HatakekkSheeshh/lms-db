import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { gradeService } from '@/lib/api/gradeService'
import { useAuth } from '@/context/AuthProvider'
import type { Assessment } from '@/types'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { 
  useNeoBrutalismMode, 
  getNeoBrutalismCardClasses, 
  getNeoBrutalismTextClasses,
  getNeoBrutalismStatCardClasses
} from '@/lib/utils/theme-utils'
import { BarChart3, BookOpen, PieChart, GraduationCap } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line, Cell } from 'recharts'
import '@/lib/animations/gsap-setup'

interface GradeWithCourse extends Assessment {
  courseName?: string
}

export default function GradeOverviewPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [grades, setGrades] = useState<GradeWithCourse[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const neoBrutalismMode = useNeoBrutalismMode()

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
        const gradesData = await gradeService.getGrades(user.University_ID)
        setGrades(gradesData)
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
          <div className="text-lg text-[#1f1d39] dark:text-white">{t('common.loading')}</div>
        </div>
      </DashboardLayout>
    )
  }

  // Calculate statistics using GPA
  const validGPAs = grades.filter(g => g.GPA !== null && g.GPA !== undefined)
  const averageGPA = validGPAs.length > 0
    ? (validGPAs.reduce((sum, g) => sum + (g.GPA || 0), 0) / validGPAs.length).toFixed(2)
    : 'N/A'

  // Group by semester first, then by course
  const groupedBySemester = grades.reduce((acc, grade) => {
    const semester = grade.Semester || 'Unknown'
    if (!acc[semester]) {
      acc[semester] = {}
    }
    
    const courseKey = grade.Course_ID?.toString() || 'unknown'
    const courseName = grade.Course_Name || `Course ${grade.Course_ID || 'Unknown'}`
    
    if (!acc[semester][courseKey]) {
      acc[semester][courseKey] = {
        courseName,
        courseId: grade.Course_ID,
        credits: grade.Credits || 0,
        grades: [],
        sectionId: grade.Section_ID,
        semester: grade.Semester
      }
    }
    
    acc[semester][courseKey].grades.push(grade)
    return acc
  }, {} as Record<string, Record<string, { courseName: string; courseId: string | number | undefined; credits: number; grades: GradeWithCourse[]; sectionId: string | number; semester?: string }>>)

  // Prepare chart data with multiple colors
  const courseChartData = Object.values(groupedBySemester)
    .flatMap(semesterCourses => Object.entries(semesterCourses))
    .map(([, group]) => {
      const courseGPA = group.grades.length > 0
        ? group.grades
            .filter(g => g.GPA !== null && g.GPA !== undefined)
            .reduce((sum, g) => sum + (g.GPA || 0), 0) / 
            Math.max(group.grades.filter(g => g.GPA !== null && g.GPA !== undefined).length, 1)
        : 0
      
      return {
        name: group.courseName.length > 20 ? group.courseName.substring(0, 20) + '...' : group.courseName,
        fullName: group.courseName,
        gpa: parseFloat(courseGPA.toFixed(2)),
      }
    })
    .filter(item => item.gpa > 0)
    .sort((a, b) => b.gpa - a.gpa)

  // Color palette for chart bars
  const chartColors = [
    '#3bafa8', '#8b5cf6', '#f59e0b', '#ef4444', 
    '#10b981', '#3b82f6', '#f97316', '#ec4899',
    '#06b6d4', '#84cc16', '#a855f7', '#f43f5e'
  ]

  // Grade breakdown chart data
  const gradeBreakdownData = [
    {
      name: t('grades.quizGrade') || 'Quiz',
      value: grades.reduce((sum, g) => sum + (g.Quiz_Grade || 0), 0) / Math.max(grades.filter(g => g.Quiz_Grade).length, 1),
      count: grades.filter(g => g.Quiz_Grade).length
    },
    {
      name: t('grades.assignmentGrade') || 'Assignment',
      value: grades.reduce((sum, g) => sum + (g.Assignment_Grade || 0), 0) / Math.max(grades.filter(g => g.Assignment_Grade).length, 1),
      count: grades.filter(g => g.Assignment_Grade).length
    },
    {
      name: t('grades.midtermGrade') || 'Midterm',
      value: grades.reduce((sum, g) => sum + (g.Midterm_Grade || 0), 0) / Math.max(grades.filter(g => g.Midterm_Grade).length, 1),
      count: grades.filter(g => g.Midterm_Grade).length
    },
    {
      name: t('grades.finalGrade') || 'Final',
      value: grades.reduce((sum, g) => sum + (g.Final_Grade || 0), 0) / Math.max(grades.filter(g => g.Final_Grade).length, 1),
      count: grades.filter(g => g.Final_Grade).length
    },
  ].filter(item => item.value > 0)

  // Chart config for shadcn chart
  const breakdownChartConfig = {
    quiz: {
      label: t('grades.quizGrade') || 'Quiz',
      color: 'hsl(var(--chart-1))',
    },
    assignment: {
      label: t('grades.assignmentGrade') || 'Assignment',
      color: 'hsl(var(--chart-2))',
    },
    midterm: {
      label: t('grades.midtermGrade') || 'Midterm',
      color: 'hsl(var(--chart-3))',
    },
    final: {
      label: t('grades.finalGrade') || 'Final',
      color: 'hsl(var(--chart-4))',
    },
  }

  // Prepare breakdown data for bar chart with vibrant colors
  const breakdownColors = ['#3bafa8', '#8b5cf6', '#f59e0b', '#ef4444']
  const breakdownBarData = gradeBreakdownData.map((item, index) => ({
    name: item.name,
    value: parseFloat(item.value.toFixed(2)),
    fill: breakdownColors[index % breakdownColors.length],
  }))

  // Semester trend data using GPA
  const semesterData = grades.reduce((acc, grade) => {
    if (!grade.Semester) return acc
    if (!acc[grade.Semester]) {
      acc[grade.Semester] = { semester: grade.Semester, gpas: [], count: 0 }
    }
    if (grade.GPA !== null && grade.GPA !== undefined) {
      acc[grade.Semester].gpas.push(grade.GPA)
      acc[grade.Semester].count++
    }
    return acc
  }, {} as Record<string, { semester: string; gpas: number[]; count: number }>)

  const semesterChartData = Object.values(semesterData)
    .map(item => ({
      semester: item.semester,
      average: item.gpas.length > 0 
        ? parseFloat((item.gpas.reduce((sum, g) => sum + g, 0) / item.gpas.length).toFixed(2))
        : 0,
      count: item.count
    }))
    .sort((a, b) => a.semester.localeCompare(b.semester))

  const handleCourseClick = (courseId: string | number | undefined, sectionId: string | number) => {
    if (courseId && sectionId) {
      navigate(ROUTES.SECTION_DETAIL.replace(':courseId', courseId.toString()).replace(':sectionId', sectionId.toString()))
    }
  }

  return (
    <DashboardLayout 
      title={t('grades.title')} 
      subtitle={t('grades.subtitle')}
    >
      <div ref={containerRef} className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-5 md:grid-cols-4">
          <Card className={getNeoBrutalismStatCardClasses(neoBrutalismMode)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium text-[#85878d] dark:text-gray-400",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>{t('grades.gpa') || 'GPA'}</CardTitle>
              <div className={cn(
                "w-10 h-10 bg-[#e1e2f6] dark:bg-purple-900/30 flex items-center justify-center",
                neoBrutalismMode 
                  ? "border-4 border-[#1a1a1a] dark:border-[#FFFBEB] rounded-none shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,251,235,1)]"
                  : "rounded-lg"
              )}>
                <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-3xl font-bold text-[#1f1d39] dark:text-white",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
              )}>{averageGPA}</div>
              <p className={cn(
                "text-xs text-[#85878d] dark:text-gray-400 mt-1",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>{t('grades.overallGPA') || 'Overall GPA'}</p>
            </CardContent>
          </Card>

          <Card className={getNeoBrutalismStatCardClasses(neoBrutalismMode)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium text-[#85878d] dark:text-gray-400",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>{t('grades.totalCourses')}</CardTitle>
              <div className={cn(
                "w-10 h-10 bg-[#f8efe2] dark:bg-orange-900/30 flex items-center justify-center",
                neoBrutalismMode 
                  ? "border-4 border-[#1a1a1a] dark:border-[#FFFBEB] rounded-none shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,251,235,1)]"
                  : "rounded-lg"
              )}>
                <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-3xl font-bold text-[#1f1d39] dark:text-white",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
              )}>{Object.values(groupedBySemester).reduce((sum, semester) => sum + Object.keys(semester).length, 0)}</div>
              <p className={cn(
                "text-xs text-[#85878d] dark:text-gray-400 mt-1",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>{t('grades.coursesWithGrades')}</p>
            </CardContent>
          </Card>

          <Card className={getNeoBrutalismStatCardClasses(neoBrutalismMode)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium text-[#85878d] dark:text-gray-400",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>{t('grades.totalCredits') || 'Total Credits'}</CardTitle>
              <div className={cn(
                "w-10 h-10 bg-[#eff7e2] dark:bg-green-900/30 flex items-center justify-center",
                neoBrutalismMode 
                  ? "border-4 border-[#1a1a1a] dark:border-[#FFFBEB] rounded-none shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,251,235,1)]"
                  : "rounded-lg"
              )}>
                <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-3xl font-bold text-[#1f1d39] dark:text-white",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
              )}>{Object.values(groupedBySemester).reduce((sum, semester) => 
                sum + Object.values(semester).reduce((s, course) => s + (course.credits || 0), 0), 0
              )}</div>
              <p className={cn(
                "text-xs text-[#85878d] dark:text-gray-400 mt-1",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>{t('grades.creditsEarned') || 'Credits Earned'}</p>
            </CardContent>
          </Card>

          <Card className={getNeoBrutalismStatCardClasses(neoBrutalismMode)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium text-[#85878d] dark:text-gray-400",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>{t('grades.totalAssessments')}</CardTitle>
              <div className={cn(
                "w-10 h-10 bg-[#e0f7f5] dark:bg-teal-900/30 flex items-center justify-center",
                neoBrutalismMode 
                  ? "border-4 border-[#1a1a1a] dark:border-[#FFFBEB] rounded-none shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,251,235,1)]"
                  : "rounded-lg"
              )}>
                <PieChart className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-3xl font-bold text-[#1f1d39] dark:text-white",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
              )}>{grades.length}</div>
              <p className={cn(
                "text-xs text-[#85878d] dark:text-gray-400 mt-1",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>{t('grades.assessments') || 'Assessments'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {(courseChartData.length > 0 || gradeBreakdownData.length > 0) && (
          <Tabs defaultValue="course" className="w-full">
            <TabsList className={cn(
              "grid w-full grid-cols-3",
              neoBrutalismMode
                ? "border-2 border-[#1a1a1a] dark:border-[#FFFBEB] rounded-none"
                : ""
            )}>
              <TabsTrigger value="course">{t('grades.byCourse') || 'By Course'}</TabsTrigger>
              <TabsTrigger value="breakdown">{t('grades.breakdown') || 'Grade Breakdown'}</TabsTrigger>
              <TabsTrigger value="trend">{t('grades.semesterTrend') || 'Semester Trend'}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="course" className="space-y-4">
              <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
                <CardHeader>
                  <CardTitle className={cn(
                    "text-lg text-[#1f1d39] dark:text-white",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
                  )}>{t('grades.gpaByCourse') || 'GPA by Course'}</CardTitle>
                  <CardDescription className={cn(
                    "text-[#85878d] dark:text-gray-400",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                  )}>{t('grades.courseGPADescription') || 'GPA across all your courses'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={courseChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={neoBrutalismMode ? '#1a1a1a' : '#e5e7e7'} 
                        opacity={0.3}
                      />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fill: neoBrutalismMode ? '#1a1a1a' : '#85878d', fontSize: 12 }}
                        className="text-xs"
                      />
                      <YAxis 
                        domain={[0, 10]}
                        tick={{ fill: neoBrutalismMode ? '#1a1a1a' : '#85878d' }}
                        label={{ value: 'GPA', angle: -90, position: 'insideLeft', fill: neoBrutalismMode ? '#1a1a1a' : '#85878d' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: neoBrutalismMode ? '#2a2a2a' : '#fff',
                          border: neoBrutalismMode ? '2px solid #1a1a1a' : '1px solid #e5e7e7',
                          borderRadius: neoBrutalismMode ? '0' : '8px',
                          color: neoBrutalismMode ? '#fff' : '#1f1d39'
                        }}
                        formatter={(value: number) => [`${value.toFixed(2)}`, 'GPA']}
                      />
                      <Legend />
                      <Bar 
                        dataKey="gpa" 
                        name={t('grades.gpa') || 'GPA'}
                        radius={[8, 8, 0, 0]}
                      >
                        {courseChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-4">
              <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
                <CardHeader>
                  <CardTitle className={cn(
                    "text-lg text-[#1f1d39] dark:text-white",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
                  )}>{t('grades.gradeBreakdown') || 'Grade Breakdown'}</CardTitle>
                  <CardDescription className={cn(
                    "text-[#85878d] dark:text-gray-400",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                  )}>{t('grades.breakdownDescription') || 'Average scores by grade type'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={breakdownChartConfig}
                    className="h-[350px] w-full"
                  >
                    <BarChart data={breakdownBarData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={neoBrutalismMode ? '#1a1a1a' : '#e5e7e7'} 
                        opacity={0.3}
                      />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: neoBrutalismMode ? '#1a1a1a' : '#85878d', fontSize: 12 }}
                        className="text-xs"
                      />
                      <YAxis 
                        domain={[0, 10]}
                        tick={{ fill: neoBrutalismMode ? '#1a1a1a' : '#85878d' }}
                        label={{ value: 'Average Score', angle: -90, position: 'insideLeft', fill: neoBrutalismMode ? '#1a1a1a' : '#85878d' }}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                      />
                      <Bar 
                        dataKey="value" 
                        name={t('grades.averageScore') || 'Average Score'}
                        radius={[8, 8, 0, 0]}
                      >
                        {breakdownBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trend" className="space-y-4">
              <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
                <CardHeader>
                  <CardTitle className={cn(
                    "text-lg text-[#1f1d39] dark:text-white",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
                  )}>{t('grades.semesterTrend') || 'GPA Trend by Semester'}</CardTitle>
                  <CardDescription className={cn(
                    "text-[#85878d] dark:text-gray-400",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                  )}>{t('grades.trendDescription') || 'Your GPA progression over semesters'}</CardDescription>
                </CardHeader>
                <CardContent>
                  {semesterChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={semesterChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={neoBrutalismMode ? '#1a1a1a' : '#e5e7e7'} opacity={0.3} />
                        <XAxis 
                          dataKey="semester" 
                          tick={{ fill: neoBrutalismMode ? '#1a1a1a' : '#85878d' }}
                        />
                        <YAxis 
                          domain={[0, 10]}
                          tick={{ fill: neoBrutalismMode ? '#1a1a1a' : '#85878d' }}
                          label={{ value: 'GPA', angle: -90, position: 'insideLeft', fill: neoBrutalismMode ? '#1a1a1a' : '#85878d' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: neoBrutalismMode ? '#2a2a2a' : '#fff',
                            border: neoBrutalismMode ? '2px solid #1a1a1a' : '1px solid #e5e7e7',
                            borderRadius: neoBrutalismMode ? '0' : '8px',
                            color: neoBrutalismMode ? '#fff' : '#1f1d39'
                          }}
                          formatter={(value: number) => [`${value.toFixed(2)}`, 'GPA']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="average" 
                          stroke="#3bafa8" 
                          strokeWidth={3}
                          dot={{ fill: '#3bafa8', r: 5 }}
                          activeDot={{ r: 7 }}
                          name={t('grades.gpa') || 'GPA'}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-[#85878d] dark:text-gray-400">
                      {t('grades.noSemesterData') || 'No semester data available'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Grades by Semester */}
        <div className="space-y-6">
          <Accordion type="multiple" className="w-full">
            {Object.entries(groupedBySemester)
              .sort(([a], [b]) => b.localeCompare(a)) // Sort semesters descending
              .map(([semester, semesterCourses]) => {
              const semesterGPAs = Object.values(semesterCourses)
                .flatMap(course => course.grades)
                .filter(g => g.GPA !== null && g.GPA !== undefined)
                .map(g => g.GPA || 0)
              const semesterGPA = semesterGPAs.length > 0
                ? semesterGPAs.reduce((sum, gpa) => sum + gpa, 0) / semesterGPAs.length
                : 0

              return (
                <AccordionItem 
                  key={semester} 
                  value={semester}
                  className={cn(
                    "border-b",
                    neoBrutalismMode
                      ? "border-[#1a1a1a] dark:border-[#FFFBEB]"
                      : "border-[#e5e7e7] dark:border-[#333]"
                  )}
                >
                  <AccordionTrigger className={cn(
                    "hover:no-underline",
                    neoBrutalismMode && "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                  )}>
                    <div className="flex items-center gap-3 flex-1">
                      <GraduationCap className="h-5 w-5 text-[#3bafa8] dark:text-[#3bafa8]" />
                      <h2 className={cn(
                        "text-xl font-bold text-[#1f1d39] dark:text-white",
                        getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
                      )}>
                        {t('courses.semester')}: {semester}
                      </h2>
                      <div className={cn(
                        "text-lg font-semibold text-[#3bafa8] dark:text-teal-400",
                        getNeoBrutalismTextClasses(neoBrutalismMode, 'bold')
                      )}>
                        • {t('grades.gpa')}: {semesterGPA > 0 ? semesterGPA.toFixed(2) : 'N/A'}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 md:grid-cols-2 pt-4">
                  {Object.entries(semesterCourses).map(([courseId, group]) => {
                    const courseGPA = group.grades.length > 0
                      ? group.grades
                          .filter(g => g.GPA !== null && g.GPA !== undefined)
                          .reduce((sum, g) => sum + (g.GPA || 0), 0) / 
                          Math.max(group.grades.filter(g => g.GPA !== null && g.GPA !== undefined).length, 1)
                      : 0
                    
                    return (
                      <Card 
                        key={courseId}
                        onClick={() => handleCourseClick(group.courseId, group.sectionId)}
                        className={cn(
                          getNeoBrutalismCardClasses(neoBrutalismMode),
                          "cursor-pointer transition-all",
                          !neoBrutalismMode && "hover:shadow-lg"
                        )}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <CardTitle className={cn(
                                "text-lg text-[#1f1d39] dark:text-white mb-2",
                                getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
                              )}>{group.courseName}</CardTitle>
                              <CardDescription className={cn(
                                "text-[#85878d] dark:text-gray-400",
                                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                              )}>
                                {t('courses.courseId')}: {courseId} • {t('courses.credits')}: {group.credits}
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className={cn(
                                "text-2xl font-bold text-[#3bafa8] dark:text-teal-400",
                                getNeoBrutalismTextClasses(neoBrutalismMode, 'bold')
                              )}>{courseGPA > 0 ? courseGPA.toFixed(2) : 'N/A'}</div>
                              <p className={cn(
                                "text-sm text-[#85878d] dark:text-gray-400",
                                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                              )}>{t('grades.gpa') || 'GPA'}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* Grade Breakdown for this course */}
                          <div className="grid grid-cols-2 gap-3">
                            {group.grades[0]?.Quiz_Grade !== null && group.grades[0]?.Quiz_Grade !== undefined && (
                              <div className={cn(
                                "p-3 rounded-lg",
                                "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800",
                                neoBrutalismMode
                                  ? "border-2 border-purple-600 dark:border-purple-400 rounded-none"
                                  : "rounded-lg"
                              )}>
                                <p className={cn(
                                  "text-xs text-purple-600 dark:text-purple-400 mb-1",
                                  getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                                )}>{t('grades.quizGrade')}</p>
                                <p className={cn(
                                  "text-lg font-bold text-purple-700 dark:text-purple-300",
                                  getNeoBrutalismTextClasses(neoBrutalismMode, 'bold')
                                )}>{group.grades[0].Quiz_Grade?.toFixed(2)}</p>
                              </div>
                            )}
                            {group.grades[0]?.Assignment_Grade !== null && group.grades[0]?.Assignment_Grade !== undefined && (
                              <div className={cn(
                                "p-3 rounded-lg",
                                "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",
                                neoBrutalismMode
                                  ? "border-2 border-blue-600 dark:border-blue-400 rounded-none"
                                  : "rounded-lg"
                              )}>
                                <p className={cn(
                                  "text-xs text-blue-600 dark:text-blue-400 mb-1",
                                  getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                                )}>{t('grades.assignmentGrade')}</p>
                                <p className={cn(
                                  "text-lg font-bold text-blue-700 dark:text-blue-300",
                                  getNeoBrutalismTextClasses(neoBrutalismMode, 'bold')
                                )}>{group.grades[0].Assignment_Grade?.toFixed(2)}</p>
                              </div>
                            )}
                            {group.grades[0]?.Midterm_Grade !== null && group.grades[0]?.Midterm_Grade !== undefined && (
                              <div className={cn(
                                "p-3 rounded-lg",
                                "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800",
                                neoBrutalismMode
                                  ? "border-2 border-orange-600 dark:border-orange-400 rounded-none"
                                  : "rounded-lg"
                              )}>
                                <p className={cn(
                                  "text-xs text-orange-600 dark:text-orange-400 mb-1",
                                  getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                                )}>{t('grades.midtermGrade')}</p>
                                <p className={cn(
                                  "text-lg font-bold text-orange-700 dark:text-orange-300",
                                  getNeoBrutalismTextClasses(neoBrutalismMode, 'bold')
                                )}>{group.grades[0].Midterm_Grade?.toFixed(2)}</p>
                              </div>
                            )}
                            {group.grades[0]?.Final_Grade !== null && group.grades[0]?.Final_Grade !== undefined && (
                              <div className={cn(
                                "p-3 rounded-lg",
                                "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",
                                neoBrutalismMode
                                  ? "border-2 border-green-600 dark:border-green-400 rounded-none"
                                  : "rounded-lg"
                              )}>
                                <p className={cn(
                                  "text-xs text-green-600 dark:text-green-400 mb-1",
                                  getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                                )}>{t('grades.finalGrade')}</p>
                                <p className={cn(
                                  "text-lg font-bold text-green-700 dark:text-green-300",
                                  getNeoBrutalismTextClasses(neoBrutalismMode, 'bold')
                                )}>{group.grades[0].Final_Grade?.toFixed(2)}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>

        {grades.length === 0 && (
          <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
            <CardContent className="py-10 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 text-[#85878d] dark:text-gray-400 opacity-50" />
              <p className={cn(
                "text-[#85878d] dark:text-gray-400",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>{t('grades.noGradesAvailable')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

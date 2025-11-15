import { useEffect, useState, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthProvider'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { courseService } from '@/lib/api/courseService'
import { assignmentService } from '@/lib/api/assignmentService'
import { gradeService } from '@/lib/api/gradeService'
import { ROUTES } from '@/constants/routes'
import type { Course, Assignment, Assessment } from '@/types'
import { Search, Bell, BookOpen, Users, Trophy, ChevronDown, Check, Edit2, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'
import '@/lib/animations/gsap-setup'

// Figma assets URLs
const imgProfilePicture = "https://www.figma.com/api/mcp/asset/3c99bdb9-fc77-4a11-92f6-351812a3d9bf"
const imgVerificationIcon = "https://www.figma.com/api/mcp/asset/757dafdc-d5a2-4914-af02-10eb336d23e4"

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [grades, setGrades] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
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
        const [coursesData, assignmentsData, gradesData] = await Promise.all([
          courseService.getCourses(),
          assignmentService.getAssignments(user.University_ID),
          gradeService.getGrades(user.University_ID),
        ])
        
        setCourses(coursesData)
        setAssignments(assignmentsData)
        setGrades(gradesData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
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
    ? (grades.reduce((sum, g) => sum + g.Grade, 0) / grades.length).toFixed(3)
    : '8.966'

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: 'Charlie Rawal', course: 53, hour: 250, point: 13.450, trend: 'up' },
    { rank: 2, name: 'Ariana Agarwal', course: 88, hour: 212, point: 10.333, trend: 'down' },
  ]

  // Mock todo list
  const todos = [
    { id: 1, text: 'Developing Restaurant Apps', category: 'Programming', time: '08:00 AM', checked: false },
    { id: 2, text: 'Integrate API', checked: false },
    { id: 3, text: 'Slicing Home Screen', checked: false },
    { id: 4, text: 'Research Objective User', category: 'Product Design', time: '02:40 PM', checked: false },
    { id: 5, text: 'Report Analysis P2P Business', category: 'Business', time: '04:50 PM', checked: true },
  ]

  // Course cards data với colors từ Figma - map với real courses
  const cardConfigs = [
    { 
      color: 'bg-[#e1e2f6]', 
      iconBg: 'bg-[#fcf9ff]', 
      icon: '< >',
      iconColor: 'text-purple-600'
    },
    { 
      color: 'bg-[#f8efe2]', 
      iconBg: 'bg-[#faf5ec]', 
      icon: '↑',
      iconColor: 'text-orange-600'
    },
    { 
      color: 'bg-[#eff7e2]', 
      iconBg: 'bg-[#f6fbee]', 
      icon: '~',
      iconColor: 'text-green-600'
    },
  ]

  const fallbackCourses = [
    { 
      title: 'Basic: HTML and CSS', 
      courseId: 1
    },
    { 
      title: 'Branding Design', 
      courseId: 2
    },
    { 
      title: 'Motion Design', 
      courseId: 3
    },
  ]

  const courseCards = courses.length > 0
    ? courses.slice(0, 3).map((course, index) => ({
        ...cardConfigs[index] || cardConfigs[0],
        title: course.Course_Name,
        courseId: course.Course_ID,
      }))
    : fallbackCourses.map((course, index) => ({
        ...cardConfigs[index] || cardConfigs[0],
        ...course,
      }))

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`${ROUTES.COURSES}?search=${encodeURIComponent(searchQuery)}`)
    } else {
      navigate(ROUTES.COURSES)
    }
  }

  const handleCourseClick = (courseId: number) => {
    navigate(ROUTES.COURSE_DETAIL.replace(':courseId', courseId.toString()))
  }

  const handleTodoClick = (todo: typeof todos[0]) => {
    // Map todo items to assignments if possible
    if (todo.text.toLowerCase().includes('assignment') || todo.text.toLowerCase().includes('api')) {
      navigate(ROUTES.ASSIGNMENTS)
    } else {
      navigate(ROUTES.ASSIGNMENTS)
    }
  }

  const handleCalendarNavigation = (direction: 'prev' | 'next') => {
    // Navigate to schedule page
    navigate(ROUTES.SCHEDULE)
  }

  // Chart data
  const chartData = [
    { month: 'Jan', Study: 30, Exams: 0 },
    { month: 'Feb', Study: 20, Exams: 10 },
    { month: 'Mar', Study: 60, Exams: 0 },
    { month: 'Apr', Study: 40, Exams: 20 },
    { month: 'May', Study: 15, Exams: 0 },
  ]

  // Chart config với dark mode support
  const chartConfig = {
    Study: {
      label: 'Study',
      color: '#ff9053',
    },
    Exams: {
      label: 'Exams',
      color: '#f8efe2',
    },
  } satisfies ChartConfig

  // Calendar days
  const calendarDays = [24, 25, 26, 27, 28, 29, 30]

  // Right Sidebar Content
  const rightSidebarContent = (
    <>
      {/* Profile */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black dark:text-white">Profile</h3>
          <Link
            to={ROUTES.PROFILE}
            className="w-14 h-14 border border-[#e7eae9] dark:border-[#333] bg-white dark:bg-[#1a1a1a] rounded-xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <Edit2 className="w-6 h-6 text-[#85878d] dark:text-gray-400" />
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-[101px] h-[101px] rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-[#1a1a1a] shadow-lg">
              {imgProfilePicture ? (
                <img src={imgProfilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#3bafa8] to-[#ff9053] flex items-center justify-center text-white text-2xl font-bold">
                  {user?.First_Name?.[0] || 'M'}
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5">
              <img src={imgVerificationIcon} alt="Verified" className="w-full h-full" />
            </div>
          </div>
          <p className="font-semibold text-lg text-black dark:text-white mb-1">
            {user?.First_Name} {user?.Last_Name || 'Maietry Prajapati'}
          </p>
          <p className="text-sm text-black dark:text-gray-300 font-medium">College Student</p>
        </div>
      </div>

      {/* Calendar */}
      <Card 
        className="bg-[#f8f8f8] dark:bg-[#1a1a1a] border-0 rounded-3xl p-4 mb-6 cursor-pointer hover:shadow-md dark:hover:shadow-lg transition-shadow"
        onClick={() => navigate(ROUTES.SCHEDULE)}
      >
        <div className="flex items-center justify-between mb-4">
          <ChevronLeft 
            className="w-4 h-4 cursor-pointer text-[#676767] dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors" 
            onClick={(e) => {
              e.stopPropagation()
              handleCalendarNavigation('prev')
            }}
          />
          <span className="text-sm font-semibold text-black dark:text-white">December 2021</span>
          <ChevronRight 
            className="w-4 h-4 cursor-pointer text-[#676767] dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              handleCalendarNavigation('next')
            }}
          />
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2 text-[9.712px] text-center text-[#676767] dark:text-gray-400 font-medium">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className={i === 1 ? 'text-[#d2edfd] dark:text-[#3bafa8]' : ''}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => (
            <div
              key={day}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors ${
                day === 25 
                  ? 'bg-black dark:bg-white text-white dark:text-black' 
                  : 'text-[#676767] dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2a2a2a] cursor-pointer'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </Card>

      {/* To Do List */}
      <div>
        <h3 className="text-lg font-semibold text-black dark:text-white text-center mb-4">To Do List</h3>
        <div className="space-y-3">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex gap-3 items-start cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2a2a] p-2 rounded-lg transition-colors"
              onClick={() => handleTodoClick(todo)}
            >
              <div
                className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                  todo.checked
                    ? 'bg-[#3bafa8] border-[#3bafa8]'
                    : 'border-[#676767] dark:border-gray-500 hover:border-[#3bafa8]'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  // Toggle todo checked state (would need state management in real app)
                }}
              >
                {todo.checked && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold text-[#42404c] dark:text-white ${
                    todo.checked ? 'line-through' : ''
                  }`}
                >
                  {todo.text}
                </p>
                {todo.category && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-[#676767] dark:text-gray-400 font-medium">{todo.category}</span>
                    <span className="text-[#676767] dark:text-gray-400">•</span>
                    <span className="text-sm font-semibold text-[#fe764b]">{todo.time}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  return (
    <DashboardLayout showRightSidebar={true} rightSidebarContent={rightSidebarContent}>
      <div ref={containerRef} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-semibold text-[#211c37] dark:text-white">
                  Hello {user?.First_Name || 'Maietry'} 👋
                </h1>
              </div>
              <p className="text-[#85878d] dark:text-gray-400 text-sm font-medium">Let's learn something new today!</p>
            </div>
            <div className="flex items-center gap-5">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  placeholder="Search from courses..."
                  className="w-[322px] border-[#e7eae9] dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-[#211c37] dark:text-white rounded-xl pl-4 pr-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="w-6 h-6 text-[#85878d] dark:text-gray-400" />
                </button>
              </form>
              <div className="relative">
                <Link
                  to={ROUTES.ASSIGNMENTS}
                  className="w-12 h-12 border border-[#e7eae9] dark:border-[#333] bg-white dark:bg-[#1a1a1a] rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
                >
                  <Bell className="w-6 h-6 text-[#85878d] dark:text-gray-400" />
                </Link>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#1a1a1a]"></div>
              </div>
          </div>
        </div>

        {/* Course Cards */}
        <div className="flex gap-5 mb-6">
            {courseCards.map((course, index) => (
              <Card
                key={index}
                className={`${course.color} dark:bg-[#2a2a2a] border-0 dark:border-[#333] h-[177px] relative overflow-hidden flex-shrink-0 w-[240px] cursor-pointer hover:shadow-lg dark:hover:shadow-xl transition-shadow`}
                onClick={() => handleCourseClick(course.courseId)}
              >
                <div className="p-4 h-full flex flex-col justify-between">
                  <div className="flex flex-col gap-4">
                    <div className={`${course.iconBg} dark:bg-[#1a1a1a] w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold ${course.iconColor} dark:text-white`}>
                      {course.icon}
                    </div>
                    <h3 className="font-semibold text-[#1f1d39] dark:text-white text-base">{course.title}</h3>
                  </div>
                  <div className={`${course.iconBg} dark:bg-[#1a1a1a] rounded-[11px] px-6 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#1f1d39] dark:text-gray-300" />
                      <span className="text-[10px] font-semibold text-[#1f1d39] dark:text-gray-300">24</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300 dark:bg-[#444]"></div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#1f1d39] dark:text-gray-300" />
                      <span className="text-[10px] font-semibold text-[#1f1d39] dark:text-gray-300">8</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300 dark:bg-[#444]"></div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#1f1d39] dark:text-gray-300" />
                      <span className="text-[10px] font-semibold text-[#1f1d39] dark:text-gray-300">99</span>
                    </div>
                  </div>
                </div>
              </Card>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="flex gap-4 mb-6">
            {/* Hours Spent Chart */}
            <Card className="flex-1 border border-[#e5e7e7] dark:border-[#333] bg-white dark:bg-[#1a1a1a] rounded-xl p-6">
              <h3 className="text-xl font-semibold text-black dark:text-white mb-4">Hours Spent</h3>
              <ChartContainer config={chartConfig} className="h-[305px] w-full">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-[#e5e7e7] dark:stroke-[#333]" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tick={{ fill: '#95969c', fontSize: 12, fontWeight: 600 }}
                    className="dark:[&>text]:fill-gray-400"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#85878d', fontSize: 12 }}
                    className="dark:[&>text]:fill-gray-400"
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="Study" stackId="a" fill="var(--color-Study)">
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-study-${index}`} 
                        radius={entry.Exams === 0 ? 10 : [0, 0, 10, 10]} 
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="Exams" stackId="a" fill="var(--color-Exams)" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </Card>

            {/* Performance */}
            <Card className="w-[288px] border border-[#e5e7e9] dark:border-[#333] bg-white dark:bg-[#1a1a1a] rounded-xl p-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#45a8a3] rounded"></div>
                  <span className="text-xs font-semibold text-[#42404c] dark:text-white">Point Progress</span>
                </div>
                <div className="bg-[#eff1f3] dark:bg-[#2a2a2a] rounded px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-[#e5e7e9] dark:hover:bg-[#333] transition-colors">
                  <span className="text-xs font-semibold text-[#424252] dark:text-gray-300">Monthly</span>
                  <ChevronDown className="w-3 h-3 text-[#424252] dark:text-gray-300" />
                </div>
              </div>
              
              {/* Simple Circular Progress */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative w-32 h-32 mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    {/* Background circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#eff1f3"
                      strokeWidth="10"
                      className="dark:stroke-[#333]"
                    />
                    {/* Progress circle - 75% */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#45a8a3"
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 50 * 0.75} ${2 * Math.PI * 50}`}
                      strokeDashoffset={2 * Math.PI * 50 * 0.25}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-black dark:text-white">{averageGrade}</div>
                      <div className="text-xs text-[#83868e] dark:text-gray-400 mt-1">out of 10</div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#83868e] dark:text-gray-400 font-medium">Progress</span>
                    <span className="text-sm font-semibold text-black dark:text-white">75%</span>
                  </div>
                  <div className="w-full h-2 bg-[#eff1f3] dark:bg-[#333] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#45a8a3] to-[#3bafa8] rounded-full transition-all duration-500"
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-lg text-[#83868e] dark:text-gray-400 font-medium">
                  Your Point: <span className="text-black dark:text-white font-bold text-xl">{averageGrade}</span>
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[#3bafa8] text-xs font-medium">
                  <Trophy className="w-3 h-3" />
                  <span>5th in Leaderboard</span>
                </div>
              </div>
          </Card>
        </div>

        {/* Leader Board */}
        <Card 
            className="border border-[#e5e7e7] dark:border-[#333] bg-white dark:bg-[#1a1a1a] rounded-xl p-6 cursor-pointer hover:shadow-md dark:hover:shadow-lg transition-shadow"
            onClick={() => navigate(ROUTES.GRADES)}
          >
            <h3 className="text-xl font-semibold text-black dark:text-white mb-4">Leader Board</h3>
            <div className="grid grid-cols-[60px_200px_200px_100px_120px] gap-4 text-xs text-[#84868a] dark:text-gray-400 font-semibold mb-4 pb-2 border-b border-[#e5e7e7] dark:border-[#333]">
              <div>RANK</div>
              <div>NAME</div>
              <div>COURSE</div>
              <div>HOUR</div>
              <div>POINT</div>
            </div>
            <div className="space-y-4">
              {leaderboard.map((item) => (
                <div key={item.rank} className="grid grid-cols-[60px_200px_200px_100px_120px] gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#f5f7fb] dark:bg-[#2a2a2a] rounded w-6 h-6 flex items-center justify-center text-xs font-semibold text-black dark:text-white">
                      {item.rank}
                    </div>
                    {item.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <span className="text-sm font-semibold text-black dark:text-white">{item.name}</span>
                  </div>
                  <div className="text-sm text-[#676767] dark:text-gray-400 font-medium">{item.course}</div>
                  <div className="text-sm text-[#676767] dark:text-gray-400 font-medium">{item.hour}</div>
                  <div className="text-sm font-semibold text-[#3bafa8]">{item.point}</div>
                </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

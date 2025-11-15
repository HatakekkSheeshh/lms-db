import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { courseService } from '@/lib/api/courseService'
import type { Course } from '@/types'
import { ROUTES } from '@/constants/routes'
import { 
  BookOpen, 
  Calendar, 
  Award, 
  Search, 
  Filter,
  Users,
  ArrowRight,
  PlayCircle
} from 'lucide-react'

export default function CourseListPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'enrolled' | 'available'>('all')
  const navigate = useNavigate()

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await courseService.getCourses()
        setCourses(data)
      } catch (error) {
        console.error('Error loading courses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  // Filter courses based on search and filter
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.Name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-[#211c37] dark:text-white">Đang tải...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-[#211c37] dark:text-white mb-2">
              Khóa học của tôi
            </h1>
            <p className="text-[#85878d] dark:text-gray-400">
              Khám phá và tham gia các khóa học mới
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#85878d] dark:text-gray-400" />
              <Input
                placeholder="Tìm kiếm khóa học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-[#e7eae9] dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-[#211c37] dark:text-white rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('all')}
                className={`h-12 px-6 rounded-xl ${
                  selectedFilter === 'all'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'border-[#e7eae9] dark:border-[#333] text-[#211c37] dark:text-white hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Tất cả
              </Button>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              return (
                <Card
                  key={course.Course_ID}
                  className="group relative overflow-hidden border border-[#e5e7e7] dark:border-[#333] bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-none hover:shadow-2xl dark:hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 flex flex-col h-full"
                  onClick={() => navigate(ROUTES.COURSE_DETAIL.replace(':courseId', course.Course_ID.toString()))}
                >
                  {/* Simple Header */}
                  <div className="relative h-24 bg-[#f5f7f9] dark:bg-[#2a2a2a] overflow-hidden">
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-black dark:bg-white text-white dark:text-black border-0">
                        {course.Credit} tín chỉ
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="w-12 h-12 bg-white dark:bg-[#1a1a1a] rounded-xl flex items-center justify-center border border-[#e5e7e7] dark:border-[#333]">
                        <BookOpen className="w-6 h-6 text-[#211c37] dark:text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <div>
                      <h3 className="text-xl font-bold text-[#211c37] dark:text-white mb-2 line-clamp-2 group-hover:text-[#3bafa8] dark:group-hover:text-[#3bafa8] transition-colors">
                        {course.Name}
                      </h3>
                      <p className="text-sm text-[#85878d] dark:text-gray-400">
                        Mã khóa học: {course.Course_ID}
                      </p>
                    </div>

                    {/* Course Info */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-[#676767] dark:text-gray-400">
                        <Award className="w-4 h-4" />
                        <span>{course.Credit} credits</span>
                      </div>
                      {course.Start_Date && (
                        <div className="flex items-center gap-2 text-[#676767] dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(course.Start_Date).toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[#676767] dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>120 học viên</span>
                      </div>
                    </div>

                    {/* Progress Bar (Mock) */}
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#85878d] dark:text-gray-400">Tiến độ</span>
                        <span className="font-semibold text-[#211c37] dark:text-white">0%</span>
                      </div>
                      <div className="h-2 bg-[#eff1f3] dark:bg-[#333] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#3bafa8] to-[#45a8a3] rounded-full transition-all duration-500"
                          style={{ width: '0%' }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(ROUTES.COURSE_DETAIL.replace(':courseId', course.Course_ID.toString()))
                      }}
                      className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-xl h-11 group/btn"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <PlayCircle className="w-4 h-4" />
                        Xem chi tiết
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border border-[#e5e7e7] dark:border-[#333] bg-white dark:bg-[#1a1a1a] rounded-2xl">
            <div className="py-16 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-[#85878d] dark:text-gray-400" />
              <p className="text-lg font-semibold text-[#211c37] dark:text-white mb-2">
                {searchQuery ? 'Không tìm thấy khóa học' : 'Chưa có khóa học nào'}
              </p>
              <p className="text-sm text-[#85878d] dark:text-gray-400">
                {searchQuery 
                  ? 'Thử tìm kiếm với từ khóa khác' 
                  : 'Các khóa học sẽ xuất hiện ở đây khi bạn đăng ký'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}


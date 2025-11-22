import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pie, PieChart as RechartsPieChart, Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, Cell, Legend } from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { adminService, type AdminCourse, type CourseEnrollmentByCourse, type CourseDistributionByCredit, type TopCourseByEnrollment, type CourseAverageGrade, type CourseEnrollmentTrendOverTime, type CourseStatusDistribution, type CourseActivityStatistics } from '@/lib/api/adminService'
import { BookOpen, Edit2, Trash2, Eye, ArrowUpDown, MoreHorizontal, ChevronDown, Loader2, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  useNeoBrutalismMode, 
  getNeoBrutalismCardClasses, 
  getNeoBrutalismButtonClasses,
  getNeoBrutalismInputClasses,
  getNeoBrutalismTextClasses 
} from '@/lib/utils/theme-utils'
import AdvancedSearchPanel, { type SearchFilters } from '@/components/admin/AdvancedSearchPanel'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

export default function CourseManagementPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showCourseList, setShowCourseList] = useState(false)
  const [showAdvancedStatistics, setShowAdvancedStatistics] = useState(true)
  const [loadingAdvancedStats, setLoadingAdvancedStats] = useState(false)
  const [_enrollmentByCourse, setEnrollmentByCourse] = useState<CourseEnrollmentByCourse[]>([])
  const [distributionByCredit, setDistributionByCredit] = useState<CourseDistributionByCredit[]>([])
  const [topCoursesByEnrollment, setTopCoursesByEnrollment] = useState<TopCourseByEnrollment[]>([])
  const [averageGradeByCourse, setAverageGradeByCourse] = useState<CourseAverageGrade[]>([])
  const [enrollmentTrend, setEnrollmentTrend] = useState<CourseEnrollmentTrendOverTime[]>([])
  const [statusDistribution, setStatusDistribution] = useState<CourseStatusDistribution[]>([])
  const [activityStatistics, setActivityStatistics] = useState<CourseActivityStatistics[]>([])
  const [trendGroupBy, setTrendGroupBy] = useState<'Semester' | 'Month'>('Semester')
  const [statistics, setStatistics] = useState({
    total_courses: 0,
    total_sections: 0,
    total_students: 0,
    total_tutors: 0,
  })
  const neoBrutalismMode = useNeoBrutalismMode()

  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const [formData, setFormData] = useState({
    Course_ID: '',
    Name: '',
    Credit: '',
    Start_Date: '',
  })

  useEffect(() => {
    loadCourses()
    loadStatistics()
  }, [])

  useEffect(() => {
    if (showAdvancedStatistics) {
      loadAdvancedStatistics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAdvancedStatistics, trendGroupBy])

  const loadCourses = async () => {
    try {
      setLoading(true)
      console.log('[CourseManagement] Calling API: getCourses')
      const data = await adminService.getCourses()
      console.log('[CourseManagement] ✅ API getCourses succeeded:', data?.length || 0, 'courses')
      setCourses(data)
    } catch (error) {
      console.error('[CourseManagement] ❌ API getCourses failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      console.log('[CourseManagement] Calling API: getStatistics')
      const stats = await adminService.getStatistics()
      console.log('[CourseManagement] ✅ API getStatistics succeeded:', stats)
      setStatistics({
        total_courses: stats.total_courses || 0,
        total_sections: stats.total_sections || 0,
        total_students: stats.total_students || 0,
        total_tutors: stats.total_tutors || 0,
      })
    } catch (error) {
      console.error('[CourseManagement] ❌ API getStatistics failed:', error)
    }
  }

  const loadAdvancedStatistics = async () => {
    try {
      setLoadingAdvancedStats(true)
      
      // Define API calls with names for debugging
      const apiCalls = [
        { name: 'getCourseEnrollmentByCourse', call: () => adminService.getCourseEnrollmentByCourse() },
        { name: 'getCourseDistributionByCredit', call: () => adminService.getCourseDistributionByCredit() },
        { name: 'getTopCoursesByEnrollment', call: () => adminService.getTopCoursesByEnrollment(10) },
        { name: 'getCourseAverageGrade', call: () => adminService.getCourseAverageGrade(1) },
        { name: 'getCourseEnrollmentTrendOverTime', call: () => adminService.getCourseEnrollmentTrendOverTime(trendGroupBy) },
        { name: 'getCourseStatusDistribution', call: () => adminService.getCourseStatusDistribution() },
        { name: 'getCourseActivityStatistics', call: () => adminService.getCourseActivityStatistics(10) },
      ]
      
      console.log('[CourseManagement] Starting to load advanced statistics...')
      
      // Use Promise.allSettled to handle individual API failures gracefully
      const results = await Promise.allSettled(
        apiCalls.map(api => {
          console.log(`[CourseManagement] Calling API: ${api.name}`)
          return api.call()
        })
      )
      
      // Process results and log errors
      const errors: string[] = []
      const data: unknown[] = []
      
      results.forEach((result, index) => {
        const apiName = apiCalls[index].name
        if (result.status === 'fulfilled') {
          const value = result.value || []
          console.log(`[CourseManagement] ✅ API ${apiName} succeeded:`, Array.isArray(value) ? value.length : 0, 'items')
          data.push(value)
        } else {
          const reason = result.reason
          const errorMsg = reason instanceof Error 
            ? `API ${apiName} failed: ${reason.message}` 
            : `API ${apiName} failed: ${String(reason)}`
          console.error(`[CourseManagement] ❌ ${errorMsg}`, reason)
          errors.push(errorMsg)
          // Push empty array as fallback
          data.push([])
        }
      })
      
      // Set state with results (empty arrays for failed APIs)
      const [
        enrollmentData,
        creditDistributionData,
        topCoursesData,
        averageGradeData,
        trendData,
        statusData,
        activityData
      ] = data as [
        CourseEnrollmentByCourse[],
        CourseDistributionByCredit[],
        TopCourseByEnrollment[],
        CourseAverageGrade[],
        CourseEnrollmentTrendOverTime[],
        CourseStatusDistribution[],
        CourseActivityStatistics[]
      ]
      
      setEnrollmentByCourse(enrollmentData || [])
      setDistributionByCredit(creditDistributionData || [])
      setTopCoursesByEnrollment(topCoursesData || [])
      setAverageGradeByCourse(averageGradeData || [])
      setEnrollmentTrend(trendData || [])
      setStatusDistribution(statusData || [])
      setActivityStatistics(activityData || [])
      
      // Only show alert if there are actual errors
      if (errors.length > 0) {
        console.warn('[CourseManagement] Some statistics failed to load:', errors)
        // Only show alert if all APIs failed, or show a less intrusive warning
        if (errors.length === apiCalls.length) {
          alert(t('admin.errorLoadingStatistics') || 'Error loading statistics')
        } else {
          console.warn(`[CourseManagement] ${errors.length}/${apiCalls.length} APIs failed, but page will still display available data`)
        }
      } else {
        console.log('[CourseManagement] ✅ All advanced statistics loaded successfully')
      }
    } catch (error) {
      console.error('[CourseManagement] ❌ Unexpected error loading advanced statistics:', error)
      alert(t('admin.errorLoadingStatistics') || 'Error loading statistics')
    } finally {
      setLoadingAdvancedStats(false)
    }
  }

  const handleSearch = async () => {
    try {
      setIsSearching(true)
      const hasFilters = Object.values(searchFilters).some(v => v !== undefined && v !== '')
      
      if (hasFilters) {
        console.log('[CourseManagement] Calling API: searchCourses with filters:', searchFilters)
        const results = await adminService.searchCourses(searchFilters)
        console.log('[CourseManagement] ✅ API searchCourses succeeded:', results?.length || 0, 'courses')
        setCourses(results)
      } else {
        await loadCourses()
      }
    } catch (error) {
      console.error('[CourseManagement] ❌ API searchCourses failed:', error)
      alert(t('admin.errorSearchingCourses'))
    } finally {
      setIsSearching(false)
    }
  }

  const handleResetFilters = () => {
    setSearchFilters({})
    loadCourses()
  }

  const handleAddCourse = () => {
    setEditingCourse(null)
    setFormData({
      Course_ID: '',
      Name: '',
      Credit: '',
      Start_Date: '',
    })
    setIsDialogOpen(true)
  }

  const handleEditCourse = (course: AdminCourse) => {
    setEditingCourse(course)
    setFormData({
      Course_ID: course.Course_ID,
      Name: course.Name,
      Credit: course.Credit?.toString() || '',
      Start_Date: course.Start_Date || '',
    })
    setIsDialogOpen(true)
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm(`${t('admin.confirmDeleteCourse')} ${courseId}?`)) {
      return
    }

    setIsDeleting(true)
    setDeleteCourseId(courseId)

    try {
      await adminService.deleteCourse(courseId)
      await loadCourses()
    } catch (error) {
      console.error('Error deleting course:', error)
      alert(t('admin.errorDeletingUser'))
    } finally {
      setIsDeleting(false)
      setDeleteCourseId(null)
    }
  }

  const handleSaveCourse = async () => {
    if (!formData.Course_ID || !formData.Name) {
      alert(t('admin.fillRequiredFields'))
      return
    }

    try {
      if (editingCourse) {
        await adminService.updateCourse(formData.Course_ID, {
          Name: formData.Name,
          Credit: formData.Credit ? parseInt(formData.Credit) : null,
          Start_Date: formData.Start_Date || null,
        })
      } else {
        await adminService.createCourse({
          Course_ID: formData.Course_ID,
          Name: formData.Name,
          Credit: formData.Credit ? parseInt(formData.Credit) : null,
          Start_Date: formData.Start_Date || null,
        })
      }

      setIsDialogOpen(false)
      await loadCourses()
    } catch (error) {
      console.error('Error saving course:', error)
      alert(t('admin.errorSavingUser'))
    }
  }

  // Table columns
  const columns: ColumnDef<AdminCourse>[] = useMemo(() => [
    {
      accessorKey: 'Course_ID',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 lg:px-3"
          >
            {t('admin.courseId')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const courseId = row.getValue('Course_ID') as string
        return (
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 bg-[#3bafa8] dark:bg-[#3bafa8]/30 flex items-center justify-center flex-shrink-0",
              neoBrutalismMode 
                ? "border-4 border-[#1a1a1a] dark:border-[#FFFBEB] rounded-none"
                : "rounded-full"
            )}>
              <BookOpen className="h-4 w-4 text-white dark:text-[#3bafa8]" />
            </div>
            <div className="font-medium">{courseId}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'Name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 lg:px-3"
          >
            {t('admin.courseName')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const course = row.original
        return (
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0",
              neoBrutalismMode 
                ? "border-4 border-[#1a1a1a] dark:border-[#FFFBEB] rounded-none"
                : "rounded-full"
            )}>
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="font-medium">{course.Name}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'Credit',
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2 lg:px-3"
            >
              {t('admin.credit')}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => {
        const credit = row.getValue('Credit') as number | null
        return <div className="text-center">{credit ?? t('admin.noData')}</div>
      },
    },
    {
      id: 'SectionCount',
      accessorFn: (row) => row.SectionCount ?? 0,
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2 lg:px-3"
            >
              {t('admin.sections')}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => {
        const count = row.original.SectionCount
        // Show count if defined, otherwise show noData
        if (count === undefined || count === null) return <div className="text-center">{t('admin.noData')}</div>
        return (
          <div className="flex justify-center">
            <Badge className={cn(
              "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
              neoBrutalismMode ? "border-2 border-blue-600 dark:border-blue-400 rounded-none" : ""
            )}>
              {count} {t('admin.sections')}
            </Badge>
          </div>
        )
      },
    },
    {
      id: 'StudentCount',
      accessorFn: (row) => row.StudentCount ?? 0,
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2 lg:px-3"
            >
              {t('admin.students')}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => {
        const count = row.original.StudentCount
        // Show count if defined, otherwise show noData
        if (count === undefined || count === null) return <div className="text-center">{t('admin.noData')}</div>
        return (
          <div className="flex justify-center">
            <Badge className={cn(
              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
              neoBrutalismMode ? "border-2 border-green-600 dark:border-green-400 rounded-none" : ""
            )}>
              {count} {t('admin.students')}
            </Badge>
          </div>
        )
      },
    },
    {
      id: 'TutorCount',
      accessorFn: (row) => row.TutorCount ?? 0,
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2 lg:px-3"
            >
              {t('admin.tutors')}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => {
        const count = row.original.TutorCount
        // Show count if defined, otherwise show noData
        if (count === undefined || count === null) return <div className="text-center">{t('admin.noData')}</div>
        return (
          <div className="flex justify-center">
            <Badge className={cn(
              "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
              neoBrutalismMode ? "border-2 border-purple-600 dark:border-purple-400 rounded-none" : ""
            )}>
              {count} {t('admin.tutors')}
            </Badge>
          </div>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const course = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('admin.actions')}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/admin/courses/${course.Course_ID}`)}>
                <Eye className="mr-2 h-4 w-4" />
                {t('admin.viewDetails')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                <Edit2 className="mr-2 h-4 w-4" />
                {t('admin.edit')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteCourse(course.Course_ID)}
                className="text-red-600 dark:text-red-400"
                disabled={isDeleting && deleteCourseId === course.Course_ID}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('admin.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t, neoBrutalismMode, navigate, isDeleting, deleteCourseId])

  const table = useReactTable({
    data: courses,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // Chart data
  const creditDistributionData = useMemo(() => {
    return distributionByCredit.map(item => ({
      credit: item.Credit,
      count: item.CourseCount,
      students: item.TotalStudents,
      fill: '#3b82f6',
    }))
  }, [distributionByCredit])

  const statusDistributionData = useMemo(() => {
    const colors = {
      'Approved': '#10b981',
      'Pending': '#f59e0b',
      'Rejected': '#ef4444',
      'Cancelled': '#6b7280',
      'No Enrollment': '#9ca3af',
    }
    return statusDistribution.map(item => ({
      status: item.Status,
      count: item.StudentCount,
      courses: item.CourseCount,
      fill: colors[item.Status as keyof typeof colors] || '#6b7280',
    }))
  }, [statusDistribution])

  const chartConfig = {
    courses: {
      label: t('admin.courses'),
      color: '#3b82f6',
    },
    students: {
      label: t('admin.students'),
      color: '#10b981',
    },
    sections: {
      label: t('admin.sections'),
      color: '#8b5cf6',
    },
    tutors: {
      label: t('admin.tutors'),
      color: '#f59e0b',
    },
  } satisfies ChartConfig

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className={cn(
            "text-lg text-[#211c37] dark:text-white",
            getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
          )}>{t('common.loading')}</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className={cn(
            "text-3xl font-bold text-[#211c37] dark:text-white mb-2",
            getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
          )}>
            {t('admin.courseManagement')}
          </h1>
          <p className={cn(
            "text-[#85878d] dark:text-gray-400",
            getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
          )}>
            {t('admin.courseManagementSubtitle')}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium text-[#211c37] dark:text-white",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>
                {t('admin.totalCourses')}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold text-[#211c37] dark:text-white",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
              )}>
                {statistics.total_courses}
              </div>
            </CardContent>
          </Card>

          <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium text-[#211c37] dark:text-white",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>
                {t('admin.totalSections')}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold text-[#211c37] dark:text-white",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
              )}>
                {statistics.total_sections}
              </div>
            </CardContent>
          </Card>

          <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium text-[#211c37] dark:text-white",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>
                {t('admin.totalEnrolled')}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold text-[#211c37] dark:text-white",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
              )}>
                {statistics.total_students}
              </div>
            </CardContent>
          </Card>

          <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium text-[#211c37] dark:text-white",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>
                {t('admin.totalTutors')}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold text-[#211c37] dark:text-white",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
              )}>
                {statistics.total_tutors}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Course Distribution by Credit */}
          <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
            <CardHeader>
              <CardTitle className={cn(
                "text-[#211c37] dark:text-white",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
              )}>
                {t('admin.courseDistributionByCredit')}
              </CardTitle>
              <CardDescription className={cn(
                "text-[#85878d] dark:text-gray-400",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>
                {t('admin.courseDistributionByCreditSubtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {creditDistributionData.length > 0 ? (
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                  <BarChart accessibilityLayer data={creditDistributionData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="credit"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tick={{ fill: '#85878d', fontSize: 12 }}
                    />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#85878d', fontSize: 12 }} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="count" radius={4} fill="#3b82f6" />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  {t('admin.noData')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enrollment Status Distribution */}
          <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
            <CardHeader>
              <CardTitle className={cn(
                "text-[#211c37] dark:text-white",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
              )}>
                {t('admin.enrollmentStatusDistribution')}
              </CardTitle>
              <CardDescription className={cn(
                "text-[#85878d] dark:text-gray-400",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>
                {t('admin.enrollmentStatusDistributionSubtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statusDistributionData.length > 0 ? (
                <>
                  <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                    <RechartsPieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={statusDistributionData}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={60}
                        strokeWidth={5}
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ChartContainer>
                  <div className={cn(
                    "flex flex-wrap items-center justify-center gap-4 mt-4",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                  )}>
                    {statusDistributionData.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="h-3 w-3 rounded-sm"
                          style={{ backgroundColor: entry.fill }}
                        />
                        <span className="text-sm text-[#211c37] dark:text-white">
                          <span className="font-medium">{entry.status}</span>
                          {' '}
                          <span className="text-muted-foreground">
                            ({entry.count})
                          </span>
                        </span>
                </div>
                    ))}
              </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  {t('admin.noData')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Advanced Statistics Toggle */}
        <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
          <CardContent className="pt-6">
              <Button
              onClick={() => setShowAdvancedStatistics(!showAdvancedStatistics)}
              className={getNeoBrutalismButtonClasses(neoBrutalismMode)}
              variant="outline"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showAdvancedStatistics ? t('admin.hideAdvancedStatistics') : t('admin.showAdvancedStatistics')}
            </Button>
          </CardContent>
        </Card>

        {/* Advanced Statistics */}
        {showAdvancedStatistics && (
          <Tabs defaultValue="enrollment" className="space-y-4">
            <TabsList>
              <TabsTrigger value="enrollment">{t('admin.enrollment')}</TabsTrigger>
              <TabsTrigger value="grades">{t('admin.grades')}</TabsTrigger>
              <TabsTrigger value="trend">{t('admin.trend')}</TabsTrigger>
              <TabsTrigger value="activity">{t('admin.activity')}</TabsTrigger>
            </TabsList>

            <TabsContent value="enrollment" className="space-y-4">
              {/* Top Courses by Enrollment */}
              <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
                <CardHeader>
                  <CardTitle className={cn(
                    "text-[#211c37] dark:text-white",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
                  )}>
                    {t('admin.topCoursesByEnrollment')}
                  </CardTitle>
                  <CardDescription className={cn(
                    "text-[#85878d] dark:text-gray-400",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                  )}>
                    {t('admin.topCoursesByEnrollmentSubtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAdvancedStats ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : topCoursesByEnrollment.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <BarChart data={topCoursesByEnrollment}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="Course_Name"
                          tickLine={false}
                          axisLine={false}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fill: '#85878d', fontSize: 11 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#85878d', fontSize: 12 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="StudentCount" name={t('admin.students')} fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="SectionCount" name={t('admin.sections')} fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      {t('admin.noData')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grades" className="space-y-4">
              {/* Average Grade by Course */}
              <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
                <CardHeader>
                  <CardTitle className={cn(
                    "text-[#211c37] dark:text-white",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
                  )}>
                    {t('admin.averageGradeByCourse')}
                  </CardTitle>
                  <CardDescription className={cn(
                    "text-[#85878d] dark:text-gray-400",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                  )}>
                    {t('admin.averageGradeByCourseSubtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAdvancedStats ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : averageGradeByCourse.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <BarChart data={averageGradeByCourse}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="Course_Name"
                          tickLine={false}
                          axisLine={false}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fill: '#85878d', fontSize: 11 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#85878d', fontSize: 12 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="AverageGPA" name={t('admin.averageGPA')} fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="AverageFinalGrade" name={t('admin.averageFinalGrade')} fill="#f59e0b" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      {t('admin.noData')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trend" className="space-y-4">
              {/* Enrollment Trend Over Time */}
              <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className={cn(
                        "text-[#211c37] dark:text-white",
                        getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
                      )}>
                        {t('admin.enrollmentTrendOverTime')}
                      </CardTitle>
                      <CardDescription className={cn(
                        "text-[#85878d] dark:text-gray-400",
                        getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                      )}>
                        {t('admin.enrollmentTrendOverTimeSubtitle')}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={trendGroupBy === 'Semester' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTrendGroupBy('Semester')}
                      >
                        {t('admin.semester')}
                      </Button>
                      <Button
                        variant={trendGroupBy === 'Month' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTrendGroupBy('Month')}
                      >
                        {t('admin.month')}
              </Button>
            </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingAdvancedStats ? (
                    <div className="flex items-center justify-center h-[400px]">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : enrollmentTrend.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[400px] w-full">
                      <LineChart data={enrollmentTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="Period"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#85878d', fontSize: 12 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#85878d', fontSize: 12 }}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="StudentCount" name={t('admin.students')} stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="SectionCount" name={t('admin.sections')} stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="CourseCount" name={t('admin.courses')} stroke="#8b5cf6" strokeWidth={2} />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      {t('admin.noData')}
                    </div>
                  )}
          </CardContent>
        </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              {/* Course Activity Statistics */}
        <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
          <CardHeader>
                  <CardTitle className={cn(
                    "text-[#211c37] dark:text-white",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
                  )}>
                    {t('admin.courseActivityStatistics')}
                  </CardTitle>
                  <CardDescription className={cn(
                    "text-[#85878d] dark:text-gray-400",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                  )}>
                    {t('admin.courseActivityStatisticsSubtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAdvancedStats ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <Loader2 className="h-6 w-6 animate-spin" />
              </div>
                  ) : activityStatistics.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <BarChart data={activityStatistics}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="Course_Name"
                          tickLine={false}
                          axisLine={false}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fill: '#85878d', fontSize: 11 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#85878d', fontSize: 12 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="TotalAssignments" name={t('admin.assignments')} fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="TotalQuizzes" name={t('admin.quizzes')} fill="#10b981" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="TotalSubmissions" name={t('admin.submissions')} fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      {t('admin.noData')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Advanced Search Panel */}
        <AdvancedSearchPanel
          filters={searchFilters}
          onFiltersChange={setSearchFilters}
          onSearch={handleSearch}
          onReset={handleResetFilters}
          onAddCourse={handleAddCourse}
        />

        {/* Courses List Table */}
        <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
          <CardHeader>
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle className={cn(
                  "text-xl text-[#1f1d39] dark:text-white",
                  getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
                )}>
                  {t('admin.courseList')}
                </CardTitle>
                <CardDescription className={cn(
                  "text-[#85878d] dark:text-gray-400",
                  getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                )}>
                    {t('admin.totalCourses')} {courses.length}
                </CardDescription>
              </div>
                {isSearching && (
                  <Loader2 className="h-5 w-5 animate-spin text-[#3bafa8] dark:text-[#3bafa8]" />
                )}
            </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      {t('admin.columns')} <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        )
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  onClick={() => setShowCourseList(!showCourseList)}
                    className={cn(
                    "gap-2",
                      neoBrutalismMode
                      ? getNeoBrutalismButtonClasses(neoBrutalismMode, 'outline')
                      : ""
                  )}
                >
                  <Eye className="h-4 w-4" />
                  {showCourseList ? t('admin.hideUserList') : t('admin.showUserList')}
                </Button>
              </div>
            </div>
          </CardHeader>
          {showCourseList && (
          <CardContent>
            <div className="relative">
              {isSearching && (
                <div className="absolute inset-0 bg-white/80 dark:bg-[#1a1a1a]/80 z-10 flex items-center justify-center rounded-md">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-[#3bafa8] dark:text-[#3bafa8]" />
                    <span className={cn(
                      "text-sm text-muted-foreground",
                      getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                        )}>
                      {t('common.loading')}...
                    </span>
                          </div>
                            </div>
                          )}
              <ScrollArea className={cn(
                "h-[600px] rounded-md border",
                neoBrutalismMode 
                  ? "border-4 border-[#1a1a1a] dark:border-[#FFFBEB] rounded-none"
                  : "border-[#e5e7e7] dark:border-[#333]"
              )}>
                <div className="p-4">
                  <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          const isCenterColumn = ['Credit', 'SectionCount', 'StudentCount', 'TutorCount'].includes(header.column.id)
                          return (
                            <TableHead 
                              key={header.id}
                              className={cn(isCenterColumn && 'text-center')}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                        >
                          {row.getVisibleCells().map((cell) => {
                            const isCenterColumn = ['Credit', 'SectionCount', 'StudentCount', 'TutorCount'].includes(cell.column.id)
                            return (
                              <TableCell 
                                key={cell.id}
                                className={cn(isCenterColumn && 'text-center')}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          {t('admin.noCourses')}
                        </TableCell>
                      </TableRow>
                          )}
                  </TableBody>
                </Table>
                        </div>
              </ScrollArea>
                      </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                          className={cn(
                            neoBrutalismMode 
                              ? getNeoBrutalismButtonClasses(neoBrutalismMode, 'outline')
                              : ""
                          )}
                        >
                  {t('common.previous')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                          className={cn(
                            neoBrutalismMode 
                      ? getNeoBrutalismButtonClasses(neoBrutalismMode, 'outline')
                              : ""
                          )}
                        >
                  {t('common.next')}
                        </Button>
                      </div>
                    </div>
          </CardContent>
          )}
        </Card>

        {/* Add/Edit Course Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className={cn(
            "bg-white dark:bg-[#1a1a1a] max-w-2xl",
            neoBrutalismMode 
              ? "border-4 border-[#1a1a1a] dark:border-[#FFFBEB] rounded-none shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,251,235,1)]"
              : "border-[#e5e7e7] dark:border-[#333]"
          )}>
            <DialogHeader>
              <DialogTitle className={cn(
                "text-[#211c37] dark:text-white text-xl",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
              )}>
                {editingCourse ? t('admin.editCourseInfo') : t('admin.addNewCourse')}
              </DialogTitle>
              <DialogDescription className={cn(
                "text-gray-600 dark:text-gray-400",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
              )}>
                {editingCourse ? t('admin.updateUserInfo') : t('admin.fillInfoToCreateCourse')}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="course-id" className={cn(
                  "text-[#211c37] dark:text-white",
                  getNeoBrutalismTextClasses(neoBrutalismMode, 'bold')
                )}>
                  {t('admin.courseId')} *
                </Label>
                <Input
                  id="course-id"
                  value={formData.Course_ID}
                  onChange={(e) => setFormData({ ...formData, Course_ID: e.target.value })}
                  disabled={!!editingCourse}
                  placeholder="CS101"
                  className={cn(
                    "bg-white dark:bg-[#2a2a2a] text-[#211c37] dark:text-white",
                    getNeoBrutalismInputClasses(neoBrutalismMode)
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-name" className={cn(
                  "text-[#211c37] dark:text-white",
                  getNeoBrutalismTextClasses(neoBrutalismMode, 'bold')
                )}>
                  {t('admin.courseName')} *
                </Label>
                <Input
                  id="course-name"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  placeholder="Introduction to Computer Science"
                  className={cn(
                    "bg-white dark:bg-[#2a2a2a] text-[#211c37] dark:text-white",
                    getNeoBrutalismInputClasses(neoBrutalismMode)
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit" className={cn(
                  "text-[#211c37] dark:text-white",
                  getNeoBrutalismTextClasses(neoBrutalismMode, 'bold')
                )}>
                  {t('admin.credit')}
                </Label>
                <Input
                  id="credit"
                  type="number"
                  value={formData.Credit}
                  onChange={(e) => setFormData({ ...formData, Credit: e.target.value })}
                  placeholder="3"
                  className={cn(
                    "bg-white dark:bg-[#2a2a2a] text-[#211c37] dark:text-white",
                    getNeoBrutalismInputClasses(neoBrutalismMode)
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date" className={cn(
                  "text-[#211c37] dark:text-white",
                  getNeoBrutalismTextClasses(neoBrutalismMode, 'bold')
                )}>
                  {t('admin.startDate')}
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.Start_Date}
                  onChange={(e) => setFormData({ ...formData, Start_Date: e.target.value })}
                  className={cn(
                    "bg-white dark:bg-[#2a2a2a] text-[#211c37] dark:text-white",
                    getNeoBrutalismInputClasses(neoBrutalismMode)
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className={cn(
                  "border-[#e5e7e7] dark:border-[#333]",
                  neoBrutalismMode 
                    ? getNeoBrutalismButtonClasses(neoBrutalismMode, 'outline')
                    : ""
                )}
              >
                <span className={getNeoBrutalismTextClasses(neoBrutalismMode, 'bold')}>{t('admin.cancel')}</span>
              </Button>
              <Button
                onClick={handleSaveCourse}
                className={cn(
                  neoBrutalismMode 
                    ? getNeoBrutalismButtonClasses(neoBrutalismMode, 'primary', "bg-[#3bafa8] hover:bg-[#2a8d87] text-white")
                    : "bg-[#3bafa8] hover:bg-[#2a8d87] text-white"
                )}
              >
                <span className={getNeoBrutalismTextClasses(neoBrutalismMode, 'bold')}>{editingCourse ? t('admin.update') : t('admin.addNew')}</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}


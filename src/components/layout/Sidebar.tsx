import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthProvider'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  HelpCircle,
  BarChart3,
  Calendar,
  Users,
  Settings,
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const studentNavItems: NavItem[] = [
  { title: 'Dashboard', href: ROUTES.STUDENT_DASHBOARD, icon: LayoutDashboard },
  { title: 'Courses', href: ROUTES.COURSES, icon: BookOpen },
  { title: 'Assignments', href: ROUTES.ASSIGNMENTS, icon: FileText },
  { title: 'Quizzes', href: ROUTES.QUIZZES, icon: HelpCircle },
  { title: 'Grades', href: ROUTES.GRADES, icon: BarChart3 },
  { title: 'Schedule', href: ROUTES.SCHEDULE, icon: Calendar },
]

const tutorNavItems: NavItem[] = [
  { title: 'Dashboard', href: ROUTES.TUTOR_DASHBOARD, icon: LayoutDashboard },
  { title: 'My Courses', href: ROUTES.COURSES, icon: BookOpen },
  { title: 'Grading', href: ROUTES.ASSIGNMENTS, icon: FileText },
  { title: 'Schedule', href: ROUTES.SCHEDULE, icon: Calendar },
]

const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'Courses', href: ROUTES.COURSES, icon: BookOpen },
  { title: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
]

export default function Sidebar() {
  const { role } = useAuth()
  const location = useLocation()

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'student':
        return studentNavItems
      case 'tutor':
        return tutorNavItems
      case 'admin':
        return adminNavItems
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <>
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
        <div className="flex-1 flex flex-col min-h-0 border-r bg-background">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.title}
                </Link>
              )
            })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  )
}


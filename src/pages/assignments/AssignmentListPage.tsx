import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { assignmentService } from '@/lib/api/assignmentService'
import { useAuth } from '@/context/AuthProvider'
import type { Assignment } from '@/types'
import { ROUTES } from '@/constants/routes'
import { FileText, Calendar, Clock } from 'lucide-react'
import '@/lib/animations/gsap-setup'

export default function AssignmentListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState<Assignment[]>([])
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
    const loadAssignments = async () => {
      if (!user) return
      
      try {
        const data = await assignmentService.getAssignments(user.University_ID)
        setAssignments(data)
      } catch (error) {
        console.error('Error loading assignments:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAssignments()
  }, [user])

  const getStatus = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diff = deadlineDate.getTime() - now.getTime()
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (daysLeft < 0) return { text: 'Overdue', variant: 'destructive' as const, color: 'bg-red-500' }
    if (daysLeft <= 1) return { text: 'Due Soon', variant: 'destructive' as const, color: 'bg-orange-500' }
    if (daysLeft <= 3) return { text: 'Due Soon', variant: 'default' as const, color: 'bg-yellow-500' }
    return { text: 'On Time', variant: 'secondary' as const, color: 'bg-green-500' }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title="Assignments" 
      subtitle="All your assignments"
    >
      <div ref={containerRef} className="space-y-4">
        {assignments.map((assignment) => {
          const status = getStatus(assignment.submission_deadline)
          return (
            <Card 
              key={assignment.Assessment_ID} 
              className="border border-[#e5e7e7] rounded-xl hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#e1e2f6] rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[#1f1d39]">
                        Assignment {assignment.Assessment_ID}
                      </CardTitle>
                      <CardDescription className="text-sm text-[#85878d] mt-1">
                        {assignment.instructions || 'No instructions provided'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`${status.color} text-white`}>{status.text}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#85878d]" />
                    <span className="text-[#676767]">
                      Due: {new Date(assignment.submission_deadline).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#85878d]" />
                    <span className="text-[#676767]">Max Score: {assignment.MaxScore}</span>
                  </div>
                  {assignment.accepted_specification && (
                    <div className="text-sm text-[#85878d]">
                      Format: {assignment.accepted_specification}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => navigate(ROUTES.ASSIGNMENT_DETAIL.replace(':assignmentId', assignment.Assessment_ID.toString()))}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(ROUTES.ASSIGNMENT_SUBMIT.replace(':assignmentId', assignment.Assessment_ID.toString()))}
                    className="border-[#e5e7e7] hover:bg-gray-50"
                  >
                    Submit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {assignments.length === 0 && (
          <Card className="border border-[#e5e7e7] rounded-xl">
            <CardContent className="py-10 text-center">
              <p className="text-[#85878d]">No assignments available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}


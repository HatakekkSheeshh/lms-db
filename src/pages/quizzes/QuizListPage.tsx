import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { quizService } from '@/lib/api/quizService'
import { useAuth } from '@/context/AuthProvider'
import type { Quiz } from '@/types'
import { ROUTES } from '@/constants/routes'
import { HelpCircle, Clock, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import '@/lib/animations/gsap-setup'

export default function QuizListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
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
    const loadQuizzes = async () => {
      if (!user) return
      
      try {
        const data = await quizService.getQuizzes(user.University_ID)
        setQuizzes(data)
      } catch (error) {
        console.error('Error loading quizzes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadQuizzes()
  }, [user])

  const getStatusBadge = (quiz: Quiz) => {
    const now = new Date()
    const startDate = new Date(quiz.Start_Date)
    const endDate = new Date(quiz.End_Date)

    if (now < startDate) {
      return { text: 'Chưa bắt đầu', variant: 'secondary' as const, icon: Clock }
    }
    if (now > endDate) {
      return { text: 'Đã kết thúc', variant: 'secondary' as const, icon: XCircle }
    }

    switch (quiz.completion_status) {
      case 'Passed':
        return { text: 'Đã đạt', variant: 'default' as const, icon: CheckCircle2 }
      case 'Failed':
        return { text: 'Không đạt', variant: 'destructive' as const, icon: XCircle }
      case 'Submitted':
      case 'In Progress':
        return { text: 'Đã làm', variant: 'default' as const, icon: CheckCircle2 }
      default:
        return { text: 'Chưa làm', variant: 'secondary' as const, icon: Clock }
    }
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
      title="Quizzes" 
      subtitle="All your quizzes"
    >
      <div ref={containerRef} className="space-y-4">
        {quizzes.map((quiz) => {
          const status = getStatusBadge(quiz)
          const StatusIcon = status.icon
          const canTake = quiz.completion_status === 'Not Taken' || quiz.completion_status === 'In Progress'
          const now = new Date()
          const startDate = new Date(quiz.Start_Date)
          const endDate = new Date(quiz.End_Date)
          const isAvailable = now >= startDate && now <= endDate

          return (
            <Card 
              key={quiz.Assessment_ID} 
              className="border border-[#e5e7e7] rounded-xl hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#e1e2f6] rounded-lg flex items-center justify-center">
                      <HelpCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[#1f1d39]">Quiz {quiz.Assessment_ID}</CardTitle>
                      <CardDescription className="text-sm text-[#85878d] mt-1">{quiz.content}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={status.variant} className="flex items-center gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {status.text}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#85878d]" />
                    <span className="text-[#676767]">
                      {new Date(quiz.Start_Date).toLocaleDateString('vi-VN')} - {new Date(quiz.End_Date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#85878d]" />
                    <span className="text-[#676767]">Time: {quiz.Time_limits}</span>
                  </div>
                  {quiz.score > 0 && (
                    <div className="text-sm font-semibold text-[#1f1d39]">
                      Score: {quiz.score.toFixed(2)}/{quiz.pass_score}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  {canTake && isAvailable ? (
                    <Button
                      onClick={() => navigate(ROUTES.QUIZ_TAKE.replace(':quizId', quiz.Assessment_ID.toString()))}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      Take Quiz
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => navigate(ROUTES.QUIZ_RESULT.replace(':quizId', quiz.Assessment_ID.toString()))}
                      className="border-[#e5e7e7] hover:bg-gray-50"
                    >
                      View Result
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {quizzes.length === 0 && (
          <Card className="border border-[#e5e7e7] rounded-xl">
            <CardContent className="py-10 text-center">
              <p className="text-[#85878d]">No quizzes available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}


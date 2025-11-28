import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { assignmentService } from '@/lib/api/assignmentService'
import type { AdminAssignment } from '@/lib/api/adminService'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants/routes'
import { ArrowLeft, Upload, CheckCircle2, FileText, Clock, Award, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { 
  useNeoBrutalismMode, 
  getNeoBrutalismCardClasses, 
  getNeoBrutalismTextClasses,
  getNeoBrutalismButtonClasses
} from '@/lib/utils/theme-utils'

export default function AssignmentSubmitPage() {
  const { t } = useTranslation()
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const neoBrutalismMode = useNeoBrutalismMode()
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [assignment, setAssignment] = useState<AdminAssignment | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Get courseId and sectionId from URL params for navigation back
  const courseId = searchParams.get('courseId')
  const sectionId = searchParams.get('sectionId')

  useEffect(() => {
    const loadAssignment = async () => {
      if (!assignmentId) return
      
      try {
        setLoading(true)
        // Try to get assignment by AssignmentID first
        try {
          const assignmentData = await assignmentService.getAssignmentById(parseInt(assignmentId))
          if (assignmentData && assignmentData.AssignmentID) {
            // Convert Assignment to AdminAssignment format
            setAssignment({
              AssignmentID: assignmentData.AssignmentID,
              Course_ID: assignmentData.Course_ID?.toString() || courseId || '',
              Semester: assignmentData.Semester || '',
              MaxScore: assignmentData.MaxScore || null,
              accepted_specification: assignmentData.accepted_specification || null,
              submission_deadline: assignmentData.submission_deadline || null,
              instructions: assignmentData.instructions || null,
              TaskURL: assignmentData.TaskURL || null,
              Course_Name: undefined,
            })
            setLoading(false)
            return
          }
        } catch (e) {
          console.log('Assignment not found by AssignmentID, trying Assessment_ID...')
        }
        
        // If not found by AssignmentID, try to get by Assessment_ID using assignmentService
        // This will use the new GetAssignmentByAssessmentID procedure
        if (user?.University_ID) {
          try {
            const assignmentData = await assignmentService.getAssignmentById(
              parseInt(assignmentId),
              user.University_ID,
              sectionId || undefined,
              courseId || undefined
            )
            if (assignmentData && assignmentData.AssignmentID) {
              // Convert Assignment to AdminAssignment format
              setAssignment({
                AssignmentID: assignmentData.AssignmentID,
                Course_ID: assignmentData.Course_ID?.toString() || courseId || '',
                Semester: assignmentData.Semester || '',
                MaxScore: assignmentData.MaxScore || null,
                accepted_specification: assignmentData.accepted_specification || null,
                submission_deadline: assignmentData.submission_deadline || null,
                instructions: assignmentData.instructions || null,
                TaskURL: assignmentData.TaskURL || null,
                Course_Name: undefined,
              })
              setLoading(false)
              return
            }
          } catch (e) {
            console.error('Error loading assignment by Assessment_ID:', e)
          }
        }
        
        // If still not found, set to null but still show the form
        setAssignment(null)
      } catch (error) {
        console.error('Error loading assignment:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadAssignment()
  }, [assignmentId, courseId, sectionId, user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }
  
  const handleBack = () => {
    // Navigate back to course section if courseId and sectionId are available
    if (courseId && sectionId) {
      navigate(ROUTES.SECTION_DETAIL
        .replace(':courseId', courseId)
        .replace(':sectionId', sectionId)
      )
    } else {
      // Fallback to assignments list
      navigate(ROUTES.ASSIGNMENTS)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !assignmentId || !user) return

    setSubmitting(true)
    try {
      const result = await assignmentService.submitAssignment(
        parseInt(assignmentId),
        file,
        user.University_ID
      )
      if (result.success) {
        setSubmitted(true)
        setTimeout(() => {
          handleBack()
        }, 2000)
      } else {
        alert(result.error || t('assignmentSubmit.failedToSubmit'))
      }
    } catch (error) {
      console.error('Error submitting assignment:', error)
      alert(t('errors.submissionFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto border border-[#e5e7e7] rounded-xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-[#1f1d39]">{t('assignmentSubmit.submissionSuccessful')}</h2>
              <p className="text-[#85878d]">{t('assignmentSubmit.redirecting')}</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className={cn(
            "text-[#85878d] dark:text-gray-400",
            getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
          )}>{t('common.loading')}</p>
        </div>
      </DashboardLayout>
    )
  }

  const deadline = assignment?.submission_deadline ? new Date(assignment.submission_deadline) : null
  const isOverdue = deadline && deadline < new Date()

  return (
    <DashboardLayout 
      title={t('assignmentSubmit.title')}
      subtitle={t('assignmentSubmit.subtitle')}
    >
      <div className="space-y-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={handleBack}
          className={cn(
            "mb-4",
            neoBrutalismMode
              ? "border-4 border-[#1a1a1a] dark:border-[#FFFBEB] bg-white dark:bg-[#2a2a2a] rounded-none shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,251,235,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,251,235,1)]"
              : "border border-[#e5e7e7] hover:bg-gray-50"
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {courseId && sectionId ? t('assignmentSubmit.backToCourse') : t('assignmentSubmit.backToAssignments')}
        </Button>

        {/* Assignment Information Card */}
        {assignment && (
          <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
            <CardHeader>
              <CardTitle className={cn(
                "text-xl text-[#1f1d39] dark:text-white",
                getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
              )}>
                {assignment.instructions || t('assignments.assignment')}
              </CardTitle>
              {assignment.Course_Name && (
                <CardDescription className={cn(
                  "text-[#85878d] dark:text-gray-400",
                  getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                )}>
                  {assignment.Course_Name} • {assignment.Semester}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {assignment.MaxScore && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#85878d] dark:text-gray-400" />
                    <div>
                      <p className={cn(
                        "text-xs text-[#85878d] dark:text-gray-400",
                        getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                      )}>{t('assignments.maxScore')}</p>
                      <p className={cn(
                        "text-sm font-semibold text-[#1f1d39] dark:text-white",
                        getNeoBrutalismTextClasses(neoBrutalismMode, 'bold')
                      )}>{assignment.MaxScore}</p>
                    </div>
                  </div>
                )}
                {deadline && (
                  <div className="flex items-center gap-2">
                    <Clock className={cn(
                      "h-4 w-4",
                      isOverdue ? "text-red-600 dark:text-red-400" : "text-[#85878d] dark:text-gray-400"
                    )} />
                    <div>
                      <p className={cn(
                        "text-xs text-[#85878d] dark:text-gray-400",
                        getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                      )}>{t('assignments.deadline')}</p>
                      <p className={cn(
                        "text-sm font-semibold",
                        isOverdue 
                          ? "text-red-600 dark:text-red-400"
                          : "text-[#1f1d39] dark:text-white",
                        getNeoBrutalismTextClasses(neoBrutalismMode, 'bold')
                      )}>
                        {format(deadline, 'MMM dd, yyyy HH:mm')}
                        {isOverdue && (
                          <Badge variant="destructive" className="ml-2">
                            {t('assignments.overdue')}
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {assignment.accepted_specification && (
                <div>
                  <p className={cn(
                    "text-xs text-[#85878d] dark:text-gray-400 mb-1",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                  )}>{t('assignments.format')}</p>
                  <Badge variant="outline">{assignment.accepted_specification}</Badge>
                </div>
              )}
              
              {assignment.instructions && (
                <div>
                  <p className={cn(
                    "text-xs text-[#85878d] dark:text-gray-400 mb-2",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                  )}>{t('assignments.instructions') || 'Instructions'}</p>
                  <p className={cn(
                    "text-sm text-[#1f1d39] dark:text-white whitespace-pre-wrap",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                  )}>{assignment.instructions}</p>
                </div>
              )}
              
              {assignment.TaskURL && (
                <div className="pt-2 border-t border-[#e5e7e7] dark:border-[#333]">
                  <p className={cn(
                    "text-xs text-[#85878d] dark:text-gray-400 mb-2",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                  )}>{t('admin.taskURL')}</p>
                  <a
                    href={assignment.TaskURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline",
                      neoBrutalismMode
                        ? "border-4 border-[#1a1a1a] dark:border-[#FFFBEB] bg-white dark:bg-[#2a2a2a] rounded-none shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,251,235,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,251,235,1)]"
                        : "border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20",
                      getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    <span>{t('admin.taskURL')}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submit Form Card */}
        <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
          <CardHeader>
            <CardTitle className={cn(
              "text-xl text-[#1f1d39] dark:text-white",
              getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
            )}>{t('assignmentSubmit.title')}</CardTitle>
            <CardDescription className={cn(
              "text-[#85878d] dark:text-gray-400",
              getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
            )}>{t('assignmentSubmit.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file" className={cn(
                  "text-[#676767] dark:text-gray-400",
                  getNeoBrutalismTextClasses(neoBrutalismMode, 'bold')
                )}>{t('assignmentSubmit.selectFile')}</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  className={cn(
                    "cursor-pointer",
                    neoBrutalismMode
                      ? "border-4 border-[#1a1a1a] dark:border-[#FFFBEB] rounded-none"
                      : "border-[#e5e7e7]"
                  )}
                />
                {file && (
                  <p className={cn(
                    "text-sm text-[#85878d] dark:text-gray-400",
                    getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
                  )}>
                    {t('assignmentSubmit.selected')}: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={!file || submitting}
                  className={cn(
                    "flex-1",
                    neoBrutalismMode
                      ? getNeoBrutalismButtonClasses(neoBrutalismMode, 'primary', "hover:bg-gray-800 dark:hover:bg-gray-200")
                      : "bg-black hover:bg-gray-800 text-white"
                  )}
                >
                  {submitting ? (
                    t('assignmentSubmit.submitting')
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {t('assignmentSubmit.submit')}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className={cn(
                    neoBrutalismMode
                      ? getNeoBrutalismButtonClasses(neoBrutalismMode, 'outline', "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]")
                      : "border-[#e5e7e7] hover:bg-gray-50"
                  )}
                >
                  {t('assignmentSubmit.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


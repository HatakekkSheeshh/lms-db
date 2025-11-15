import { useEffect, useState } from 'react'
import { format, startOfWeek, addDays, getDay } from 'date-fns'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { scheduleService } from '@/lib/api/scheduleService'
import { useAuth } from '@/context/AuthProvider'
import type { ScheduleItem } from '@/lib/api/scheduleService'
import { Clock, MapPin, Building, BookOpen, Calendar as CalendarIcon, Video, StickyNote } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

const DAYS_MAP: Record<string, number> = {
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
  'Sunday': 0,
}

export default function SchedulePage() {
  const { user } = useAuth()
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [showTikTok, setShowTikTok] = useState(false)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [currentNote, setCurrentNote] = useState('')

  useEffect(() => {
    const loadSchedule = async () => {
      if (!user) return
      
      try {
        const data = await scheduleService.getSchedule(user.University_ID)
        setSchedule(data)
      } catch (error) {
        console.error('Error loading schedule:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSchedule()
  }, [user])

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('schedule-notes')
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes))
      } catch (error) {
        console.error('Error loading notes:', error)
      }
    }
  }, [])

  // Save notes to localStorage
  const saveNote = (date: Date, note: string) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const newNotes = { ...notes, [dateKey]: note }
    setNotes(newNotes)
    localStorage.setItem('schedule-notes', JSON.stringify(newNotes))
  }

  const handleSaveNote = () => {
    saveNote(selectedDate, currentNote)
    setNoteDialogOpen(false)
  }

  const handleDeleteNote = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    const newNotes = { ...notes }
    delete newNotes[dateKey]
    setNotes(newNotes)
    localStorage.setItem('schedule-notes', JSON.stringify(newNotes))
    setNoteDialogOpen(false)
  }

  // Get dates that have classes
  const getDatesWithClasses = (): Date[] => {
    const dates: Date[] = []
    const today = new Date()
    const startDate = startOfWeek(today, { weekStartsOn: 1 }) // Monday
    const endDate = addDays(startDate, 6 * 7) // 6 weeks ahead

    for (let d = new Date(startDate); d <= endDate; d = addDays(d, 1)) {
      const dayOfWeek = getDay(d) === 0 ? 7 : getDay(d) // Convert Sunday (0) to 7
      const dayName = Object.keys(DAYS_MAP).find(
        key => DAYS_MAP[key] === dayOfWeek
      )

      if (dayName && schedule.some(item => item.Day === dayName)) {
        dates.push(new Date(d))
      }
    }

    return dates
  }

  // Get classes for selected date
  const getClassesForDate = (date: Date): ScheduleItem[] => {
    const dayOfWeek = getDay(date) === 0 ? 7 : getDay(date) // Convert Sunday (0) to 7
    const dayName = Object.keys(DAYS_MAP).find(
      key => DAYS_MAP[key] === dayOfWeek
    )

    if (!dayName) return []

    return schedule.filter(item => item.Day === dayName)
  }

  const selectedDateClasses = getClassesForDate(selectedDate)
  const datesWithClasses = getDatesWithClasses()

  // Get dates with notes
  const getDatesWithNotes = (): Date[] => {
    return Object.keys(notes).map(dateKey => {
      const [year, month, day] = dateKey.split('-').map(Number)
      return new Date(year, month - 1, day)
    })
  }

  const datesWithNotes = getDatesWithNotes()

  // Custom modifiers for calendar
  const modifiers = {
    hasClasses: datesWithClasses,
    hasNotes: datesWithNotes,
    selected: selectedDate,
  }

  const modifiersClassNames = {
    hasClasses: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-[#3bafa8] dark:after:bg-[#3bafa8] after:rounded-full',
    hasNotes: 'relative before:absolute before:top-1 before:right-1 before:w-2 before:h-2 before:bg-yellow-400 dark:before:bg-yellow-500 before:rounded-full',
  }

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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#211c37] dark:text-white mb-2">
            Lịch học
          </h1>
          <p className="text-[#85878d] dark:text-gray-400">
            Xem lịch học và quản lý thời gian biểu của bạn
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* First Month Calendar */}
              <Card className="border border-[#e5e7e7] dark:border-[#333] bg-white dark:bg-[#1a1a1a] rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#e1e2f6] dark:bg-[#2a2a2a] rounded-lg flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-[#211c37] dark:text-white">
                      {format(currentMonth, 'MMMM yyyy')}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  month={currentMonth}
                  onMonthChange={(date) => {
                    setCurrentMonth(date)
                  }}
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  className="rounded-lg border-0"
                  classNames={{
                    day: "h-10 w-10 text-[#211c37] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a]",
                    day_selected: "bg-black dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-white",
                    day_today: "bg-[#f5f7f9] dark:bg-[#2a2a2a] font-semibold",
                    day_outside: "text-[#85878d] dark:text-gray-500 opacity-50",
                    day_disabled: "text-[#85878d] dark:text-gray-500 opacity-30",
                    month_caption: "text-[#211c37] dark:text-white font-semibold flex items-center justify-center",
                    weekday: "text-[#676767] dark:text-gray-400 font-medium text-center flex-1",
                    weekdays: "flex w-full",
                    week: "flex w-full",
                    table: "w-full border-collapse table-fixed",
                    nav_button: "text-[#211c37] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a]",
                  }}
                />
              </CardContent>
              </Card>

              {/* Second Card - TikTok or Calendar with Notes */}
              <Card className="border border-[#e5e7e7] dark:border-[#333] bg-white dark:bg-[#1a1a1a] rounded-2xl flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {showTikTok ? (
                      <>
                        <div className="w-10 h-10 bg-[#ff0050] dark:bg-[#ff0050] rounded-lg flex items-center justify-center">
                          <Video className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-[#211c37] dark:text-white">
                            TikTok
                          </CardTitle>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                          <StickyNote className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-[#211c37] dark:text-white">
                            Ghi chú
                          </CardTitle>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#676767] dark:text-gray-400">Ghi chú</span>
                    <Switch
                      checked={showTikTok}
                      onCheckedChange={setShowTikTok}
                    />
                    <span className="text-sm text-[#676767] dark:text-gray-400">TikTok</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {showTikTok ? (
                  <div className="flex-1 overflow-hidden rounded-b-2xl bg-black">
                    <iframe
                      src="https://www.tiktok.com/foryou"
                      className="w-full h-full min-h-[600px] border-0"
                      allow="encrypted-media; autoplay; clipboard-write; microphone; camera; fullscreen; picture-in-picture"
                      allowFullScreen
                      title="TikTok Feed"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation"
                    />
                  </div>
                ) : (
                  <div className="p-6 space-y-4">
                    {/* Add Note Button */}
                    <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setCurrentNote('')
                            setNoteDialogOpen(true)
                          }}
                          className="w-full bg-[#3bafa8] hover:bg-[#2a8d87] text-white"
                        >
                          <StickyNote className="h-4 w-4 mr-2" />
                          Thêm ghi chú mới
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white dark:bg-[#1a1a1a] border-[#e5e7e7] dark:border-[#333]">
                        <DialogHeader>
                          <DialogTitle className="text-[#211c37] dark:text-white">
                            {currentNote && notes[format(selectedDate, 'yyyy-MM-dd')] ? 
                              `Sửa ghi chú cho ${format(selectedDate, 'dd/MM/yyyy')}` : 
                              'Thêm ghi chú mới'}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="note-date" className="text-[#211c37] dark:text-white">
                              Ngày
                            </Label>
                            <Input
                              id="note-date"
                              type="date"
                              value={format(selectedDate, 'yyyy-MM-dd')}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const date = new Date(e.target.value)
                                setSelectedDate(date)
                                setCurrentNote(notes[format(date, 'yyyy-MM-dd')] || '')
                              }}
                              className="mt-2 border-[#e5e7e7] dark:border-[#333] bg-white dark:bg-[#2a2a2a] text-[#211c37] dark:text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="note" className="text-[#211c37] dark:text-white">
                              Nội dung ghi chú
                            </Label>
                            <Textarea
                              id="note"
                              value={currentNote}
                              onChange={(e) => setCurrentNote(e.target.value)}
                              placeholder="Nhập ghi chú của bạn..."
                              className="mt-2 border-[#e5e7e7] dark:border-[#333] bg-white dark:bg-[#2a2a2a] text-[#211c37] dark:text-white"
                              rows={5}
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            {notes[format(selectedDate, 'yyyy-MM-dd')] && (
                              <Button
                                variant="destructive"
                                onClick={handleDeleteNote}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Xóa
                              </Button>
                            )}
                            <Button
                              onClick={handleSaveNote}
                              className="bg-[#3bafa8] hover:bg-[#2a8d87] text-white"
                            >
                              Lưu
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Notes List */}
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {Object.keys(notes).length === 0 ? (
                        <div className="text-center py-8 text-[#85878d] dark:text-gray-400">
                          <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Chưa có ghi chú nào</p>
                        </div>
                      ) : (
                        Object.entries(notes)
                          .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                          .map(([dateKey, note]) => {
                            const [year, month, day] = dateKey.split('-').map(Number)
                            const noteDate = new Date(year, month - 1, day)
                            return (
                              <div
                                key={dateKey}
                                className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <StickyNote className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                    <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                                      {format(noteDate, 'dd/MM/yyyy')}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedDate(noteDate)
                                      setCurrentNote(note)
                                      setNoteDialogOpen(true)
                                    }}
                                    className="h-6 px-2 text-xs text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800"
                                  >
                                    Sửa
                                  </Button>
                                </div>
                                <p className="text-sm text-yellow-800 dark:text-yellow-200 whitespace-pre-wrap">
                                  {note}
                                </p>
                              </div>
                            )
                          })
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              </Card>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#3bafa8]"></div>
                <span className="text-[#676767] dark:text-gray-400">Có lớp học</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-500"></div>
                <span className="text-[#676767] dark:text-gray-400">Có ghi chú</span>
              </div>
            </div>
          </div>

          {/* Classes List Section */}
          <div>
            <Card className="border border-[#e5e7e7] dark:border-[#333] bg-white dark:bg-[#1a1a1a] rounded-2xl h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f8efe2] dark:bg-[#2a2a2a] rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-[#211c37] dark:text-white">
                      {format(selectedDate, 'EEEE, dd/MM/yyyy')}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedDateClasses.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateClasses.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 border border-[#e5e7e7] dark:border-[#333] rounded-xl bg-[#f5f7f9] dark:bg-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg text-[#211c37] dark:text-white">
                            {item.Course_Name}
                          </h3>
                          <Badge className="bg-[#3bafa8] text-white border-0">
                            Section {item.Section_ID}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-[#676767] dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>{item.Time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#676767] dark:text-gray-400">
                            <Building className="h-4 w-4" />
                            <span>{item.Building}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#676767] dark:text-gray-400">
                            <MapPin className="h-4 w-4" />
                            <span>Phòng {item.Room}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-[#85878d] dark:text-gray-400" />
                    <p className="text-[#85878d] dark:text-gray-400">
                      Không có lớp học trong ngày này
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Overview */}
        {schedule.length > 0 && (
          <Card className="border border-[#e5e7e7] dark:border-[#333] bg-white dark:bg-[#1a1a1a] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-[#211c37] dark:text-white">
                Tổng quan tuần
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                  const dayClasses = schedule.filter(item => item.Day === day)
                  const dayNameVi = {
                    'Monday': 'Thứ 2',
                    'Tuesday': 'Thứ 3',
                    'Wednesday': 'Thứ 4',
                    'Thursday': 'Thứ 5',
                    'Friday': 'Thứ 6',
                    'Saturday': 'Thứ 7',
                    'Sunday': 'Chủ nhật',
                  }[day]

                  if (dayClasses.length === 0) return null

                  return (
                    <div
                      key={day}
                      className="p-4 border border-[#e5e7e7] dark:border-[#333] rounded-xl bg-[#f5f7f9] dark:bg-[#2a2a2a]"
                    >
                      <h3 className="font-semibold text-[#211c37] dark:text-white mb-3">
                        {dayNameVi}
                      </h3>
                      <div className="space-y-2">
                        {dayClasses.map((item, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-[#676767] dark:text-gray-400"
                          >
                            <div className="font-medium text-[#211c37] dark:text-white">
                              {item.Course_Name}
                            </div>
                            <div className="text-xs mt-1">
                              {item.Time} • {item.Building}-{item.Room}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

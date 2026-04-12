"use client"

import { useState } from "react"
import { Calendar, momentLocalizer, Views } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { BIZ_UDGothic } from "next/font/google"
import {
  BookOpen,
  FlaskConical,
  GraduationCap,
  Heart,
  Stethoscope,
  UserCheck,
  Zap,
  Clock,
  User,
  CalendarIcon,
} from "lucide-react"

moment.locale("ja")
const localizer = momentLocalizer(moment)

const bizUdGothic = BIZ_UDGothic({
  weight: ["400", "700"],
  subsets: ["latin"],
  preload: true,
  variable: "--font-biz-ud-gothic",
})

// 日本の祝日リスト（2025年分）
const holidays = [
  "2025-01-01",
  "2025-01-13",
  "2025-02-11",
  "2025-02-23",
  "2025-03-20",
  "2025-04-29",
  "2025-05-03",
  "2025-05-04",
  "2025-05-05",
  "2025-05-06",
  "2025-07-21",
  "2025-08-11",
  "2025-09-15",
  "2025-09-23",
  "2025-10-13",
  "2025-11-03",
  "2025-11-23",
  "2025-11-24",
  "2025-12-23",
]

const isHoliday = (date: Date): boolean => {
  const formattedDate = moment(date).format("YYYY-MM-DD")
  return holidays.includes(formattedDate)
}

const getEventIcon = (title: string, periods: string) => {
  if (periods === "試験") return <GraduationCap size={10} />
  if (periods?.includes("模試")) return <BookOpen size={10} />
  if (title === "マイスタディ" || title === "自宅学習") return <UserCheck size={10} />
  if (periods?.startsWith("実習")) return <FlaskConical size={10} />
  if (title?.includes("解剖")) return <Heart size={10} />
  if (title?.includes("生理")) return <Stethoscope size={10} />
  if (title?.includes("救急")) return <Zap size={10} />
  return <BookOpen size={10} />
}

const getEventClass = (title: string, periods: string): string => {
  if (periods === "試験") return "event-exam"
  if (periods?.includes("模試")) return "event-mock-exam"
  return "event-default"
}

type ScheduleItem = {
  日付: string
  時限: string
  [key: string]: any
}

type CalendarFilter = {
  year: string
  class: string
}

type CalendarEvent = {
  title: string
  start: Date
  end: Date
  periods: string
  teacher?: string
  timeSlot: string
  resource: ScheduleItem
  isExam: boolean
}

type CalendarViewProps = {
  data: ScheduleItem[]
  filter: CalendarFilter
}

export default function CalendarView({ data, filter }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.日付)
    const dateB = new Date(b.日付)
    if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime()
    return a.時限.localeCompare(b.時限)
  })

  const events = sortedData
    .filter((item) => {
      const content = item[`${filter.year}年${filter.class}クラスの授業内容`]
      const periods = item[`${filter.year}年${filter.class}クラスコマ数`]
      return content || periods
    })
    .map((item) => {
      const date = new Date(item.日付)
      const content = item[`${filter.year}年${filter.class}クラスの授業内容`]
      const periods = item[`${filter.year}年${filter.class}クラスコマ数`]
      const teacher = item[`${filter.year}年${filter.class}クラス担当講師名`]
      const isExam = periods === "試験"

      return {
        title: isExam ? `${content} 試験` : content,
        start: date,
        end: date,
        periods: periods,
        teacher: teacher,
        timeSlot: item.時限,
        resource: item,
        isExam: isExam,
      }
    })

  const messages = {
    allDay: "終日",
    previous: "前へ",
    next: "次へ",
    today: "今日",
    month: "月",
    noEventsInRange: "この期間にイベントはありません。",
  }

  const customDayPropGetter = (date: Date) => {
    const dayOfWeek = date.getDay()
    const isSaturday = dayOfWeek === 6
    const isSunday = dayOfWeek === 0
    const isHolidayDate = isHoliday(date)

    let className = ""
    if (isSaturday) className += " saturday"
    if (isSunday || isHolidayDate) className += " sunday holiday"

    return {
      className: cn(
        className,
        isSaturday && "text-blue-600",
        (isSunday || isHolidayDate) && "text-red-600",
      ),
      style: {
        backgroundColor: isSaturday
          ? "#eff6ff"
          : isSunday || isHolidayDate
            ? "#fef2f2"
            : undefined,
      },
    }
  }

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const eventClass = getEventClass(event.title, event.periods)
    const icon = getEventIcon(event.title, event.periods)

    return (
      <div
        className={cn("calendar-event", eventClass)}
        style={{
          border: "none",
          outline: "none",
          boxShadow: "none",
        }}
        onClick={(e) => {
          e.stopPropagation()
          setSelectedEvent(event)
        }}
      >
        <span className="calendar-event-icon">{icon}</span>
        <span className="calendar-event-title">{event.title}</span>
      </div>
    )
  }

  const customDateHeader = ({ date, label }: { date: Date; label: string }) => {
    const dayOfWeek = date.getDay()
    const isSaturday = dayOfWeek === 6
    const isSunday = dayOfWeek === 0
    const isHolidayDate = isHoliday(date)

    return (
      <div
        className={cn(
          "flex items-center justify-center h-full font-medium text-sm",
          isSaturday && "text-blue-600",
          (isSunday || isHolidayDate) && "text-red-600",
        )}
      >
        {label}
      </div>
    )
  }

  return (
    <div className={`calendar-shell rounded-[1.3rem] border border-white/70 bg-white/70 p-2 shadow-[0_16px_36px_rgba(15,23,42,0.08)] sm:rounded-[1.8rem] sm:p-3 sm:shadow-[0_20px_50px_rgba(15,23,42,0.08)] ${bizUdGothic.variable}`}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{
          height: "800px",
          fontSize: "0.75rem",
        }}
        messages={messages}
        view={Views.MONTH}
        views={[Views.MONTH]}
        formats={{
          monthHeaderFormat: (date) => moment(date).format("YYYY年M月"),
        }}
        dayPropGetter={customDayPropGetter}
        components={{
          event: EventComponent,
          month: {
            dateHeader: customDateHeader,
          },
        }}
        popup={false}
        showAllEvents
      />

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="dialog-content max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              {selectedEvent && getEventIcon(selectedEvent.title, selectedEvent.periods)}
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>
              <div className="mt-4 space-y-3 text-slate-700">
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} className="text-slate-500" />
                  <span className="font-medium">時限:</span>
                  <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-semibold text-[#1f5eff]">
                    {selectedEvent?.timeSlot}
                  </span>
                </div>

                {selectedEvent?.teacher && (
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-slate-500" />
                    <span className="font-medium">担当講師:</span>
                    <span className="rounded-full bg-[#effaf6] px-3 py-1 text-xs font-semibold text-[#0f766e]">
                      {selectedEvent.teacher}
                    </span>
                  </div>
                )}

                {selectedEvent?.periods && (
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon size={14} className="text-slate-500" />
                    <span className="font-medium">コマ数:</span>
                    <span className="rounded-full bg-[#fff1e8] px-3 py-1 text-xs font-semibold text-[#a14c1f]">
                      {selectedEvent.periods}
                    </span>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

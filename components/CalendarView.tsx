"use client"

import { useState } from "react"
import { Calendar, momentLocalizer, Views } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { M_PLUS_Rounded_1c } from "next/font/google"
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

// かわいい丸みのあるフォントに変更
const mplusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  preload: true,
  variable: "--font-mplus-rounded",
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
  if (periods === "試験") return <GraduationCap size={12} />
  if (periods?.includes("模試")) return <BookOpen size={12} />
  if (title === "マイスタディ" || title === "自宅学習") return <UserCheck size={12} />
  if (periods?.startsWith("実習")) return <FlaskConical size={12} />
  if (title?.includes("解剖")) return <Heart size={12} />
  if (title?.includes("生理")) return <Stethoscope size={12} />
  if (title?.includes("救急")) return <Zap size={12} />
  return <BookOpen size={12} />
}

const getEventClass = (title: string, periods: string): string => {
  if (periods === "試験") return "event-exam"
  if (periods?.includes("模試")) return "event-mock-exam"
  if (title === "マイスタディ" || title === "自宅学習") return "event-my-study"
  if (periods?.startsWith("実習")) return "event-practice"
  if (title?.includes("演習")) return "event-exercise"
  if (title?.includes("講義")) return "event-lecture"
  if (title?.includes("解剖")) return "event-anatomy"
  if (title?.includes("生理")) return "event-physiology"
  if (title?.includes("救急")) return "event-emergency"
  if (title?.includes("外傷")) return "event-trauma"
  return "event-default"
}

export default function CalendarView({ data, filter }) {
  const [selectedEvent, setSelectedEvent] = useState(null)

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
    const isToday = moment(date).isSame(moment(), "day")

    let className = ""
    if (isSaturday) className += " saturday"
    if (isSunday || isHolidayDate) className += " sunday holiday"

    return {
      className: cn(
        className,
        isSaturday && "text-blue-600",
        (isSunday || isHolidayDate) && "text-red-600",
        isToday && "font-bold",
      ),
      style: {
        backgroundColor: isToday
          ? "#fef3c7"
          : isSaturday
            ? "#eff6ff"
            : isSunday || isHolidayDate
              ? "#fef2f2"
              : undefined,
        minHeight: 120,
      },
    }
  }

  const EventComponent = ({ event }) => {
    const eventClass = getEventClass(event.title, event.periods)
    const icon = getEventIcon(event.title, event.periods)

    return (
      <div
        className={cn("calendar-event", eventClass)}
        onClick={(e) => {
          e.stopPropagation()
          setSelectedEvent(event)
        }}
      >
        {icon}
        <span className="truncate flex-1">{event.title}</span>
      </div>
    )
  }

  const customDateHeader = ({ date, label }) => {
    const dayOfWeek = date.getDay()
    const isSaturday = dayOfWeek === 6
    const isSunday = dayOfWeek === 0
    const isHolidayDate = isHoliday(date)
    const isToday = moment(date).isSame(moment(), "day")

    return (
      <div
        className={cn(
          "flex items-center justify-center h-full font-medium",
          isSaturday && "text-blue-600",
          (isSunday || isHolidayDate) && "text-red-600",
          isToday && "bg-yellow-200 rounded-full w-8 h-8 mx-auto",
        )}
      >
        {label}
      </div>
    )
  }

  // カレンダーの高さを画面サイズに合わせて調整
  return (
    <div
      className={`h-[calc(100vh-200px)] bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-3 ${mplusRounded.variable}`}
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{
          height: "100%",
          fontSize: "0.8rem",
        }}
        messages={messages}
        view={Views.MONTH}
        views={[Views.MONTH]}
        formats={{
          monthHeaderFormat: (date, culture, localizer) => localizer.format(date, "YYYY年M月", culture),
          dayFormat: (date, culture, localizer) => {
            const day = localizer.format(date, "ddd", culture)
            const dayNum = localizer.format(date, "D", culture)
            if (day === "土") return <span className="text-blue-600 font-medium text-sm">{dayNum}</span>
            if (day === "日") return <span className="text-red-600 font-medium text-sm">{dayNum}</span>
            return <span className="font-medium text-sm">{dayNum}</span>
          },
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
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {selectedEvent && getEventIcon(selectedEvent.title, selectedEvent.periods)}
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} className="text-gray-500" />
                  <span className="font-medium">時限:</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {selectedEvent?.timeSlot}
                  </span>
                </div>

                {selectedEvent?.teacher && (
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-gray-500" />
                    <span className="font-medium">担当講師:</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {selectedEvent.teacher}
                    </span>
                  </div>
                )}

                {selectedEvent?.periods && (
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon size={14} className="text-gray-500" />
                    <span className="font-medium">コマ数:</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
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

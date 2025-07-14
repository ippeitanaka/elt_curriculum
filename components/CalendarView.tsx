"use client"

import { useState } from "react"
import { Calendar, momentLocalizer, Views } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { M_PLUS_Rounded_1c } from "next/font/google"

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

const getEventColor = (title: string, periods: string): string => {
  if (periods === "試験") return "text-red-800"
  if (title === "マイスタディ" || title === "自宅学習") return "text-sky-800"
  if (periods && periods.startsWith("実習")) return "text-pink-800"
  if (!title) return "text-gray-600"

  if (title.includes("演習")) return "text-purple-800"
  if (title.includes("講義")) return "text-blue-800"
  if (title.includes("解剖")) return "text-green-800"
  if (title.includes("生理")) return "text-yellow-800"
  if (title.includes("救急")) return "text-orange-800"
  if (title.includes("外傷")) return "text-indigo-800"

  return "text-gray-600"
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
      const isExam = periods === "試験"
      return {
        title: isExam ? `${content} 試験` : content,
        start: date,
        end: date,
        periods: periods,
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

    return {
      className: cn(isSaturday && "text-blue-600", (isSunday || isHolidayDate) && "text-red-600"),
      style: {
        backgroundColor: isSaturday
          ? "rgba(59, 130, 246, 0.1)"
          : isSunday || isHolidayDate
            ? "rgba(239, 68, 68, 0.1)"
            : undefined,
        height: 90,
      },
    }
  }

  const EventComponent = ({ event }) => {
    const colorClass = getEventColor(event.title, event.periods)
    return (
      <div
        className={cn(
          "calendar-event text-[0.4rem] sm:text-[0.5rem] py-0 px-0.5 w-full bg-white",
          colorClass,
          event.isExam && "bg-red-100 font-semibold",
          (event.title === "マイスタディ" || event.title === "自宅学習") && "bg-sky-100",
        )}
        onClick={(e) => {
          e.stopPropagation()
          setSelectedEvent(event)
        }}
      >
        <span className="truncate block">{event.title}</span>
      </div>
    )
  }

  return (
    <div className={`h-[calc(100vh-6rem)] bg-white rounded-lg shadow-lg overflow-hidden ${mplusRounded.variable}`}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{
          height: "100%",
          fontSize: "0.9rem",
        }}
        messages={messages}
        view={Views.MONTH}
        views={[Views.MONTH]}
        formats={{
          monthHeaderFormat: (date, culture, localizer) => localizer.format(date, "YYYY年M月", culture),
          dayFormat: (date, culture, localizer) => {
            const day = localizer.format(date, "ddd", culture)
            if (day === "土") return <span className="text-blue-600">{localizer.format(date, "D", culture)}</span>
            if (day === "日") return <span className="text-red-600">{localizer.format(date, "D", culture)}</span>
            return localizer.format(date, "D", culture)
          },
        }}
        dayPropGetter={customDayPropGetter}
        components={{
          event: EventComponent,
        }}
        popup={false}
        showAllEvents
      />
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="bg-white rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              <div className="space-y-2 mt-2">
                <p className="text-sm">
                  <span className="font-medium">時限:</span> {selectedEvent?.timeSlot}
                </p>
                <p className="text-sm">
                  <span className="font-medium">コマ数:</span> {selectedEvent?.periods}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

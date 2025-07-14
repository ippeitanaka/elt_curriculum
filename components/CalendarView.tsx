"use client"

import { useState } from "react"
import { Calendar, momentLocalizer, Views, type Event } from "react-big-calendar"
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

// かわいい丸みのあるフォント
const mplusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  preload: true,
  variable: "--font-mplus-rounded",
})

// 日本の祝日（2025）
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

const isHoliday = (date: Date) => holidays.includes(moment(date).format("YYYY-MM-DD"))

/* ---------- アイコンとクラス ---------- */
const getEventIcon = (title?: string, periods?: string) => {
  if (periods === "試験") return <GraduationCap size={10} />
  if (periods?.includes("模試")) return <BookOpen size={10} />
  if (title === "マイスタディ" || title === "自宅学習") return <UserCheck size={10} />
  if (periods?.startsWith("実習")) return <FlaskConical size={10} />
  if (title?.includes("解剖")) return <Heart size={10} />
  if (title?.includes("生理")) return <Stethoscope size={10} />
  if (title?.includes("救急")) return <Zap size={10} />
  return <BookOpen size={10} />
}

const getEventClass = (periods?: string) => {
  if (periods === "試験") return "event-exam"
  if (periods?.includes("模試")) return "event-mock-exam"
  return "event-default"
}

/* ----------  メインコンポーネント ---------- */
type ScheduleItem = Record<string, any>

interface Props {
  data: ScheduleItem[]
  filter: { year: string; class: string }
}

export default function CalendarView({ data, filter }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  /* ---- イベント配列を生成 ---- */
  const events = data
    .filter((row) => {
      const content = row[`${filter.year}年${filter.class}クラスの授業内容`]
      const periods = row[`${filter.year}年${filter.class}クラスコマ数`]
      return content || periods
    })
    .map((row) => {
      const date = new Date(row.日付)
      const title = row[`${filter.year}年${filter.class}クラスの授業内容`] as string | undefined
      const periods = row[`${filter.year}年${filter.class}クラスコマ数`] as string | undefined
      const teacher = row[`${filter.year}年${filter.class}クラス担当講師名`] as string | undefined
      return {
        title,
        start: date,
        end: date,
        periods,
        teacher,
        timeSlot: row.時限,
      }
    })

  /* ---- 祝日・土日の背景 ---- */
  const dayPropGetter = (date: Date) => {
    const dow = date.getDay()
    const isSat = dow === 6
    const isSun = dow === 0
    const isHol = isHoliday(date)
    const isToday = moment(date).isSame(moment(), "day")

    return {
      className: cn(isSat && "text-blue-600", (isSun || isHol) && "text-red-600", isToday && "font-bold"),
      style: {
        backgroundColor: isToday ? "#fef3c7" : isSat ? "#eff6ff" : isSun || isHol ? "#fef2f2" : undefined,
      },
    }
  }

  /* ---- イベント毎にスタイルを注入 ---- */
  const eventPropGetter = (_: any, _start: Date, _end: Date, _isSel: boolean) => {
    return {
      className: cn("calendar-event", getEventClass(_.periods)),
      style: {
        border: "none",
        outline: "none",
        boxShadow: "none",
      },
    }
  }

  /* ---- カスタムイベントレンダラー ---- */
  const EventRenderer = ({ event }: { event: any }) => (
    <div className="flex items-center gap-1 truncate">
      <span className="calendar-event-icon">{getEventIcon(event.title, event.periods)}</span>
      <span className="truncate flex-1">{event.title}</span>
    </div>
  )

  return (
    <div
      className={`h-[calc(100vh-90px)] bg-gradient-to-br from-slate-50 to-blue-50 rounded p-1 ${mplusRounded.variable}`}
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={Views.MONTH}
        views={[Views.MONTH]}
        dayPropGetter={dayPropGetter}
        eventPropGetter={eventPropGetter}
        components={{
          event: EventRenderer,
        }}
        popup={false}
        messages={{
          allDay: "終日",
          previous: "前へ",
          next: "次へ",
          today: "今日",
          month: "月",
          noEventsInRange: "この期間にイベントはありません。",
        }}
        formats={{
          monthHeaderFormat: (date, culture, loc) => loc.format(date, "YYYY年M月", culture),
          dayFormat: (date, culture, loc) => loc.format(date, "D", culture),
        }}
        style={{ height: "100%", fontSize: "0.75rem" }}
        onSelectEvent={(ev) => setSelectedEvent(ev)}
      />

      {/* ---------- モーダル ---------- */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="dialog-content max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {selectedEvent && getEventIcon(selectedEvent.title, selectedEvent.periods)}
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-2 mt-3 text-sm">
                {selectedEvent?.timeSlot && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-500" />
                    <span>時限:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                      {selectedEvent.timeSlot}
                    </span>
                  </div>
                )}
                {selectedEvent?.teacher && (
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-500" />
                    <span>担当講師:</span>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                      {selectedEvent.teacher}
                    </span>
                  </div>
                )}
                {selectedEvent?.periods && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={14} className="text-gray-500" />
                    <span>コマ数:</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
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

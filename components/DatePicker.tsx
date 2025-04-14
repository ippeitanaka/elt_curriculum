"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

export default function DatePicker({ selectedDate, onDateChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onDateChange(newDate)
    setIsOpen(false)
  }

  const formatDate = (date) => {
    return format(date, "yyyy年MM月dd日 (eee)", { locale: ja })
  }

  return (
    <div className="relative">
      <div
        className="flex items-center justify-between border-2 border-pink-200 rounded-lg p-2 cursor-pointer bg-white hover:bg-pink-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-4 w-4 text-pink-500" />
          <span className="text-sm text-gray-700">{selectedDate ? formatDate(selectedDate) : "日付を選択"}</span>
        </div>
        <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">タップして変更</span>
      </div>

      {isOpen && (
        <div className="absolute mt-1 p-3 bg-white border-2 border-pink-200 rounded-lg shadow-lg z-10 w-full">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-pink-100 rounded-full text-pink-600"
              aria-label="前月"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-sm font-medium text-gray-700">
              {format(currentMonth, "yyyy年MM月", { locale: ja })}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-pink-100 rounded-full text-pink-600"
              aria-label="翌月"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["日", "月", "火", "水", "木", "金", "土"].map((day, index) => (
              <div
                key={day}
                className={`p-1 font-medium ${index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-600"}`}
              >
                {day}
              </div>
            ))}

            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="p-1"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1
              const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const isSelected =
                selectedDate &&
                currentDate.getDate() === selectedDate.getDate() &&
                currentDate.getMonth() === selectedDate.getMonth() &&
                currentDate.getFullYear() === selectedDate.getFullYear()

              const isToday =
                currentDate.getDate() === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()

              const dayOfWeek = currentDate.getDay()
              const isSunday = dayOfWeek === 0
              const isSaturday = dayOfWeek === 6

              return (
                <div
                  key={day}
                  className={`p-1 cursor-pointer rounded-full text-center ${
                    isSelected
                      ? "bg-pink-500 text-white font-bold"
                      : isToday
                        ? "bg-pink-100 text-pink-700 font-medium"
                        : isSunday
                          ? "text-red-500 hover:bg-pink-50"
                          : isSaturday
                            ? "text-blue-500 hover:bg-pink-50"
                            : "hover:bg-pink-50"
                  }`}
                  onClick={() => handleDateClick(day)}
                >
                  {day}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

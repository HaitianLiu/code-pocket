import distanceInWordsToNow from 'date-fns/distance_in_words_to_now'
import differenceInCalendarDays from 'date-fns/difference_in_calendar_days'
import { format } from 'date-fns'

function formatNumber (n) {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

export function formatTime (date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const t1 = [year, month, day].map(formatNumber).join('/')
  const t2 = [hour, minute, second].map(formatNumber).join(':')

  return `${t1} ${t2}`
}

export function formatDateDifference (time) {
  // 获取与当前时间的天数差
  let distanceToNowNum = differenceInCalendarDays(new Date(), time)

  if (distanceToNowNum <= 30) {
    let words = distanceInWordsToNow(time)
    if (words.indexOf('day') !== -1) {
      return words + ' ago'
    }
    return words
  }
  return format(time, 'MMM DD, YYYY')
}

export function getDateLastWeek () {
  var currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - 7)
  var year = currentDate.getFullYear()
  var month = currentDate.getMonth() + 1
  var day = currentDate.getDate()

  if (month < 10) {
    month = '0' + month
  }

  if (day < 10) {
    day = '0' + day
  }

  return year + '-' + month + '-' + day
}

export function formatFigure (num) {
  // 换算千以上的数字，用于展示star数量
  // 1300=1.3k
  if (num < 1000) {
    return num
  } else if (num >= 1000) {
    return Math.round(num / 100) / 10 + 'k'
  }
}

export default {
  formatNumber,
  formatTime
}

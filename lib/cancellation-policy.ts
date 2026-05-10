export type CancellationPolicy = "flexible" | "moderate" | "strict"

export interface RefundPreview {
  policy: CancellationPolicy
  refundPercent: number
  refundAmount: number
}

export function calculateRefundPreview({
  policy,
  price,
  bookingDate,
  now = new Date(),
}: {
  policy: CancellationPolicy
  price: number
  bookingDate: string
  now?: Date
}): RefundPreview {
  const startOfBookingDay = new Date(`${bookingDate}T00:00:00`)
  const hoursUntilBooking = (startOfBookingDay.getTime() - now.getTime()) / (1000 * 60 * 60)

  let refundPercent = 0

  if (policy === "flexible") {
    refundPercent = hoursUntilBooking >= 24 ? 100 : 50
  } else if (policy === "moderate") {
    refundPercent = hoursUntilBooking >= 24 * 7 ? 100 : hoursUntilBooking >= 24 ? 50 : 0
  } else {
    refundPercent = hoursUntilBooking >= 24 * 7 ? 50 : 0
  }

  return {
    policy,
    refundPercent,
    refundAmount: Number(((price * refundPercent) / 100).toFixed(2)),
  }
}

export function isFutureBooking(bookingDate: string) {
  return new Date(`${bookingDate}T23:59:59`).getTime() > Date.now()
}

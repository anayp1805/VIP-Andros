export async function refundPayment(bookingId: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return {
    bookingId,
    refunded: true,
  }
}

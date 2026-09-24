// The booking dialog's open handle. Its own module rather than an export from BookingDialog.tsx,
// because Button imports this and BookingDialog imports Button — same file would be an import cycle.
//
// getElementById rather than context or a store: the dialog is mounted once in the frontend layout
// and lives for the app's whole life, so there is exactly one, and a provider would put every
// section that carries a CTA under a client boundary for a value that never changes.
export const BOOKING_DIALOG_ID = 'booking-dialog'

export function openBooking() {
  const el = document.getElementById(BOOKING_DIALOG_ID)
  // showModal (not `open = true`) is the whole reason this is a <dialog>: it puts the panel in the
  // browser's top layer, which escapes <header>'s z-50 stacking context, makes the rest of the page
  // inert, traps focus and wires ESC — all the things NavMenu.tsx hand-rolls for its sheet.
  if (el instanceof HTMLDialogElement && !el.open) el.showModal()
}

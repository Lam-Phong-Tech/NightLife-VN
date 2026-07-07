# Admin Telegram Notifications

P0 notifications go to the Admin Telegram group after the database action succeeds.
Each message includes a short template, key business fields, one CMS link, and one Web link.

## Environment

```env
TELEGRAM_BOT_TOKEN=""
TELEGRAM_ADMIN_CHAT_ID=""
TELEGRAM_CHAT_ID=""
TELEGRAM_OPS_CHAT_ID=""
TELEGRAM_ADMIN_THREAD_ID=""
TELEGRAM_NOTIFICATION_TIME_ZONE="Asia/Bangkok"
CMS_BASE_URL="http://localhost:3000"
WEB_BASE_URL="http://localhost:3000"
```

`TELEGRAM_ADMIN_CHAT_ID` is the preferred admin group id. `TELEGRAM_CHAT_ID` and `TELEGRAM_OPS_CHAT_ID` are accepted as compatibility fallbacks for environments that already had booking notifications running.

If `TELEGRAM_BOT_TOKEN` or every admin chat id is missing, the action still succeeds and `notification_logs` records the Telegram row as `FAILED`.

## Templates

| Event             | Template key                          | Trigger                                                                                                                                                                  | CMS link                            | Web link           |
| ----------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | ------------------ |
| Booking new       | `telegram.admin.booking.created.v1`   | `POST /bookings`, `POST /member/bookings`                                                                                                                                | `/admin?tab=bookings&bookingId=...` | `/stores/:slug`    |
| Booking cancelled | `telegram.admin.booking.cancelled.v1` | `PATCH /bookings/:bookingId/cancel`, `PATCH /member/bookings/:bookingId/cancel`, `PATCH /admin/bookings/:bookingId/cancel`, `PATCH /operator/bookings/:bookingId/cancel` | `/admin?tab=bookings&bookingId=...` | `/stores/:slug`    |
| Bill new          | `telegram.admin.bill.submitted.v1`    | `POST /member/bills`                                                                                                                                                     | `/admin?tab=bills&billId=...`       | `/stores/:slug`    |
| Bill approved     | `telegram.admin.bill.verified.v1`     | `PATCH /admin/sensitive-bills/:billId/review` with `approve=true`                                                                                                        | `/admin?tab=bills&billId=...`       | `/stores/:slug`    |
| Bill rejected     | `telegram.admin.bill.rejected.v1`     | `PATCH /admin/sensitive-bills/:billId/review` with `approve=false`                                                                                                       | `/admin?tab=bills&billId=...`       | `/stores/:slug`    |
| Partner request   | `telegram.admin.partner.requested.v1` | `POST /partner-requests`                                                                                                                                                 | `/admin?tab=partners&requestId=...` | `/dang-ky-doi-tac` |

## Message Shape

```text
[P0] Booking moi
Booking: booking_01
Quan: Luna Lounge
Khach: Minh Nguyen (VIP) - +84901234567
Thoi gian: 30/06/2026 20:00
So khach: 4
Cast: Yuna
Ghi chu: Can phong VIP
CMS: http://localhost:3000/admin?tab=bookings&bookingId=booking_01
Web: http://localhost:3000/stores/luna-lounge
```

The same structure is used for bill and partner request events, with fields adjusted to the event.

Booking cancellation notifications are sent only after a successful cancellation route. Guest/member self-cancel requests inside the 1 hour cancellation cutoff return 422 and do not create an Admin cancellation notification. Admin/Operator can cancel on behalf of a customer with a reason after store access checks; completed, checked-in, no-show, and already-cancelled bookings still return 422.

Customer-facing booking status notifications are queued separately in `notification_logs`: `customer.booking.cancelled.v1`, `customer.booking.checked_in.v1`, and `customer.booking.completed.v1`. LINE OA is the preferred guest channel, in-app is used for member accounts, and Mail remains the support fallback for manual Admin contact.

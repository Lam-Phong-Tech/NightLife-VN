# LINE Login setup

## URLs to register in LINE Developers

- Callback URL: `https://demonightlight.test9.io.vn/api/backend/auth/line/callback`
- Privacy policy URL: `https://demonightlight.test9.io.vn/legal`
- Email consent screenshot URL: `https://demonightlight.test9.io.vn/line-email-consent`

## Deploy environment variables

Set these on the backend/server deploy environment. Do not commit the real channel secret to git.

```env
LINE_CHANNEL_ID=2010552841
LINE_CHANNEL_SECRET=<set in deploy secret manager>
LINE_CALLBACK_URL=https://demonightlight.test9.io.vn/api/backend/auth/line/callback
WEB_BASE_URL=https://demonightlight.test9.io.vn
```

## Email permission request

Open `/line-email-consent`, tick the consent checkbox, and capture a screenshot that clearly shows:

- The app asks before collecting the user's email from LINE.
- The app explains email is used for login, account management, bookings, offers, and account security.
- The app links to the privacy policy.

After LINE approves email permission, the login URL should request the `profile openid email` scopes and the backend callback will create or sign in a member account from the verified LINE email.

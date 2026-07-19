# Email Send Microservice

Internal NestJS service for sending transactional HTML email through SMTP.

## API

### `GET /email/health`

Unauthenticated health check.

```json
{
  "status": "OK",
  "service": "Email Send Microservice"
}
```

### `POST /email/send`

Sends an email and requires the shared API key in
`X-Internal-API-Key`.

```json
{
  "to": "recipient@example.com",
  "subject": "Appointment update",
  "html": "<p>Your appointment was updated.</p>",
  "fromName": "Barber"
}
```

`fromName` is optional. When omitted, the service uses `MAIL_FROM_NAME`.
The legacy `X-Api-Key` header remains supported for existing consumers.

## Environment

Copy `.env.example` to `.env` and configure:

```env
PORT=3001
INTERNAL_API_KEY=generate-a-shared-internal-api-key
MAIL_HOST=smtp.example.com
MAIL_USER=your-smtp-user
MAIL_PASSWORD=your-smtp-password
MAIL_FROM=notifications@example.com
MAIL_FROM_NAME=Email Notifications
MAIL_PORT=587
MAIL_SECURE=false
```

Use `MAIL_SECURE=true` with port `465` and `MAIL_SECURE=false` with port
`587`.

## Barber integration

Run this service on port `3001` and configure `barber-back` with:

```env
EMAIL_SERVICE_URL=http://localhost:3001
EMAIL_SERVICE_API_KEY=the_same_value_as_INTERNAL_API_KEY
EMAIL_SERVICE_TIMEOUT_MS=5000
EMAIL_FROM_NAME=Barber
```

`barber-back` sends branded appointment creation and cancellation templates
through `POST /email/send`. Template rendering and appointment lifecycle rules
remain in `barber-back`; this service is responsible only for validating the
request, authenticating the caller, and delivering the email.

## Install

```bash
pnpm install
```

## Run

```bash
pnpm run start:dev
```

Production:

```bash
pnpm run build
pnpm run start:prod
```

## Validate

```bash
pnpm exec jest --runInBand
pnpm run build
pnpm exec eslint "src/**/*.ts"
```

Email requests use a global validation pipe with unknown properties rejected.
The send endpoint rejects missing or invalid internal API keys.

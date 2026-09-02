# Email Send Microservice — Club de Tenis Quintero

Microservicio desarrollado con [NestJS](https://nestjs.com/) para el envío de correos electrónicos a través de [Resend](https://resend.com/) (vía SMTP). El endpoint de envío está protegido mediante una API key interna que se valida por header.

## Stack

- **NestJS 10**
- **@nestjs-modules/mailer** + **nodemailer** (transporte SMTP)
- **@nestjs/config** (variables de entorno)
- **@nestjs/swagger** (documentación de la API)
- **class-validator** / **class-transformer** (validación de DTOs)

## Requisitos

- Node.js 22.x
- npm
- Una cuenta de [Resend](https://resend.com/) con un **dominio verificado** (por ejemplo `serviciosasm.cl`). El `MAIL_FROM` debe pertenecer a ese dominio.

## Instalación

```bash
npm ci
```

## Variables de entorno

Copia `.env.example` como `.env` y configura las siguientes variables:

| Variable           | Ejemplo                       | Descripción                                            |
| ------------------ | ----------------------------- | ------------------------------------------------------ |
| `PORT`             | `3001`                        | Puerto del servicio; sin configurar usa `3000`.        |
| `INTERNAL_API_KEY` | `tu-api-key-interna`          | Clave esperada en `X-Internal-API-Key`.                |
| `MAIL_HOST`        | `smtp.resend.com`             | Host SMTP de Resend.                                   |
| `MAIL_PORT`        | `587`                         | Puerto SMTP (587 con STARTTLS).                        |
| `MAIL_SECURE`      | `false`                       | `false` para el puerto 587.                            |
| `MAIL_USER`        | `resend`                      | Usuario SMTP de Resend (valor fijo `resend`).          |
| `MAIL_PASSWORD`    | `re_xxxxxxxxxxxxxxxxxxxxxxxx` | API Key de Resend.                                     |
| `MAIL_FROM`        | `no-reply@serviciosasm.cl`    | Email remitente (debe estar en un dominio verificado). |
| `MAIL_FROM_NAME`   | `Reserva Horarios`            | Nombre visible del remitente.                          |

### Ejemplo de `.env`

```env
PORT=3001
INTERNAL_API_KEY=tu-api-key-interna

MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=resend
MAIL_PASSWORD=re_xxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=no-reply@serviciosasm.cl
MAIL_FROM_NAME=Reserva Horarios
```

> **Nota:** El correo se envía con el formato `"MAIL_FROM_NAME" <MAIL_FROM>` (por ejemplo `"Reserva Horarios" <no-reply@serviciosasm.cl>`). El dominio de `MAIL_FROM` debe estar verificado en Resend.

Usa `MAIL_SECURE=true` con el puerto `465` y `MAIL_SECURE=false` con el puerto `587`.

## Ejecución

```bash
# modo desarrollo (watch)
npm run start:dev

# modo normal
npm run start

# modo producción
npm run start:prod
```

## Endpoints

### `GET /email/health`

Health check del servicio. No requiere autenticación.

**Respuesta 200:**

```json
{
  "status": "OK",
  "service": "Email Send Microservice"
}
```

### `POST /email/send`

Envía un correo electrónico. Requiere el header `X-Internal-API-Key`. El header anterior `X-Api-Key` continúa disponible para consumidores existentes.

**Headers:**

- `Content-Type: application/json`
- `X-Internal-API-Key: <INTERNAL_API_KEY>`

**Body:**

| Campo      | Tipo     | Requerido | Descripción                                         |
| ---------- | -------- | --------- | --------------------------------------------------- |
| `to`       | `string` | Sí        | Email del destinatario.                             |
| `subject`  | `string` | Sí        | Asunto del correo.                                  |
| `html`     | `string` | Sí        | Contenido del correo en HTML.                       |
| `text`     | `string` | No        | Alternativa del contenido en texto plano.           |
| `fromName` | `string` | No        | Nombre visible del remitente, máximo 80 caracteres. |

**Respuesta 201:**

```json
{
  "message": "Email sent successfully"
}
```

## Ejemplos con cURL

### Health check

```bash
curl -i http://localhost:3001/email/health
```

### Enviar un email

```bash
curl -i -X POST http://localhost:3001/email/send \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: tu-api-key-interna" \
  -d '{
    "to": "destinatario@example.com",
    "subject": "Prueba de envío",
    "html": "<h1>Hola</h1><p>Este es un correo de prueba.</p>",
    "text": "Hola. Este es un correo de prueba.",
    "fromName": "Reserva Horarios"
  }'
```

### Petición sin API key válida (401)

```bash
curl -i -X POST http://localhost:3001/email/send \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: clave-incorrecta" \
  -d '{"to":"a@b.com","subject":"x","html":"<p>x</p>"}'
```

Las solicitudes usan validación global: los campos desconocidos son rechazados y una API key ausente o inválida responde con `401`.

## Integración con otro backend

Ejecuta este servicio en el puerto `3001` y configura el backend consumidor con:

```env
EMAIL_SERVICE_URL=http://localhost:3001
EMAIL_SERVICE_API_KEY=el_mismo_valor_de_INTERNAL_API_KEY
EMAIL_SERVICE_TIMEOUT_MS=5000
EMAIL_FROM_NAME=Nombre de la aplicación
```

El backend consumidor mantiene sus plantillas y reglas de negocio. Este servicio valida y autentica la solicitud y entrega el correo mediante SMTP.

## Tests

```bash
# tests unitarios
npm test

# tests e2e
npm run test:e2e

# cobertura
npm run test:cov
```

## Deployment

El proyecto incluye un `Procfile` para plataformas tipo Heroku/Railway:

```
web: npm run start:prod
```

Asegúrate de configurar todas las variables de entorno en la plataforma de despliegue.

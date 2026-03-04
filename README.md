# ParqueAndo — Monorepo (Backend + Frontend)

Proyecto tipo Airbnb para gestión de parqueaderos: publicación, búsqueda, reservas y pagos.

## Estructura
- `backend/` → Spring Boot + MySQL + JWT + Cloudinary
- `frontend/` → Angular + Ionic + Capacitor
- `docs/` → SRS, SDD, GitFlow, CI/CD, evidencias

## Ejecutar Backend
Ver: `backend/README.md`

## Ejecutar Frontend
Ver: `frontend/README.md`

## GitFlow (GCS)
- `main`: versión estable (release)
- `develop`: integración
- `feature/*`: desarrollo por funcionalidad
- `release/*`: preparación de versión

Ver detalle: `docs/GITFLOW.md`

## Tecnologías

### Backend
- Java 17
- Spring Boot
- Spring Security + JWT
- MySQL
- Flyway
- Cloudinary

### Frontend
- Angular
- Ionic
- Capacitor
- TypeScript

## Funcionalidades

- Registro de usuarios
- Autenticación con JWT
- Registro de vehículos
- Registro de parqueaderos
- Subida de imágenes de parqueaderos
- Búsqueda de parqueaderos disponibles
- Creación de reservas
- Confirmación y cancelación de reservas
- Registro de pagos


## Arquitectura

Arquitectura cliente-servidor basada en API REST.

Frontend (Angular + Ionic)
↓
API REST
↓
Backend (Spring Boot)
↓
Base de datos MySQL
↓
Cloudinary para almacenamiento de imágenes

## Flujo principal

1. El usuario se registra o inicia sesión.
2. El sistema genera un token JWT.
3. El usuario puede buscar parqueaderos disponibles.
4. Selecciona fechas y crea una reserva.
5. Se registra el pago asociado a la reserva.

## API

La API REST expone endpoints para:

- autenticación
- usuarios
- parqueaderos
- reservas
- pagos

Swagger disponible en:

http://localhost:8081/swagger-ui.html


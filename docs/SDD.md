# SDD — ParqueAndo (Diseño)

## Arquitectura
- Frontend: Angular + Ionic + Capacitor
- Backend: Spring Boot REST API
- DB: MySQL
- Imágenes: Cloudinary

## Componentes
- Auth: register/login/me (JWT)
- Usuarios: perfil + roles
- Parqueaderos: CRUD + imágenes
- Reservas: crear/confirmar/cancelar
- Pagos: registrar pago por reserva

## Seguridad
- Authorization: Bearer <token>
- Interceptor en frontend para adjuntar JWT

# SRS — ParqueAndo (Resumen)

## 1. Propósito
ParqueAndo permite a propietarios publicar parqueaderos y a conductores buscar, reservar y pagar.

## 2. Alcance
- Registro/Login (JWT)
- Gestión de parqueaderos (con imágenes)
- Búsqueda/listado (incluye mapa)
- Reservas (fechas, cálculo de precio)
- Pagos asociados a reservas

## 3. Actores
- Conductor
- Propietario
- Administrador (opcional)

## 4. Requisitos funcionales (RF)
- RF01: Registrar usuario (conductor/propietario)
- RF02: Autenticación y autorización JWT
- RF03: Crear/editar parqueadero
- RF04: Subir imágenes de parqueadero (Cloudinary)
- RF05: Listar parqueaderos
- RF06: Crear reserva indicando fechas
- RF07: Calcular precio total de reserva
- RF08: Registrar pago por reserva

## 5. Requisitos no funcionales (RNF)
- RNF01: Seguridad por JWT
- RNF02: API documentada con Swagger
- RNF03: Persistencia en MySQL
- RNF04: Trazabilidad mediante GitFlow + PRs

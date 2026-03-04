# ParqueAndo (Modelo Airbnb) — Backend Spring Boot + MySQL + Cloudinary

## Requisitos
- Java 17+
- Maven 3.9+
- Docker (opcional) para levantar MySQL con docker-compose

## 1) Levantar MySQL (opcional)
```bash
docker compose up -d
```

## 2) Configurar variables
Crea un archivo `.env` (o exporta variables) con tus credenciales de Cloudinary:

```bash
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
JWT_SECRET=pon-aqui-una-clave-larga-y-segura
```

## 3) Ejecutar
```bash
mvn spring-boot:run
```

Swagger UI:
- http://localhost:8080/swagger-ui.html

## 4) Flujo recomendado
1. `POST /api/auth/register`
2. `POST /api/auth/login`  -> usa `Authorization: Bearer <token>`
3. Crear vehículo, parqueadero, imágenes
4. Crear reserva
5. Registrar pago

## Notas
- La base de datos se crea vía Flyway (`src/main/resources/db/migration/V1__init.sql`).
- Ajusta `application.yml` si tu MySQL corre en otra IP/puerto.

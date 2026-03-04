# GitFlow — Evidencia GCS (ParqueAndo)

## Ramas
- **main**: versión estable (solo recibe merges desde release)
- **develop**: rama de integración
- **feature/***: ramas por funcionalidad (desde develop)
- **release/***: preparación de versión (desde develop)

## Flujo
1. Crear Issue (GitHub)
2. Crear rama `feature/...` desde `develop`
3. Commits pequeños y descriptivos
4. PR hacia `develop` + revisión
5. Crear `release/vX.Y.Z` desde `develop`
6. PR release → `main`
7. Tag `vX.Y.Z` en main

## Convención de commits
- `feat:` nueva funcionalidad
- `fix:` corrección
- `docs:` documentación
- `chore:` mantenimiento

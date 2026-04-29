# Deploy Gratis: Render + Neon

Esta es la opcion gratuita mas simple para este proyecto:
- **Backend API** en Render (free web service).
- **PostgreSQL** en Neon (free tier).

## 1) Crear base de datos en Neon

1. Entra a [Neon](https://neon.tech/) y crea una cuenta gratis.
2. Crea un proyecto y copia el `connection string` (URI PostgreSQL).
3. Debe verse similar a:
   `postgresql://USER:PASSWORD@HOST/DB?sslmode=require`

## 2) Desplegar backend en Render

1. Entra a [Render](https://render.com/) con GitHub.
2. Selecciona **New +** -> **Blueprint**.
3. Escoge este repositorio (Render usara `render.yaml`).
4. Completa variables pendientes:
   - `DATABASE_URL` = URI de Neon
   - `CORS_ORIGIN` = URL de tu app Expo/web (puedes poner varias separadas por coma)
5. Render desplegara `backend/` y validara `/health`.

## 3) Ajustar mobile para apuntar a API cloud

En `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=https://TU-SERVICIO.onrender.com/api/v1
```

Luego:
```bash
cd mobile
npm run start
```

## 4) Verificar flujo MVP en produccion

1. Login.
2. Crear permiso.
3. Aprobar como lider (pasa a `PENDIENTE_JEFE`).
4. Aprobar/rechazar como jefe.
5. Ver historial:
   `GET /api/v1/documentos/:idDocumento/historial`

## 5) Nota del plan gratuito

- Render free puede entrar en sleep por inactividad (primer request tarda mas).
- Neon free tiene limites mensuales, suficientes para MVP interno/pruebas.

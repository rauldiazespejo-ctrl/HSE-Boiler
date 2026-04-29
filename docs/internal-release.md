# HSE Maestranza - Operacion Interna

## 1) Variables de entorno

### Backend
1. Copiar `backend/.env.example` a `backend/.env`.
2. Configurar DB y JWT.
3. Mantener `ALLOW_PUBLIC_REGISTER=false` en operacion interna.

### Mobile
1. Copiar `mobile/.env.example` a `mobile/.env`.
2. Ajustar `EXPO_PUBLIC_API_URL` a la URL interna del backend.

## 2) Arranque local

### Backend
```bash
cd backend
npm install
npm run start
```

### Mobile
```bash
cd mobile
npm install
npm run start
```

## 3) Pruebas criticas minimas

```bash
cd backend
npm test
```

Casos cubiertos:
- Health endpoint.
- Bloqueo de rutas protegidas sin JWT.
- Bloqueo de registro cuando no hay privilegios administrativos.

## 4) Flujo operativo validado

1. Login con usuario lider.
2. Crear permiso (estado inicial `PENDIENTE_LIDER`).
3. Aprobar como lider (estado cambia a `PENDIENTE_JEFE`).
4. Aprobar/rechazar como jefe (estado final `APROBADO` o `RECHAZADO`).
5. Revisar historial desde `GET /api/v1/documentos/:idDocumento/historial`.

## 5) Distribucion interna Android

Requiere EAS CLI:
```bash
npm install -g eas-cli
```

Desde `mobile/`:
```bash
npm run build:android:internal
```

La salida genera APK/AAB para distribucion corporativa interna (MDM o instalacion directa).

# 🔐 Análisis de Endpoints de Autenticación - DecorLujo API

Basado en la documentación de la API de **https://decorlujo.com/server_api/api/documentation**

## 📊 **Información General de la API**

- **Base URL**: `https://decorlujo.com/server_api/api`
- **Título**: Store Management API
- **Descripción**: API completa para gestión de tiendas, usuarios, categorías, productos y configuraciones
- **Versión**: OpenAPI 3.0.0

## 🔑 **Sistema de Autenticación**

### **Esquemas de Seguridad**

1. **ApiKeyAuth**
   - **Tipo**: API Key
   - **Ubicación**: Header
   - **Descripción**: API Key requerida para identificar la tienda

2. **BearerTokenAuth**
   - **Tipo**: HTTP Bearer Token
   - **Esquema**: bearer
   - **Formato**: JWT
   - **Descripción**: Token de autenticación de usuario (Bearer Token)

## 🌐 **Endpoints de Autenticación**

### **1. Registro de Usuario**
```http
POST /api/register
```

**Descripción**: Registra un nuevo usuario (cliente o administrador) en el sistema

**Headers Requeridos**:
- `ApiKeyAuth`: API Key de la tienda

**Request Body** (JSON):
```json
{
  "name": "string",
  "email": "string",
  "password": "string", 
  "password_confirmation": "string",
  "role": "string",
  "store_id": "integer"
}
```

**Respuestas**:
- **200**: Usuario registrado exitosamente
  ```json
  {
    "status": "success",
    "message": "Usuario registrado exitosamente",
    "user": {
      "id": "integer",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "token": "string"
  }
  ```

---

### **2. Inicio de Sesión**
```http
POST /api/login
```

**Descripción**: Autentica un usuario (cliente o administrador) y devuelve un token de acceso

**Headers Requeridos**:
- `ApiKeyAuth`: API Key de la tienda

**Request Body** (JSON):
```json
{
  "email": "string",
  "password": "string"
}
```

**Respuestas**:
- **200**: Autenticación exitosa
  ```json
  {
    "status": "success", 
    "message": "Inicio de sesión exitoso",
    "user": {
      "id": "integer",
      "name": "string", 
      "email": "string",
      "role": "string"
    },
    "token": "string"
  }
  ```

---

### **3. Cerrar Sesión**
```http
POST /api/logout
```

**Descripción**: Cierra la sesión del usuario y revoca el token actual

**Headers Requeridos**:
- `ApiKeyAuth`: API Key de la tienda
- `BearerTokenAuth`: Token de usuario autenticado

**Respuestas**:
- **200**: Sesión cerrada exitosamente

---

### **4. Obtener Perfil del Usuario**
```http
GET /api/profile
```

**Descripción**: Obtiene la información del perfil del usuario autenticado

**Headers Requeridos**:
- `ApiKeyAuth`: API Key de la tienda
- `BearerTokenAuth`: Token de usuario autenticado

---

### **5. Solicitar Reseteo de Contraseña**
```http
POST /api/password/forgot
```

**Descripción**: Solicita un token para resetear la contraseña

**Headers Requeridos**:
- `ApiKeyAuth`: API Key de la tienda

**Request Body** (JSON):
```json
{
  "email": "string"
}
```

---

### **6. Restablecer Contraseña**
```http
POST /api/password/reset
```

**Descripción**: Restablece la contraseña del usuario usando un token

**Headers Requeridos**:
- `ApiKeyAuth`: API Key de la tienda

**Request Body** (JSON):
```json
{
  "email": "string",
  "token": "string",
  "password": "string",
  "password_confirmation": "string"
}
```

## 🔄 **Flujo de Autenticación Recomendado**

### **Para Login:**
1. **Obtener API Key** de la tienda
2. **POST `/api/login`** con email y password
3. **Guardar el token** devuelto en la respuesta
4. **Usar el token** en todas las peticiones subsiguientes como Bearer Token

### **Para Registro:**
1. **Obtener API Key** de la tienda
2. **POST `/api/register`** con datos del usuario
3. **Guardar el token** devuelto automáticamente
4. **Usar el token** en peticiones subsiguientes

### **Para Logout:**
1. **POST `/api/logout`** con ApiKey y BearerToken
2. **Limpiar token** del almacenamiento local
3. **Redirigir** a página de login

## 🛡️ **Consideraciones de Seguridad**

1. **Doble Autenticación**:
   - Se requiere tanto `ApiKeyAuth` como `BearerTokenAuth` para operaciones protegidas
   - `ApiKeyAuth` identifica la tienda
   - `BearerTokenAuth` autentica al usuario

2. **Gestión de Tokens**:
   - Los tokens parecen seguir el formato Laravel Sanctum (`1|abc123def456...`)
   - Se deben enviar en el header `Authorization: Bearer {token}`

3. **Roles de Usuario**:
   - El sistema maneja roles (`cliente`, `admin`)
   - Cada usuario está asociado a una `store_id`

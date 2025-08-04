# 📚 Difed Contratos - Backend API

Backend desarrollado con **Node.js + Express**, desplegado en **Google Cloud Run**, utilizando **Firebase Firestore + Storage** y **Nodemailer** para el envío de emails.

---

## 🔹 Tecnologías principales

- **Node.js + Express**  
- **Firebase Admin SDK**  
  - **Firestore** → almacenamiento de metadatos de contratos  
  - **Storage** → almacenamiento de PDFs con token de acceso  
- **Nodemailer (SMTP Gmail)** → envío de emails  
- **Multer (memoryStorage)** → manejo de uploads de archivos  
- **Axios** → descarga de PDFs para envío como adjunto  
- **Cloud Run** → despliegue sin servidor

---

## 🔹 Flujo completo de contrato

1️⃣ **Subir contrato (pendiente)**  
2️⃣ **Firmar contrato (firmado)**  
3️⃣ **Confirmar contrato (confirmado + envío final)**

Estados en Firestore:

- `pendiente` → Contrato subido, esperando firma  
- `firmado` → PDF firmado subido a Firebase Storage  
- `confirmado` → Firma confirmada, email final enviado

---

## 🔹 Endpoints principales

### 1️⃣ Subir contrato

**URL:**  
```
POST /contracts/upload
```

**Objetivo:**  
- Subir PDF a Firebase Storage  
- Crear registro en Firestore (`status: pendiente`)  
- Enviar email inicial para firma

**Body (form-data):**

| Key       | Value                    | Type  |
|---------- |--------------------------|-------|
| file      | PDF del contrato         | File  |
| email     | cliente@correo.com       | Text  |
| dni       | 12345678                 | Text  |
| nombre    | Diego                    | Text  |
| apellido  | Pérez                    | Text  |

**Ejemplo de respuesta (200 OK):**

```json
{
  "message": "Contrato cargado y enviado",
  "id": "abc123",
  "signUrl": "https://difed-contratos.web.app/signature/abc123",
  "version": "v4.0"
}
```

---

### 2️⃣ Firmar contrato

**URL:**  
```
POST /contracts/sign
```

**Objetivo:**  
- Sobrescribir el PDF firmado en Firebase Storage  
- Actualizar Firestore a `status: firmado`  

**Body (form-data):**

| Key          | Value                     | Type |
|------------- |---------------------------|------|
| file         | PDF firmado               | File |
| contractId   | abc123                    | Text |
| clarification| Opcional (ej: "Presencial")| Text |

**Ejemplo de respuesta:**

```json
{
  "message": "Contrato firmado correctamente",
  "signedUrl": "https://firebasestorage.googleapis.com/v0/b/...token=123"
}
```

---

### 3️⃣ Confirmar y enviar contrato

**URL:**  
```
POST /contracts/confirm-and-send
```

**Objetivo:**  
- Cambiar estado del contrato a `confirmado`  
- Enviar email final con contrato firmado adjunto

**Body (raw JSON):**

```json
{
  "contractId": "abc123",
  "email": "cliente@correo.com",
  "recipientName": "Diego"
}
```

**Ejemplo de respuesta:**

```json
{
  "message": "Contrato confirmado y enviado correctamente"
}
```

---

## 🔹 Emails enviados

### 1️⃣ Email inicial de firma
- **Asunto:**  
  `Estimado/a [Nombre], tiene un nuevo contrato para firmar`  

### 2️⃣ Email de confirmación
- **Asunto:**  
  `Contrato firmado - [Nombre Cliente]`  
- **Contenido:**  
  - Confirma que el contrato fue firmado y confirmado  
  - Incluye link de descarga  
  - Adjunta el PDF firmado  

---

## 🔹 Estructura de Firestore

**Colección:** `contracts`

```json
{
  "email": "cliente@correo.com",
  "dni": "12345678",
  "nombre": "Diego",
  "apellido": "Pérez",
  "filename": "ContratoVenta",
  "url": "https://firebasestorage.googleapis.com/...",
  "status": "pendiente | firmado | confirmado",
  "createdAt": "2025-08-03T12:00:00Z",
  "signedAt": null
}
```

---

## 🔹 Recomendaciones de desarrollo

- **Nombre de campo para archivos:** usar siempre `"file"` en form-data.  
- **Tokens de Storage:** cambiar al sobrescribir PDFs para forzar URL única.  
- **Liberar puertos rápidamente:**  
  - Windows: `taskkill /F /IM node.exe`  
  - Linux/Mac: `pkill node`  

---

**© 2025 Difed Contratos - Backend API**

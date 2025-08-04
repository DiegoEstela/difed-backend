#!/bin/bash

# Configuración del proyecto
PROJECT_ID="difed-contratos"
REGION="europe-west1"
SERVICE_NAME="contracts-backend"
IMAGE_NAME="contracts-backend"
TIMESTAMP=$(date +%s)

echo "🚀 Inicio de deploy para $SERVICE_NAME (sin borrar el servicio)"

# 1️⃣ Construir imagen sin cache con tag único
echo "🔨 Construyendo imagen con tag: $TIMESTAMP"
docker build --no-cache -t gcr.io/$PROJECT_ID/$IMAGE_NAME:$TIMESTAMP .

# 🔹 Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker no está corriendo. Abrí Docker Desktop antes de deployar."
  exit 1
fi

# 2️⃣ Subir imagen al registro
echo "⬆️  Subiendo imagen a GCR..."
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME:$TIMESTAMP

# 3️⃣ Deployar en Cloud Run (manteniendo la URL del servicio)
echo "🚀 Deployando en Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME:$TIMESTAMP \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

# 4️⃣ Mostrar URL del servicio
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo "✅ Deploy exitoso! URL del servicio: $SERVICE_URL"

# 5️⃣ Mostrar últimos logs
echo "📜 Logs recientes:"
gcloud run services logs read $SERVICE_NAME --region $REGION --limit 20

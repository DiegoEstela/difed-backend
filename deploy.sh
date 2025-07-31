#!/bin/bash

# Configuración del proyecto
PROJECT_ID="difed-contratos"
REGION="europe-west1"
SERVICE_NAME="contracts-backend"
IMAGE_NAME="contracts-backend"
TIMESTAMP=$(date +%s)

echo "🚀 Inicio de deploy limpio para $SERVICE_NAME"

# 1️⃣ Borrar servicio actual para limpiar revisiones viejas
echo "🗑️  Borrando servicio anterior (si existe)..."
gcloud run services delete $SERVICE_NAME --region $REGION --quiet || true

# 2️⃣ Construir imagen sin cache
echo "🔨 Construyendo imagen con tag único: $TIMESTAMP"
docker build --no-cache -t gcr.io/$PROJECT_ID/$IMAGE_NAME:$TIMESTAMP .

# 3️⃣ Subir imagen al registro
echo "⬆️  Subiendo imagen a GCR..."
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME:$TIMESTAMP

# 4️⃣ Deployar en Cloud Run
echo "🚀 Deployando en Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME:$TIMESTAMP \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

# 5️⃣ Mostrar URL del servicio
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo "✅ Deploy exitoso! URL del servicio: $SERVICE_URL"

# 6️⃣ Mostrar últimos logs para confirmar versión
echo "📜 Logs recientes:"
gcloud run services logs read $SERVICE_NAME --region $REGION --limit 20

# 7️⃣ Probar endpoint principal automáticamente
echo "🔎 Verificando endpoint /contracts/upload..."
curl -s -X POST "$SERVICE_URL/contracts/upload" || echo "⚠️ Endpoint no respondió correctamente"

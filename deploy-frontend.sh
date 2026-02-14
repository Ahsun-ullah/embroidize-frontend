#!/bin/bash

echo "🚀 Starting Zero-Downtime Cluster Deployment..."
echo "================================================"

# Configuration
DEPLOY_DIR="/var/www/embroidize-frontend"
cd $DEPLOY_DIR

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
if ! git pull origin main; then
    echo "❌ Git pull failed! Aborting deployment."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
if ! npm install; then
    echo "❌ npm install failed! Aborting deployment."
    git reset --hard HEAD@{1}  # Rollback git
    exit 1
fi

# Build production bundle
echo "🔨 Building production bundle..."
if ! npm run build; then
    echo "❌ Build failed! Aborting deployment."
    git reset --hard HEAD@{1}  # Rollback git
    exit 1
fi

# Copy files for standalone mode
echo "📋 Copying public and static files..."
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# Copy environment variables if needed
if [ -f .env.production ]; then
    cp .env.production .next/standalone/.env.production
fi

# Graceful cluster reload (zero downtime - reloads one instance at a time)
echo "🔄 Reloading cluster instances (zero downtime)..."
pm2 reload ecosystem.config.js --update-env

# Wait for reload to complete
sleep 3

# Verify all instances are online
if pm2 status | grep -q "errored.*embroidize-frontend"; then
    echo "❌ Some instances failed to start!"
    echo "📊 Check logs with: pm2 logs embroidize-frontend"
    exit 1
fi

# Show status
echo "================================================"
echo "✅ Deployment Complete!"
echo ""
pm2 status

echo ""
echo "📊 Recent logs:"
pm2 logs embroidize-frontend --lines 15 --nostream

echo ""
echo "================================================"
echo "🌐 Site: https://embroidize.com"
echo "📊 Live Logs: pm2 logs embroidize-frontend"
echo "📈 Monitor: pm2 monit"
echo "🔄 Rollback: git reset --hard HEAD~1 && ./deploy-frontend.sh"
echo "================================================"


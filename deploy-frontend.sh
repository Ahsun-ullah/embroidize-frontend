#!/bin/bash

# === Settings ===
PROJECT_DIR="/var/www/frontend/embroD"
PROJECT_NAME="embroD" # PM2 process name

echo "🚀 Deploying Frontend..."

# 1. Go to project directory
cd $PROJECT_DIR || { echo "❌ Project directory not found!"; exit 1; }

# 2. Pull latest code (if you're using Git)
 git pull origin main

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 4. Build the Next.js project
echo "🏗 Building project..."
npm run build

# 5. Restart or Start with PM2
echo "♻️ Restarting PM2 process..."
if pm2 list | grep -q $PROJECT_NAME; then
  pm2 restart $PROJECT_NAME
else
  pm2 start npm --name $PROJECT_NAME -- start
fi

# 6. Save PM2 process list
pm2 save

# 7. Reload Nginx (if needed)
# echo "🔁 Reloading Nginx..."
# sudo systemctl reload nginx

echo "✅ Frontend Deployed Successfully!"

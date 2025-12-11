#!/bin/bash

echo "========================================"
echo "   Auto-Installing Flutter for Vercel (FIXED v3)   "
echo "========================================"

# 1. Install Flutter
if [ -d "flutter" ]; then
  echo "Flutter exists, updating..."
  cd flutter
  git pull
  cd ..
else
  echo "Downloading Flutter..."
  git clone https://github.com/flutter/flutter.git -b stable --depth 1
fi

# 2. Add to Path
export PATH="$PATH:`pwd`/flutter/bin"

# 3. Check installation
flutter doctor -v

# 4. Build Web App
echo "Building Solven Shopper Web..."
flutter config --enable-web
flutter build web --release --base-href / --dart-define=API_URL=https://solventech-x4kp.onrender.com

echo "Build Complete!"

#!/bin/bash

echo "========================================"
echo "   Auto-Installing Flutter for Vercel (v4 - Stable 3.24.3)   "
echo "========================================"

# 1. Force Clean Install of Specific Version
# (Delete old 'flutter' folder to avoid version conflicts)
rm -rf flutter

echo "Downloading Flutter 3.24.3..."
git clone https://github.com/flutter/flutter.git -b 3.24.3 --depth 1

# 2. Add to Path
export PATH="$PATH:`pwd`/flutter/bin"

# 3. Check installation
flutter doctor -v

# 4. Build Web App
echo "Building Solven Shopper Web..."
flutter config --enable-web

# Using HTML renderer for maximum compatibility (Fixes white screen)
flutter build web --release --web-renderer html --base-href / --dart-define=API_URL=https://solventech-x4kp.onrender.com

echo "Build Complete!"

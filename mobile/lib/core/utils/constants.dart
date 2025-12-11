import 'dart:io';
import 'package:flutter/foundation.dart';

class AppConstants {
  static const String appName = 'Solven Shopper';
  
  static String get baseUrl {
    // 1. Check for build-time configuration (for Vercel/Production)
    const envUrl = String.fromEnvironment('API_URL');
    if (envUrl.isNotEmpty) return '$envUrl/api/v1';

    // 2. Development fallbacks
    if (kIsWeb) return 'http://localhost:3000/api/v1';
    if (Platform.isAndroid) return 'http://10.0.2.2:3000/api/v1';
    return 'http://localhost:3000/api/v1'; // Windows, iOS, macOS
  }
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
}

class ApiEndpoints {
  static const String login = '/auth/login'; // Start with login flow usually
  static const String register = '/auth/register';
  static const String verifyOtp = '/auth/verify-otp';
  static const String me = '/users/me';
}

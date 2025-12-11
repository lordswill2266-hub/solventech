import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

class StorageService {
  final FlutterSecureStorage _secureStorage;
  final SharedPreferences _prefs;

  StorageService(this._secureStorage, this._prefs);

  // Secure Storage (Tokens, Sensitive Data)
  Future<void> writeSecure(String key, String value) async {
    await _secureStorage.write(key: key, value: value);
  }

  Future<String?> readSecure(String key) async {
    return await _secureStorage.read(key: key);
  }

  Future<void> deleteSecure(String key) async {
    await _secureStorage.delete(key: key);
  }

  // Shared Preferences (Settings, Flags)
  Future<void> setBool(String key, bool value) async {
    await _prefs.setBool(key, value);
  }

  bool? getBool(String key) {
    return _prefs.getBool(key);
  }

  // User Data Helpers
  Future<void> saveUser(Map<String, dynamic> user) async {
    final userString = jsonEncode(user);
    await writeSecure(AppConstants.userKey, userString);
  }

  Future<Map<String, dynamic>?> getUser() async {
    final userString = await readSecure(AppConstants.userKey);
    if (userString != null) {
      try {
        return jsonDecode(userString) as Map<String, dynamic>;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}

import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/error/failures.dart';
import '../models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<String> login(String phoneNumber);
  Future<UserModel> verifyOtp(String phoneNumber, String otp);
  Future<UserModel> register(String phoneNumber, String firstName, String lastName, String role);
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final DioClient dioClient;

  AuthRemoteDataSourceImpl(this.dioClient);

  @override
  Future<String> login(String phoneNumber) async {
    try {
      final response = await dioClient.dio.post(
        '/auth/login',
        data: {'phoneNumber': phoneNumber},
      );
      // Assuming response contains a message or temp token. 
      // Adjust based on your backend: AuthService.login returns { message: 'OTP sent...', ... }
      return response.data['message'] ?? 'OTP sent successfully';
    } on DioException catch (e) {
      throw ServerFailure(e.response?.data['message'] ?? 'Login failed');
    }
  }

  @override
  Future<UserModel> verifyOtp(String phoneNumber, String otp) async {
    try {
      final response = await dioClient.dio.post(
        '/auth/verify-otp',
        data: {'phoneNumber': phoneNumber, 'otp': otp},
      );
      // Save token if present
      if (response.data['token'] != null) {
        // We can't access storage here easily without injecting it, or we rely on repo to do it.
        // Better design: Return a wrapper object or handle in repo. 
        // For simplicity let's stick to Repo handling storage, but DataSource needs to return token.
        // Let's modify UserModel or return a custom type. 
        // Wait, I can inject StorageService here too? No, usually Repo coordinates.
        // I'll return UserModel and attach token transiently? No.
        // I will change return type to Map or specific DTO.
        // Actually, let's rely on Repo. The response.data contains 'token'.
        // Repo needs to know about token.
      }
      return UserModel.fromJson(response.data['user']).copyWith(token: response.data['token']);
    } on DioException catch (e) {
      throw ServerFailure(e.response?.data['message'] ?? 'Verification failed');
    }
  }

  @override
  Future<UserModel> register(String phoneNumber, String firstName, String lastName, String role) async {
    try {
      final response = await dioClient.dio.post(
        '/auth/register',
        data: {
          'phoneNumber': phoneNumber,
          'firstName': firstName,
          'lastName': lastName,
          'role': role,
        },
      );
      // Depending on backend, this might return the created user or similar.
      // Assuming backend creates user and maybe sends OTP or returns 201.
      // If it returns { message: 'OTP sent', user: ... }
      // For now, let's map what we get or just return the user object if available.
      // If backend only sends message, we might need to adjust signature.
      // But let's assume it returns the created user for now.
      if (response.data['user'] != null) {
         return UserModel.fromJson(response.data['user']);
      } else {
        // Fallback or explicit separate flow needed if no user returned.
        // Let's assume we return a temporary user with the phone number 
        // to pass to next screen, or meaningful data.
         return UserModel(
          id: 'temp', 
          phoneNumber: phoneNumber, 
          firstName: firstName, 
          lastName: lastName, 
          role: role, 
          isPhoneVerified: false
        );
      }
    } on DioException catch (e) {
      throw ServerFailure(e.response?.data['message'] ?? 'Registration failed');
    }
  }
}

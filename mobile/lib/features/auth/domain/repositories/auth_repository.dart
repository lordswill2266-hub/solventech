import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/user.dart';

abstract class AuthRepository {
  Future<Either<Failure, String>> login(String phoneNumber); // Returns OTP message/token
  Future<Either<Failure, User>> verifyOtp(String phoneNumber, String otp);
  Future<Either<Failure, User>> register(String phoneNumber, String firstName, String lastName, String role);
}

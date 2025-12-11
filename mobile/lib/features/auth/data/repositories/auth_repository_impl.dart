import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/storage_service.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final StorageService storageService;

  AuthRepositoryImpl(this.remoteDataSource, this.storageService);

  @override
  Future<Either<Failure, String>> login(String phoneNumber) async {
    try {
      final message = await remoteDataSource.login(phoneNumber);
      return Right(message);
    } on Failure catch (e) {
      return Left(e);
    }
  }

  @override
  Future<Either<Failure, User>> verifyOtp(String phoneNumber, String otp) async {
    try {
      final userModel = await remoteDataSource.verifyOtp(phoneNumber, otp);
      if (userModel.token != null) {
        await storageService.writeSecure('auth_token', userModel.token!);
      }
      return Right(userModel);
    } on Failure catch (e) {
      return Left(e);
    }
  }

  @override
  Future<Either<Failure, User>> register(String phoneNumber, String firstName, String lastName, String role) async {
    try {
      final userModel = await remoteDataSource.register(phoneNumber, firstName, lastName, role);
      return Right(userModel);
    } on Failure catch (e) {
      return Left(e);
    }
  }
}

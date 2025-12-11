import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';

class RegisterUseCase {
  final AuthRepository repository;
  RegisterUseCase(this.repository);

  Future<Either<Failure, User>> call(String phoneNumber, String firstName, String lastName, String role) {
    return repository.register(phoneNumber, firstName, lastName, role);
  }
}

import 'package:equatable/equatable.dart';
import '../../domain/entities/user.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object> get props => [];
}

class LoginEvent extends AuthEvent {
  final String phoneNumber;
  const LoginEvent(this.phoneNumber);
}

class VerifyOtpEvent extends AuthEvent {
  final String phoneNumber;
  final String otp;
  const VerifyOtpEvent(this.phoneNumber, this.otp);
}

class RegisterEvent extends AuthEvent {
  final String phoneNumber;
  final String firstName;
  final String lastName;
  final String role;
  const RegisterEvent(this.phoneNumber, this.firstName, this.lastName, this.role);
}

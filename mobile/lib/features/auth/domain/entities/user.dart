import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String phoneNumber;
  final String firstName;
  final String lastName;
  final String role;
  final bool isPhoneVerified;

  const User({
    required this.id,
    required this.phoneNumber,
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.isPhoneVerified,
  });

  @override
  List<Object?> get props => [id, phoneNumber, firstName, lastName, role, isPhoneVerified];
}

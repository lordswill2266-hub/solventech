import '../../domain/entities/user.dart';

class UserModel extends User {
  final String? token;

  const UserModel({
    required super.id,
    required super.phoneNumber,
    required super.firstName,
    required super.lastName,
    required super.role,
    required super.isPhoneVerified,
    this.token,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      phoneNumber: json['phoneNumber'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      role: json['role'] ?? 'BUYER',
      isPhoneVerified: json['isPhoneVerified'] ?? false,
    );
  }

  UserModel copyWith({String? token}) {
    return UserModel(
      id: id,
      phoneNumber: phoneNumber,
      firstName: firstName,
      lastName: lastName,
      role: role,
      isPhoneVerified: isPhoneVerified,
      token: token ?? this.token,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'phoneNumber': phoneNumber,
      'firstName': firstName,
      'lastName': lastName,
      'role': role,
      'isPhoneVerified': isPhoneVerified,
    };
  }
}

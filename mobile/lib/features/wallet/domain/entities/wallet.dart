import 'package:equatable/equatable.dart';

class Wallet extends Equatable {
  final String id;
  final double balance;
  final String currency;

  const Wallet({
    required this.id,
    required this.balance,
    required this.currency,
  });

  @override
  List<Object?> get props => [id, balance, currency];
}

class WalletTransaction extends Equatable {
  final String id;
  final String type; // DEPOSIT, WITHDRAWAL, PAYMENT, REFUND
  final double amount;
  final String description;
  final DateTime createdAt;
  final String status;

  const WalletTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.description,
    required this.createdAt,
    required this.status,
  });

  @override
  List<Object?> get props => [id, type, amount, description, createdAt, status];
}

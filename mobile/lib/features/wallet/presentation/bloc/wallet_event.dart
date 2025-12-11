import 'package:equatable/equatable.dart';

abstract class WalletEvent extends Equatable {
  const WalletEvent();
  @override
  List<Object> get props => [];
}

class GetWalletEvent extends WalletEvent {}
class GetTransactionsEvent extends WalletEvent {}

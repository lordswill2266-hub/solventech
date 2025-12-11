import 'package:equatable/equatable.dart';
import '../../domain/entities/wallet.dart';

abstract class WalletState extends Equatable {
  const WalletState();
  @override
  List<Object> get props => [];
}

class WalletInitial extends WalletState {}
class WalletLoading extends WalletState {}

class WalletLoaded extends WalletState {
  final Wallet wallet;
  const WalletLoaded(this.wallet);
  @override
  List<Object> get props => [wallet];
}

class TransactionsLoaded extends WalletState {
  final List<WalletTransaction> transactions;
  const TransactionsLoaded(this.transactions);
  @override
  List<Object> get props => [transactions];
}

// We might want a combined state or separate Blocs, but a combined state object is cleaner 
// "WalletData" that holds both. 
// For simplicity, let's assume we load both and emit a simplified "WalletDataLoaded".

class WalletDataLoaded extends WalletState {
  final Wallet? wallet;
  final List<WalletTransaction>? transactions;
  final bool isLoading;
  
  const WalletDataLoaded({this.wallet, this.transactions, this.isLoading = false});
  
  WalletDataLoaded copyWith({
    Wallet? wallet,
    List<WalletTransaction>? transactions,
    bool? isLoading,
  }) {
    return WalletDataLoaded(
      wallet: wallet ?? this.wallet,
      transactions: transactions ?? this.transactions,
      isLoading: isLoading ?? this.isLoading,
    );
  }

  @override
  List<Object> get props => [wallet ?? '', transactions ?? [], isLoading];
}


class WalletError extends WalletState {
  final String message;
  const WalletError(this.message);
  @override
  List<Object> get props => [message];
}

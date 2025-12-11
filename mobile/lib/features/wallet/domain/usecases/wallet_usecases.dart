import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/wallet.dart';
import '../../domain/repositories/wallet_repository.dart';

class GetWalletUseCase {
  final WalletRepository repository;
  GetWalletUseCase(this.repository);

  Future<Either<Failure, Wallet>> call() {
    return repository.getWallet();
  }
}

class GetTransactionsUseCase {
  final WalletRepository repository;
  GetTransactionsUseCase(this.repository);

  Future<Either<Failure, List<WalletTransaction>>> call() {
    return repository.getTransactions();
  }
}

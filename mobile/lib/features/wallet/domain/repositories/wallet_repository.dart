import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/wallet.dart';

abstract class WalletRepository {
  Future<Either<Failure, Wallet>> getWallet();
  Future<Either<Failure, List<WalletTransaction>>> getTransactions();
  Future<Either<Failure, String>> fundWallet(double amount, String paymentMethod); // Returns payment URL or status
}

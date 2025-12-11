import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/error/failures.dart';
import '../models/wallet_model.dart';
import '../../domain/repositories/wallet_repository.dart'; // Just for interface if needed, generally not indispensable here but good practice

abstract class WalletRemoteDataSource {
  Future<WalletModel> getWallet();
  Future<List<WalletTransactionModel>> getTransactions();
  Future<String> fundWallet(double amount, String paymentMethod);
}

class WalletRemoteDataSourceImpl implements WalletRemoteDataSource {
  final DioClient dioClient;

  WalletRemoteDataSourceImpl(this.dioClient);

  @override
  Future<WalletModel> getWallet() async {
    try {
      final response = await dioClient.dio.get('/wallet');
      return WalletModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerFailure(e.response?.data['message'] ?? 'Failed to fetch wallet');
    }
  }

  @override
  Future<List<WalletTransactionModel>> getTransactions() async {
    try {
      final response = await dioClient.dio.get('/wallet/transactions');
      final List data = response.data['data'] ?? response.data;
      return data.map((e) => WalletTransactionModel.fromJson(e)).toList();
    } on DioException catch (e) {
      throw ServerFailure(e.response?.data['message'] ?? 'Failed to fetch transactions');
    }
  }

  @override
  Future<String> fundWallet(double amount, String paymentMethod) async {
    try {
      final response = await dioClient.dio.post(
        '/wallet/fund',
        data: {
          'amount': amount,
          'method': paymentMethod,
        },
      );
      return response.data['checkoutUrl'] ?? 'Success'; 
    } on DioException catch (e) {
      throw ServerFailure(e.response?.data['message'] ?? 'Failed to initiate funding');
    }
  }
}

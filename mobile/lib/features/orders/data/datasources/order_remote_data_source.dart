import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/error/failures.dart';
import '../models/order_model.dart';
import '../../domain/repositories/order_repository.dart';

abstract class OrderRemoteDataSource {
  Future<OrderModel> createOrder(OrderRequest request);
  Future<List<OrderModel>> getOrders();
  Future<OrderModel> getOrderById(String id);
}

class OrderRemoteDataSourceImpl implements OrderRemoteDataSource {
  final DioClient dioClient;

  OrderRemoteDataSourceImpl(this.dioClient);

  @override
  Future<OrderModel> createOrder(OrderRequest request) async {
    try {
      final response = await dioClient.dio.post(
        '/orders',
        data: {
          'productId': request.productId,
          'quantity': request.quantity,
          'shippingAddress': request.shippingAddress,
          'paymentMethod': request.paymentMethod,
        },
      );
      return OrderModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerFailure(e.response?.data['message'] ?? 'Failed to create order');
    }
  }

  @override
  Future<List<OrderModel>> getOrders() async {
    try {
      final response = await dioClient.dio.get('/orders');
      final List data = response.data['data'] ?? response.data;
      return data.map((e) => OrderModel.fromJson(e)).toList();
    } on DioException catch (e) {
      throw ServerFailure(e.response?.data['message'] ?? 'Failed to fetch orders');
    }
  }

  @override
  Future<OrderModel> getOrderById(String id) async {
    try {
      final response = await dioClient.dio.get('/orders/$id');
      return OrderModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerFailure(e.response?.data['message'] ?? 'Failed to fetch order details');
    }
  }
}

import 'package:dartz/dartz.dart' hide Order;
import '../../../../core/error/failures.dart';
import '../entities/order.dart';

abstract class OrderRepository {
  Future<Either<Failure, Order>> createOrder(OrderRequest request);
  Future<Either<Failure, List<Order>>> getOrders();
  Future<Either<Failure, Order>> getOrderById(String id);
}

class OrderRequest {
  final String productId;
  final int quantity;
  final String shippingAddress;
  final String paymentMethod; // WALLET, PAYSTACK, MONNIFY

  OrderRequest({
    required this.productId,
    required this.quantity,
    required this.shippingAddress,
    required this.paymentMethod,
  });
}

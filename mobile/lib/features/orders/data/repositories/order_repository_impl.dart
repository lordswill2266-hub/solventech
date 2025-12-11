import 'package:dartz/dartz.dart' hide Order;
import '../../../../core/error/failures.dart';
import '../../domain/entities/order.dart';
import '../../domain/repositories/order_repository.dart';
import '../datasources/order_remote_data_source.dart';

class OrderRepositoryImpl implements OrderRepository {
  final OrderRemoteDataSource remoteDataSource;

  OrderRepositoryImpl(this.remoteDataSource);

  @override
  Future<Either<Failure, Order>> createOrder(OrderRequest request) async {
    try {
      final order = await remoteDataSource.createOrder(request);
      return Right(order);
    } on Failure catch (e) {
      return Left(e);
    }
  }

  @override
  Future<Either<Failure, List<Order>>> getOrders() async {
    try {
      final orders = await remoteDataSource.getOrders();
      return Right(orders);
    } on Failure catch (e) {
      return Left(e);
    }
  }

  @override
  Future<Either<Failure, Order>> getOrderById(String id) async {
    try {
      final order = await remoteDataSource.getOrderById(id);
      return Right(order);
    } on Failure catch (e) {
      return Left(e);
    }
  }
}

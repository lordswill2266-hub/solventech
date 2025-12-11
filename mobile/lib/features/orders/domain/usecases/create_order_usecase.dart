import 'package:dartz/dartz.dart' hide Order;
import '../../../../core/error/failures.dart';
import '../../domain/entities/order.dart';
import '../../domain/repositories/order_repository.dart';

class CreateOrderUseCase {
  final OrderRepository repository;
  CreateOrderUseCase(this.repository);

  Future<Either<Failure, Order>> call(OrderRequest request) {
    return repository.createOrder(request);
  }
}

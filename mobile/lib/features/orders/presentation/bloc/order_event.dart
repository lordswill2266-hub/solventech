import 'package:equatable/equatable.dart';
import '../../domain/repositories/order_repository.dart';

abstract class OrderEvent extends Equatable {
  const OrderEvent();
  @override
  List<Object> get props => [];
}

class CreateOrderEvent extends OrderEvent {
  final OrderRequest request;
  const CreateOrderEvent(this.request);
  @override
  List<Object> get props => [request];
}

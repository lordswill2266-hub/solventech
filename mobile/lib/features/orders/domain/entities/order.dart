import 'package:equatable/equatable.dart';
import '../../../../features/home/domain/entities/product.dart';

class Order extends Equatable {
  final String id;
  final String buyerId;
  final String sellerId;
  final double totalAmount;
  final String status; // PENDING, PAID, SHIPPED, DELIVERED, COMPLETED, CANCELLED
  final String shippingAddress;
  final List<OrderItem> items;
  final DateTime createdAt;

  const Order({
    required this.id,
    required this.buyerId,
    required this.sellerId,
    required this.totalAmount,
    required this.status,
    required this.shippingAddress,
    required this.items,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, buyerId, sellerId, totalAmount, status, shippingAddress, items, createdAt];
}

class OrderItem extends Equatable {
  final String productId;
  final String productTitle;
  final double price;
  final int quantity;
  final String? imageUrl;

  const OrderItem({
    required this.productId,
    required this.productTitle,
    required this.price,
    required this.quantity,
    this.imageUrl,
  });

  @override
  List<Object?> get props => [productId, productTitle, price, quantity, imageUrl];
}

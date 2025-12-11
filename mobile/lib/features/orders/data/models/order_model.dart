import '../../domain/entities/order.dart';

class OrderModel extends Order {
  const OrderModel({
    required super.id,
    required super.buyerId,
    required super.sellerId,
    required super.totalAmount,
    required super.status,
    required super.shippingAddress,
    required super.items,
    required super.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'],
      buyerId: json['buyerId'],
      sellerId: json['sellerId'],
      totalAmount: (json['totalAmount'] as num).toDouble(),
      status: json['status'],
      shippingAddress: json['shippingAddress'] ?? '',
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => OrderItemModel.fromJson(e))
              .toList() ??
          [],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

class OrderItemModel extends OrderItem {
  const OrderItemModel({
    required super.productId,
    required super.productTitle,
    required super.price,
    required super.quantity,
    super.imageUrl,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    // Handling flat structure or nested product structure depending on backend.
    // Assuming backend returns item with nested product info or flattened.
    // If backend returns: { product: { title, price, images }, quantity: 1 }
    final product = json['product'] ?? {};
    final images = product['images'] as List<dynamic>?;
    
    return OrderItemModel(
      productId: json['productId'],
      productTitle: product['title'] ?? 'Unknown Product',
      price: (json['price'] as num).toDouble(), // This is usually unit price at time of order
      quantity: json['quantity'] ?? 1,
      imageUrl: (images != null && images.isNotEmpty) ? images[0] : null,
    );
  }
}

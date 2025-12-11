import '../../domain/entities/product.dart';

class ProductModel extends Product {
  const ProductModel({
    required super.id,
    required super.title,
    required super.description,
    required super.price,
    required super.condition,
    required super.category,
    required super.images,
    required super.sellerId,
    required super.createdAt,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'],
      title: json['title'],
      description: json['description'] ?? '',
      price: (json['price'] as num).toDouble(),
      condition: json['condition'] ?? 'USED',
      category: json['category'] ?? 'General',
      images: List<String>.from(json['images'] ?? []),
      sellerId: json['sellerId'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'price': price,
      'condition': condition,
      'category': category,
      'images': images,
      'sellerId': sellerId,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

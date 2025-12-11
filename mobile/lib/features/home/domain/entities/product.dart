import 'package:equatable/equatable.dart';

class Product extends Equatable {
  final String id;
  final String title;
  final String description;
  final double price;
  final String condition; // NEW, USED, etc.
  final String category;
  final List<String> images;
  final String sellerId;
  final DateTime createdAt;

  const Product({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    required this.condition,
    required this.category,
    required this.images,
    required this.sellerId,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, title, description, price, condition, category, images, sellerId, createdAt];
}

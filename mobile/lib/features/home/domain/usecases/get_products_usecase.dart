import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart'; // optional if needed
import '../../../../core/error/failures.dart';
import '../../domain/entities/product.dart';
import '../../domain/repositories/product_repository.dart';

class GetProductsUseCase {
  final ProductRepository repository;

  GetProductsUseCase(this.repository);

  Future<Either<Failure, List<Product>>> call({String? category, String? search, int? page}) {
    return repository.getProducts(category: category, search: search, page: page);
  }
}

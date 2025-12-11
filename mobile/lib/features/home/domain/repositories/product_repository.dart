import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/product.dart';

abstract class ProductRepository {
  Future<Either<Failure, List<Product>>> getProducts({String? category, String? search, int? page});
  Future<Either<Failure, Product>> getProductById(String id);
}

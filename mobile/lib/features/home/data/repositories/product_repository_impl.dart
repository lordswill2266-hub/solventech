import 'package:dartz/dartz.dart';
import '../../../../core/network/storage_service.dart'; // Optional if needed
import '../../../../core/error/failures.dart';
import '../../domain/entities/product.dart';
import '../../domain/repositories/product_repository.dart';
import '../datasources/product_remote_data_source.dart';

class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource remoteDataSource;

  ProductRepositoryImpl(this.remoteDataSource);

  @override
  Future<Either<Failure, List<Product>>> getProducts({String? category, String? search, int? page}) async {
    try {
      final products = await remoteDataSource.getProducts(category: category, search: search, page: page);
      return Right(products);
    } on Failure catch (e) {
      return Left(e);
    }
  }

  @override
  Future<Either<Failure, Product>> getProductById(String id) async {
    try {
      final product = await remoteDataSource.getProductById(id);
      return Right(product);
    } on Failure catch (e) {
      return Left(e);
    }
  }
}

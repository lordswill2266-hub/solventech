import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/error/failures.dart';
import '../models/product_model.dart';

abstract class ProductRemoteDataSource {
  Future<List<ProductModel>> getProducts({String? category, String? search, int? page});
  Future<ProductModel> getProductById(String id);
}

class ProductRemoteDataSourceImpl implements ProductRemoteDataSource {
  final DioClient dioClient;

  ProductRemoteDataSourceImpl(this.dioClient);

  @override
  Future<List<ProductModel>> getProducts({String? category, String? search, int? page = 1}) async {
    try {
      final response = await dioClient.dio.get(
        '/products',
        queryParameters: {
          if (category != null) 'category': category,
          if (search != null) 'search': search,
          'page': page,
        },
      );
      // Assuming backend return { data: [...], meta: ... } or just [...]
      final List data = response.data['data'] ?? response.data; 
      return data.map((e) => ProductModel.fromJson(e)).toList();
    } on DioException catch (e) {
      throw ServerFailure(e.response?.data['message'] ?? 'Failed to fetch products');
    }
  }

  @override
  Future<ProductModel> getProductById(String id) async {
    try {
      final response = await dioClient.dio.get('/products/$id');
      return ProductModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerFailure(e.response?.data['message'] ?? 'Failed to fetch product');
    }
  }
}

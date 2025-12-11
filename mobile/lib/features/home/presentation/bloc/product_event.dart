import 'package:equatable/equatable.dart';

abstract class ProductEvent extends Equatable {
  const ProductEvent();
  @override
  List<Object?> get props => [];
}

class GetProductsEvent extends ProductEvent {
  final String? category;
  final String? search;
  final int page;
  final bool isRefresh;

  const GetProductsEvent({this.category, this.search, this.page = 1, this.isRefresh = false});
  
  @override
  List<Object?> get props => [category, search, page, isRefresh];
}

class LoadMoreProductsEvent extends ProductEvent {
  const LoadMoreProductsEvent();
}

class GetProductDetailEvent extends ProductEvent {
  final String productId;
  const GetProductDetailEvent(this.productId);
  @override
  List<Object?> get props => [productId];
}

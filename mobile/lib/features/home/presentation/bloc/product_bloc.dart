import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:bloc_concurrency/bloc_concurrency.dart';
import 'package:stream_transform/stream_transform.dart';
import '../../domain/usecases/get_products_usecase.dart';
import '../../domain/usecases/get_product_by_id_usecase.dart';
import 'product_event.dart';
import 'product_state.dart';

const throttleDuration = Duration(milliseconds: 100);

EventTransformer<E> throttleDroppable<E>(Duration duration) {
  return (events, mapper) {
    return droppable<E>().call(events.throttle(duration), mapper);
  };
}

class ProductBloc extends Bloc<ProductEvent, ProductState> {
  final GetProductsUseCase getProductsUseCase;
  final GetProductByIdUseCase getProductByIdUseCase;
  
  // Keep track of filter state if needed, or rely on events passed
  String? _currentCategory;
  String? _currentSearch;

  ProductBloc({
    required this.getProductsUseCase,
    required this.getProductByIdUseCase,
  }) : super(ProductInitial()) {
    on<GetProductsEvent>(_onGetProducts);
    on<LoadMoreProductsEvent>(_onLoadMoreProducts, transformer: throttleDroppable(throttleDuration));
    on<GetProductDetailEvent>(_onGetProductDetail);
  }

  Future<void> _onGetProducts(GetProductsEvent event, Emitter<ProductState> emit) async {
    _currentCategory = event.category;
    _currentSearch = event.search;

    if (event.isRefresh || state is! ProductLoaded) {
      emit(ProductLoading());
    }

    // Refresh implies page 1
    final result = await getProductsUseCase(
      category: event.category,
      search: event.search,
      page: 1, 
    );

    result.fold(
      (failure) => emit(ProductError(failure.message)),
      (products) => emit(ProductLoaded(
        products: products, 
        hasReachedMax: products.isEmpty || products.length < 10, // Assuming 10 items per page default
        page: 1,
      )),
    );
  }

  Future<void> _onLoadMoreProducts(LoadMoreProductsEvent event, Emitter<ProductState> emit) async {
    final currentState = state;
    if (currentState is ProductLoaded && !currentState.hasReachedMax) {
      final nextPage = currentState.page + 1;
      final result = await getProductsUseCase(
        category: _currentCategory,
        search: _currentSearch,
        page: nextPage,
      );

      result.fold(
        (failure) => emit(ProductError(failure.message)), 
        (newProducts) {
          if (newProducts.isEmpty) {
            emit(currentState.copyWith(hasReachedMax: true));
          } else {
            emit(currentState.copyWith(
              products: currentState.products + newProducts,
              hasReachedMax: newProducts.length < 10,
              page: nextPage,
            ));
          }
        },
      );
    }
  }

  Future<void> _onGetProductDetail(GetProductDetailEvent event, Emitter<ProductState> emit) async {
    // Note: We might want to keep the current list state if we pop back.
    // However, for simplicity, we are emitting a new state. 
    // In a real app, we might use a separate Bloc for details or nested states.
    // Or we just pass the object from the list to the details page if we have it full.
    // If we fetch fresh, we emit loading/loaded.
    emit(ProductLoading());
    final result = await getProductByIdUseCase(event.productId);
    result.fold(
      (failure) => emit(ProductError(failure.message)),
      (product) => emit(ProductDetailLoaded(product)),
    );
  }
}

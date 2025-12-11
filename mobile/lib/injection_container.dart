import 'package:get_it/get_it.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/network/dio_client.dart';
import 'core/network/storage_service.dart';
import 'features/auth/data/datasources/auth_remote_data_source.dart';
import 'features/auth/data/repositories/auth_repository_impl.dart';
import 'features/auth/domain/repositories/auth_repository.dart';
import 'features/auth/domain/usecases/login_usecase.dart';
import 'features/auth/domain/usecases/verify_otp_usecase.dart';
import 'features/auth/domain/usecases/register_usecase.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';

// Product Imports
import 'features/home/data/datasources/product_remote_data_source.dart';
import 'features/home/data/repositories/product_repository_impl.dart';
import 'features/home/domain/repositories/product_repository.dart';
import 'features/home/domain/usecases/get_products_usecase.dart';
import 'features/home/domain/usecases/get_product_by_id_usecase.dart';
import 'features/home/presentation/bloc/product_bloc.dart';

// Order Imports
import 'features/orders/data/datasources/order_remote_data_source.dart';
import 'features/orders/data/repositories/order_repository_impl.dart';
import 'features/orders/domain/repositories/order_repository.dart';
import 'features/orders/domain/usecases/create_order_usecase.dart';
import 'features/orders/presentation/bloc/order_bloc.dart';

// Wallet Imports
import 'features/wallet/data/datasources/wallet_remote_data_source.dart';
import 'features/wallet/data/repositories/wallet_repository_impl.dart';
import 'features/wallet/domain/repositories/wallet_repository.dart';
import 'features/wallet/domain/usecases/wallet_usecases.dart';
import 'features/wallet/presentation/bloc/wallet_bloc.dart';

// Chat Imports
import 'features/chat/data/datasources/chat_remote_data_source.dart';
import 'features/chat/data/repositories/chat_repository_impl.dart';
import 'features/chat/domain/repositories/chat_repository.dart';
import 'features/chat/domain/usecases/chat_usecases.dart';
import 'features/chat/presentation/bloc/chat_bloc.dart';

final sl = GetIt.instance;

Future<void> init() async {
  // External
  final sharedPreferences = await SharedPreferences.getInstance();
  sl.registerLazySingleton(() => sharedPreferences);
  sl.registerLazySingleton(() => const FlutterSecureStorage());
  sl.registerLazySingleton(() => DioClient());

  // Core
  sl.registerLazySingleton(() => StorageService(sl(), sl()));

  // Data sources
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(sl()),
  );
  sl.registerLazySingleton<ProductRemoteDataSource>(
    () => ProductRemoteDataSourceImpl(sl()),
  );

  // Repositories
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(sl(), sl()),
  );
  sl.registerLazySingleton<ProductRepository>(
    () => ProductRepositoryImpl(sl()),
  );

  // Use cases
  sl.registerLazySingleton(() => LoginUseCase(sl()));
  sl.registerLazySingleton(() => VerifyOtpUseCase(sl()));
  sl.registerLazySingleton(() => RegisterUseCase(sl()));
  sl.registerLazySingleton(() => GetProductsUseCase(sl())); // Product UseCase
  sl.registerLazySingleton(() => GetProductByIdUseCase(sl())); // Product Detail UseCase

  // Bloc
  sl.registerFactory(
    () => AuthBloc(
      loginUseCase: sl(),
      verifyOtpUseCase: sl(),
      registerUseCase: sl(),
    ),
  );
  
  sl.registerFactory(
    () => ProductBloc(
      getProductsUseCase: sl(),
      getProductByIdUseCase: sl(),
    ),
  );

  // --- Orders ---
  // Data Sources
  sl.registerLazySingleton<OrderRemoteDataSource>(() => OrderRemoteDataSourceImpl(sl()));

  // Repositories
  sl.registerLazySingleton<OrderRepository>(() => OrderRepositoryImpl(sl()));

  // Use Cases
  sl.registerLazySingleton(() => CreateOrderUseCase(sl()));

  // Bloc
  sl.registerFactory(() => OrderBloc(createOrderUseCase: sl()));

  // --- Wallet ---
  // Data Sources
  sl.registerLazySingleton<WalletRemoteDataSource>(() => WalletRemoteDataSourceImpl(sl()));

  // Repositories
  sl.registerLazySingleton<WalletRepository>(() => WalletRepositoryImpl(sl()));

  // Use Cases
  sl.registerLazySingleton(() => GetWalletUseCase(sl()));
  sl.registerLazySingleton(() => GetTransactionsUseCase(sl()));

  // Bloc
  sl.registerFactory(() => WalletBloc(
        getWalletUseCase: sl(),
        getTransactionsUseCase: sl(),
      ));

  // --- Chat ---
  // Data Sources
  sl.registerLazySingleton<ChatRemoteDataSource>(() => ChatRemoteDataSourceImpl(sl()));

  // Repositories
  sl.registerLazySingleton<ChatRepository>(() => ChatRepositoryImpl(remoteDataSource: sl(), storageService: sl()));

  // Use Cases
  sl.registerLazySingleton(() => GetChatsUseCase(sl()));
  sl.registerLazySingleton(() => GetMessagesUseCase(sl()));
  sl.registerLazySingleton(() => SendMessageUseCase(sl()));

  // Bloc
  sl.registerFactory(() => ChatBloc(
        getChatsUseCase: sl(),
        getMessagesUseCase: sl(),
        sendMessageUseCase: sl(),
        chatRepository: sl(),
        storageService: sl(),
  ));
}

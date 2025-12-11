import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/pages/login_screen.dart';
import '../../features/auth/presentation/pages/otp_screen.dart';
import '../../features/auth/presentation/pages/register_screen.dart';
import '../../features/home/presentation/pages/home_screen.dart';
import '../../features/home/presentation/pages/product_details_screen.dart';
import '../../features/orders/presentation/pages/checkout_screen.dart';
import '../../features/home/domain/entities/product.dart';
import '../../features/wallet/presentation/pages/wallet_screen.dart';
import '../../features/chat/presentation/pages/chat_list_screen.dart';
import '../../features/chat/presentation/pages/chat_screen.dart';

final GoRouter router = GoRouter(
  initialLocation: '/login', // Start at login for now
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/otp',
      builder: (context, state) {
        final phoneNumber = state.extra as String; 
        return OtpScreen(phoneNumber: phoneNumber);
      },
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/product/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return ProductDetailsScreen(productId: id);
      },
    ),
    GoRoute(
      path: '/checkout',
      builder: (context, state) {
        final product = state.extra as Product;
        return CheckoutScreen(product: product);
      },
    ),
    GoRoute(
      path: '/wallet',
      builder: (context, state) => const WalletScreen(),
    ),
    GoRoute(
      path: '/chats',
      builder: (context, state) => const ChatListScreen(),
    ),
    GoRoute(
      path: '/chat/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        final name = state.extra as String? ?? 'Chat';
        return ChatScreen(chatId: id, chatName: name);
      },
    ),
  ],
);

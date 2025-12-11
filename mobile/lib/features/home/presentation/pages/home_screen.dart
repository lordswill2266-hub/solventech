import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../injection_container.dart';
import '../../../../shared/widgets/product_card.dart';
import '../bloc/product_bloc.dart';
import '../bloc/product_event.dart';
import '../bloc/product_state.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => sl<ProductBloc>()..add(const GetProductsEvent()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Solven Shopper'),
          actions: [
            IconButton(
              icon: const Icon(Icons.search),
              onPressed: () {
                // Implement search later
              },
            ),
            IconButton(
              icon: const Icon(Icons.shopping_cart_outlined),
              onPressed: () {},
            ),
          ],
        ),
        body: BlocBuilder<ProductBloc, ProductState>(
          builder: (context, state) {
            if (state is ProductLoading) {
              return const Center(child: CircularProgressIndicator());
            } else if (state is ProductError) {
              return Center(child: Text(state.message));
            } else if (state is ProductLoaded) {
              if (state.products.isEmpty) {
                return const Center(child: Text('No products found.'));
              }
              return RefreshIndicator(
                onRefresh: () async {
                   context.read<ProductBloc>().add(const GetProductsEvent(isRefresh: true));
                },
                child: GridView.builder(
                  padding: EdgeInsets.all(16.w),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.75,
                    crossAxisSpacing: 16.w,
                    mainAxisSpacing: 16.h,
                  ),
                  itemCount: state.products.length,
                  itemBuilder: (context, index) {
                    final product = state.products[index];
                    return ProductCard(
                      product: product,
                      onTap: () {
                         context.push('/product/${product.id}'); 
                      },
                    );
                  },
                ),
              );
            }
            return const SizedBox();
          },
        ),
        bottomNavigationBar: NavigationBar(
          destinations: const [
             NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
             NavigationDestination(icon: Icon(Icons.search), label: 'Browse'),
             NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), label: 'Wallet'),
             NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
          ],
          selectedIndex: 0,
          onDestinationSelected: (index) {
            if (index == 2) {
              context.go('/wallet');
            }
          },
        ),
      ),
    );
  }
}

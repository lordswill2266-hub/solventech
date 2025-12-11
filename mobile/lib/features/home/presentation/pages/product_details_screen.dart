import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../../injection_container.dart';
import '../bloc/product_bloc.dart';
import '../bloc/product_event.dart';
import '../bloc/product_state.dart';

class ProductDetailsScreen extends StatelessWidget {
  final String productId;

  const ProductDetailsScreen({super.key, required this.productId});

  @override
  Widget build(BuildContext context) {
    // Note: In a real app we might pass the Product object directly to avoid loading if we have it.
    // Here we fetch details to ensure we have fresh data or if deep linking.
    return BlocProvider(
      create: (context) => sl<ProductBloc>()..add(GetProductDetailEvent(productId)),
      child: BlocBuilder<ProductBloc, ProductState>(
        builder: (context, state) {
          // If loading or error, handle them. If loaded, show UI + BottomBar
          if (state is ProductLoading) {
            return const Scaffold(body: Center(child: CircularProgressIndicator()));
          } else if (state is ProductError) {
            return Scaffold(body: Center(child: Text(state.message)));
          } else if (state is ProductDetailLoaded) {
            final product = state.product;
            return Scaffold(
              body: CustomScrollView(
                slivers: [
                  SliverAppBar(
                    expandedHeight: 300.h,
                    pinned: true,
                    flexibleSpace: FlexibleSpaceBar(
                      background: PageView.builder(
                        itemCount: product.images.length,
                        itemBuilder: (context, index) {
                          return CachedNetworkImage(
                            imageUrl: product.images[index],
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(color: Colors.grey[200]),
                          );
                        },
                      ),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.all(16.w),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  product.title,
                                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                              ),
                              Text(
                                '₦${product.price.toStringAsFixed(2)}',
                                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                      color: Theme.of(context).primaryColor,
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                            ],
                          ),
                          SizedBox(height: 8.h),
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                            decoration: BoxDecoration(
                              color: Colors.grey[200],
                              borderRadius: BorderRadius.circular(4.r),
                            ),
                            child: Text(product.condition),
                          ),
                          SizedBox(height: 24.h),
                          Text(
                            'Description',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold
                            ),
                          ),
                          SizedBox(height: 8.h),
                          Text(
                            product.description,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              height: 1.5
                            ),
                          ),
                          SizedBox(height: 32.h),
                          // Seller section placeholder
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: const CircleAvatar(child: Icon(Icons.person)),
                            title: const Text('Seller info'),
                            subtitle: Text('ID: ${product.sellerId}'),
                            trailing: TextButton(onPressed: () {}, child: const Text('Visit Store')),
                          ),
                          SizedBox(height: 80.h), 
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              bottomNavigationBar: SafeArea(
                child: Padding(
                  padding: EdgeInsets.all(16.w),
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            context.push('/chat/${product.sellerId}', extra: 'Seller ${product.sellerId}');
                          },
                          icon: const Icon(Icons.chat_bubble_outline),
                          label: const Text('Chat'),
                          style: OutlinedButton.styleFrom(
                            padding: EdgeInsets.symmetric(vertical: 12.h),
                          ),
                        ),
                      ),
                      SizedBox(width: 16.w),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            context.push('/checkout', extra: product);
                          },
                          icon: const Icon(Icons.shopping_bag_outlined),
                          label: const Text('Buy Now'),
                          style: ElevatedButton.styleFrom(
                            padding: EdgeInsets.symmetric(vertical: 12.h),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }
          return const Scaffold(body: SizedBox());
        },
      ),
    );
  }
}

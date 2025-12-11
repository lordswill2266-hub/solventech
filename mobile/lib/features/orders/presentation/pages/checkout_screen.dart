import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../../injection_container.dart';
import '../../domain/repositories/order_repository.dart';
import '../../../home/domain/entities/product.dart';
import '../bloc/order_bloc.dart';
import '../bloc/order_event.dart';
import '../bloc/order_state.dart';

class CheckoutScreen extends StatefulWidget {
  final Product product;

  const CheckoutScreen({super.key, required this.product});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _addressController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String _paymentMethod = 'WALLET'; // Default
  int _quantity = 1;

  @override
  void dispose() {
    _addressController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      final request = OrderRequest(
        productId: widget.product.id,
        quantity: _quantity,
        shippingAddress: _addressController.text,
        paymentMethod: _paymentMethod,
      );
      context.read<OrderBloc>().add(CreateOrderEvent(request));
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => sl<OrderBloc>(),
      child: BlocConsumer<OrderBloc, OrderState>(
        listener: (context, state) {
          if (state is OrderCreated) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Order placed successfully!')),
            );
            // Navigate to Order Success or Home
            context.go('/home');
          } else if (state is OrderError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message), backgroundColor: Colors.red),
            );
          }
        },
        builder: (context, state) {
          final total = widget.product.price * _quantity;

          return Scaffold(
            appBar: AppBar(title: const Text('Checkout')),
            body: SingleChildScrollView(
              padding: EdgeInsets.all(16.w),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Product Summary
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: Container(
                        width: 60.w,
                        height: 60.w,
                        decoration: BoxDecoration(
                          color: Colors.grey[200],
                          borderRadius: BorderRadius.circular(8.r),
                          image: widget.product.images.isNotEmpty
                              ? DecorationImage(
                                  image: NetworkImage(widget.product.images.first),
                                  fit: BoxFit.cover)
                              : null,
                        ),
                      ),
                      title: Text(widget.product.title, maxLines: 1, overflow: TextOverflow.ellipsis),
                      subtitle: Text('Price: ₦${widget.product.price.toStringAsFixed(2)}'),
                    ),
                    const Divider(),
                    SizedBox(height: 16.h),
                    
                    // Quantity
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Quantity', style: Theme.of(context).textTheme.titleMedium),
                        Row(
                          children: [
                            IconButton(
                              onPressed: _quantity > 1 ? () => setState(() => _quantity--) : null,
                              icon: const Icon(Icons.remove_circle_outline),
                            ),
                            Text('$_quantity', style: Theme.of(context).textTheme.titleMedium),
                            IconButton(
                              onPressed: () => setState(() => _quantity++),
                              icon: const Icon(Icons.add_circle_outline),
                            ),
                          ],
                        ),
                      ],
                    ),
                    SizedBox(height: 24.h),

                    // Shipping Address
                    Text('Shipping Address', style: Theme.of(context).textTheme.titleMedium),
                    SizedBox(height: 8.h),
                    TextFormField(
                      controller: _addressController,
                      decoration: const InputDecoration(
                        hintText: 'Enter delivery address',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                      validator: (value) => value!.isEmpty ? 'Please enter address' : null,
                    ),
                    SizedBox(height: 24.h),

                    // Payment Method
                    Text('Payment Method', style: Theme.of(context).textTheme.titleMedium),
                    SizedBox(height: 8.h),
                    DropdownButtonFormField<String>(
                      value: _paymentMethod,
                      decoration: const InputDecoration(border: OutlineInputBorder()),
                      items: const [
                        DropdownMenuItem(value: 'WALLET', child: Text('Wallet Balance')),
                        DropdownMenuItem(value: 'PAYSTACK', child: Text('Pay via Card (Paystack)')),
                        DropdownMenuItem(value: 'MONNIFY', child: Text('Bank Transfer (Monnify)')),
                      ],
                      onChanged: (val) => setState(() => _paymentMethod = val!),
                    ),
                    SizedBox(height: 32.h),

                    // Total & Pay Button
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Total:', style: Theme.of(context).textTheme.headlineSmall),
                        Text(
                          '₦${total.toStringAsFixed(2)}',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                color: Theme.of(context).primaryColor,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ],
                    ),
                    SizedBox(height: 24.h),
                    ElevatedButton(
                      onPressed: state is OrderLoading ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        padding: EdgeInsets.symmetric(vertical: 16.h),
                      ),
                      child: state is OrderLoading
                          ? const SizedBox(
                              height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white))
                          : const Text('Confirm Order'),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

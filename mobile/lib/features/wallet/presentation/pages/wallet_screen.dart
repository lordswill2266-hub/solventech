import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../../injection_container.dart';
import '../bloc/wallet_bloc.dart';
import '../bloc/wallet_event.dart';
import '../bloc/wallet_state.dart';

class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => sl<WalletBloc>()..add(GetWalletEvent()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('My Wallet'),
          centerTitle: true,
        ),
        body: BlocBuilder<WalletBloc, WalletState>(
          builder: (context, state) {
            if (state is WalletLoading) {
              return const Center(child: CircularProgressIndicator());
            } else if (state is WalletError) {
              return Center(child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(state.message),
                  ElevatedButton(
                    onPressed: () => context.read<WalletBloc>().add(GetWalletEvent()),
                    child: const Text('Retry'),
                  )
                ],
              ));
            } else if (state is WalletDataLoaded) {
              final wallet = state.wallet;
              final transactions = state.transactions ?? [];

              return RefreshIndicator(
                onRefresh: () async {
                  context.read<WalletBloc>().add(GetWalletEvent());
                },
                child: ListView(
                  padding: EdgeInsets.all(16.w),
                  children: [
                    // Balance Card
                    Container(
                      padding: EdgeInsets.all(24.w),
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor,
                        borderRadius: BorderRadius.circular(16.r),
                        boxShadow: [
                          BoxShadow(
                            color: Theme.of(context).primaryColor.withOpacity(0.3),
                            blurRadius: 10,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Text(
                            'Available Balance',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.9),
                              fontSize: 14.sp,
                            ),
                          ),
                          SizedBox(height: 8.h),
                          Text(
                            '₦${wallet?.balance.toStringAsFixed(2) ?? "0.00"}',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 32.sp,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 24.h),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _buildActionButton(context, Icons.add, 'Fund', () {
                                // Navigate to fund wallet
                              }),
                              _buildActionButton(context, Icons.arrow_outward, 'Withdraw', () {
                                // Navigate to withdraw
                              }),
                            ],
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 32.h),

                    // Transactions Header
                    Text(
                      'Transaction History',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 16.h),

                    // Transaction List
                    if (transactions.isEmpty)
                      const Center(child: Padding(
                        padding: EdgeInsets.all(32.0),
                        child: Text('No transactions yet'),
                      ))
                    else
                      ...transactions.map((tx) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundColor: tx.type == 'DEPOSIT' || tx.type == 'REFUND' 
                              ? Colors.green.withOpacity(0.1) 
                              : Colors.red.withOpacity(0.1),
                          child: Icon(
                            tx.type == 'DEPOSIT' || tx.type == 'REFUND' ? Icons.arrow_downward : Icons.arrow_upward,
                            color: tx.type == 'DEPOSIT' || tx.type == 'REFUND' ? Colors.green : Colors.red,
                          ),
                        ),
                        title: Text(tx.description.isNotEmpty ? tx.description : tx.type),
                        subtitle: Text(tx.createdAt.toString().substring(0, 16)), // Simple format
                        trailing: Text(
                          '${tx.type == 'DEPOSIT' || tx.type == 'REFUND' ? '+' : '-'}₦${tx.amount.toStringAsFixed(2)}',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: tx.type == 'DEPOSIT' || tx.type == 'REFUND' ? Colors.green : Colors.red,
                          ),
                        ),
                      )).toList(),
                  ],
                ),
              );
            }
            return const SizedBox();
          },
        ),
        bottomNavigationBar: NavigationBar(
          destinations: const [
             NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
             NavigationDestination(icon: Icon(Icons.search), label: 'Browse'),
             NavigationDestination(icon: Icon(Icons.account_balance_wallet), label: 'Wallet'),
             NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
          ],
          selectedIndex: 2, // Highlight Wallet
          onDestinationSelected: (index) {
             if (index == 0) context.go('/home');
             // Other routes...
          },
        ),
      ),
    );
  }

  Widget _buildActionButton(BuildContext context, IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(12.w),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white),
          ),
          SizedBox(height: 8.h),
          Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

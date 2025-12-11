import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/wallet_usecases.dart';
import 'wallet_event.dart';
import 'wallet_state.dart';

class WalletBloc extends Bloc<WalletEvent, WalletState> {
  final GetWalletUseCase getWalletUseCase;
  final GetTransactionsUseCase getTransactionsUseCase;

  WalletBloc({
    required this.getWalletUseCase,
    required this.getTransactionsUseCase,
  }) : super(const WalletDataLoaded(isLoading: true)) {
    on<GetWalletEvent>(_onGetWallet);
    on<GetTransactionsEvent>(_onGetTransactions);
  }

  Future<void> _onGetWallet(GetWalletEvent event, Emitter<WalletState> emit) async {
    final currentState = state;
    if (currentState is WalletDataLoaded) {
      emit(currentState.copyWith(isLoading: true));
    } else {
      emit(WalletLoading());
    }

    final result = await getWalletUseCase();
    
    // We also fetch transactions when wallet is fetched usually, but let's keep them separate 
    // or chain them. For now, strict event handling.
    
    result.fold(
      (failure) => emit(WalletError(failure.message)),
      (wallet) {
         if (state is WalletDataLoaded) {
           emit((state as WalletDataLoaded).copyWith(wallet: wallet, isLoading: false));
         } else {
           emit(WalletDataLoaded(wallet: wallet));
         }
         add(GetTransactionsEvent()); // Auto fetch transactions
      },
    );
  }

  Future<void> _onGetTransactions(GetTransactionsEvent event, Emitter<WalletState> emit) async {
    final result = await getTransactionsUseCase();
    result.fold(
      (failure) => emit(WalletError(failure.message)),
      (transactions) {
         if (state is WalletDataLoaded) {
           emit((state as WalletDataLoaded).copyWith(transactions: transactions, isLoading: false));
         } else {
           emit(WalletDataLoaded(transactions: transactions));
         }
      },
    );
  }
}

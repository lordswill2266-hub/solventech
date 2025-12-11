import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/network/storage_service.dart';
import '../../domain/repositories/chat_repository.dart';
import '../../domain/usecases/chat_usecases.dart';
import 'chat_event.dart';
import 'chat_state.dart';

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final GetChatsUseCase getChatsUseCase;
  final GetMessagesUseCase getMessagesUseCase;
  final SendMessageUseCase sendMessageUseCase;
  final ChatRepository chatRepository;
  final StorageService storageService;

  StreamSubscription? _messageSubscription;

  ChatBloc({
    required this.getChatsUseCase,
    required this.getMessagesUseCase,
    required this.sendMessageUseCase,
    required this.chatRepository,
    required this.storageService,
  }) : super(ChatInitial()) {
    on<InitSocketEvent>(_onInitSocket);
    on<GetChatsEvent>(_onGetChats);
    on<GetMessagesEvent>(_onGetMessages);
    on<SendMessageEvent>(_onSendMessage);
    on<ReceiveMessageEvent>(_onReceiveMessage);
  }

  Future<void> _onInitSocket(InitSocketEvent event, Emitter<ChatState> emit) async {
    final user = await storageService.getUser();
    if (user != null && user['id'] != null) {
      chatRepository.initSocket(user['id']);
      // Subscribe to stream
      _messageSubscription?.cancel();
      _messageSubscription = chatRepository.messageStream.listen((message) {
        add(ReceiveMessageEvent(message));
      });
    }
  }

  Future<void> _onGetChats(GetChatsEvent event, Emitter<ChatState> emit) async {
    emit(ChatLoading());
    final result = await getChatsUseCase();
    result.fold(
      (failure) => emit(ChatError(failure.message)),
      (chats) => emit(ChatsLoaded(chats)),
    );
  }

  Future<void> _onGetMessages(GetMessagesEvent event, Emitter<ChatState> emit) async {
    emit(ChatLoading());
    final result = await getMessagesUseCase(event.chatId);
    result.fold(
      (failure) => emit(ChatError(failure.message)),
      (messages) => emit(MessagesLoaded(messages)),
    );
  }

  Future<void> _onSendMessage(SendMessageEvent event, Emitter<ChatState> emit) async {
    // Current state check to efficiently append message
    final currentState = state;
    if (currentState is MessagesLoaded) {
      // Optimistic update could happen here, but we wait for ack in this simple version
      // or we just rely on the updated list.
    }
    
    final result = await sendMessageUseCase(event.chatId, event.text);
    result.fold(
      (failure) => emit(ChatError(failure.message)),
      (newMessage) {
        if (currentState is MessagesLoaded) {
          emit(MessagesLoaded(List.from(currentState.messages)..add(newMessage)));
        } else {
          emit(MessagesLoaded([newMessage]));
        }
      },
    );
  }

  Future<void> _onReceiveMessage(ReceiveMessageEvent event, Emitter<ChatState> emit) async {
    final currentState = state;
    if (currentState is MessagesLoaded) {
      emit(MessagesLoaded(List.from(currentState.messages)..add(event.message)));
    }
  }

  @override
  Future<void> close() {
    _messageSubscription?.cancel();
    chatRepository.disconnectSocket();
    return super.close();
  }
}

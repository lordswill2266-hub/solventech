import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/chat.dart';
import '../../domain/repositories/chat_repository.dart';

class GetChatsUseCase {
  final ChatRepository repository;
  GetChatsUseCase(this.repository);

  Future<Either<Failure, List<Chat>>> call() => repository.getChats();
}

class GetMessagesUseCase {
  final ChatRepository repository;
  GetMessagesUseCase(this.repository);

  Future<Either<Failure, List<Message>>> call(String chatId) => repository.getMessages(chatId);
}

class SendMessageUseCase {
  final ChatRepository repository;
  SendMessageUseCase(this.repository);

  Future<Either<Failure, Message>> call(String chatId, String text) => repository.sendMessage(chatId, text);
}

import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/chat.dart';

abstract class ChatRepository {
  Future<Either<Failure, List<Chat>>> getChats();
  Future<Either<Failure, List<Message>>> getMessages(String chatId);
  Future<Either<Failure, Message>> sendMessage(String chatId, String text);
  
  // Real-time methods
  Stream<Message> get messageStream;
  void initSocket(String userId);
  void disconnectSocket();
}

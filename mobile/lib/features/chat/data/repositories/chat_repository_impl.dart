import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/storage_service.dart';
import '../../domain/entities/chat.dart';
import '../../domain/repositories/chat_repository.dart';
import '../datasources/chat_remote_data_source.dart';

class ChatRepositoryImpl implements ChatRepository {
  final ChatRemoteDataSource remoteDataSource;
  final StorageService storageService; // To get current user ID mostly

  ChatRepositoryImpl({required this.remoteDataSource, required this.storageService});

  @override
  Stream<Message> get messageStream => remoteDataSource.messageStream;

  @override
  void initSocket(String userId) {
    remoteDataSource.initSocket(userId);
  }

  @override
  void disconnectSocket() {
    remoteDataSource.disconnectSocket();
  }

  @override
  Future<Either<Failure, List<Chat>>> getChats() async {
    try {
      final chats = await remoteDataSource.getChats();
      return Right(chats);
    } on Failure catch (e) {
      return Left(e);
    }
  }

  @override
  Future<Either<Failure, List<Message>>> getMessages(String chatId) async {
    try {
      final userJson = await storageService.getUser();
      final currentUserId = userJson?['id']; // Assuming ID is stored

      final models = await remoteDataSource.getMessages(chatId);
      
      // Map 'isMe' correctly if we have currentUserId
      final messages = models.map((m) {
         if (currentUserId != null) {
            return Message(
              id: m.id,
              senderId: m.senderId,
              text: m.text,
              createdAt: m.createdAt,
              isMe: m.senderId == currentUserId,
            );
         }
         return m;
      }).toList();

      return Right(messages);
    } on Failure catch (e) {
      return Left(e);
    }
  }

  @override
  Future<Either<Failure, Message>> sendMessage(String chatId, String text) async {
    try {
      final message = await remoteDataSource.sendMessage(chatId, text);
      return Right(Message(
        id: message.id,
        senderId: message.senderId,
        text: message.text,
        createdAt: message.createdAt,
        isMe: true, // Optimistically true for sent messages
      ));
    } on Failure catch (e) {
      return Left(e);
    }
  }
}

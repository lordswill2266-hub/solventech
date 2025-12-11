import 'dart:async';
import 'package:dio/dio.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../../../../core/network/dio_client.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/utils/constants.dart';
import '../models/chat_model.dart';
import '../../domain/repositories/chat_repository.dart';

abstract class ChatRemoteDataSource {
  Future<List<ChatModel>> getChats();
  Future<List<MessageModel>> getMessages(String chatId);
  Future<MessageModel> sendMessage(String chatId, String text);
  
  Stream<MessageModel> get messageStream;
  void initSocket(String userId);
  void disconnectSocket();
}

class ChatRemoteDataSourceImpl implements ChatRemoteDataSource {
  final DioClient dioClient;
  late IO.Socket _socket;
  final _messageController = StreamController<MessageModel>.broadcast();

  ChatRemoteDataSourceImpl(this.dioClient);

  @override
  Stream<MessageModel> get messageStream => _messageController.stream;

  @override
  void initSocket(String userId) {
    // Assuming Socket.IO server is at base URL
    _socket = IO.io(AppConstants.baseUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
       // Add auth query params if needed
      'query': {'userId': userId}, 
    });

    _socket.connect();

    _socket.onConnect((_) {
      print('Socket Connected');
    });

    _socket.on('new_message', (data) {
      if (data != null) {
        // Current user ID check is tricky here without injecting it every time.
        // For simplicity, we assume incoming messages via socket are NOT from 'me' usually 
        // or we handle 'isMe' logic in repository/bloc by storing currentUserId somewhere central.
        // We'll pass raw model and let repo/bloc refine it.
        _messageController.add(MessageModel.fromJson(data));
      }
    });

    _socket.onDisconnect((_) => print('Socket Disconnected'));
  }

  @override
  void disconnectSocket() {
    _socket.disconnect();
  }

  @override
  Future<List<ChatModel>> getChats() async {
    try {
      final response = await dioClient.dio.get('/chats');
      final List data = response.data['data'] ?? response.data;
      return data.map((e) => ChatModel.fromJson(e)).toList();
    } on DioException catch (e) {
      throw ServerFailure(e.response?.data['message'] ?? 'Failed to fetch chats');
    }
  }

  @override
  Future<List<MessageModel>> getMessages(String chatId) async {
    try {
      final response = await dioClient.dio.get('/chats/$chatId/messages');
      final List data = response.data['data'] ?? response.data;
      // We need current user ID to determine 'isMe'. 
      // Often strictly backend handles this or we decode token.
      // For now, we will leave isMe false and map it later or assume backend sends 'isMe'.
      return data.map((e) => MessageModel.fromJson(e)).toList();
    } on DioException catch (e) {
      throw ServerFailure(e.response?.data['message'] ?? 'Failed to fetch messages');
    }
  }

  @override
  Future<MessageModel> sendMessage(String chatId, String text) async {
    try {
      final response = await dioClient.dio.post(
        '/chats/$chatId/messages',
        data: {'text': text},
      );
      return MessageModel.fromJson(response.data, currentUserId: 'ME'); // Temporarily assume success means 'ME'
    } on DioException catch (e) {
      throw ServerFailure(e.response?.data['message'] ?? 'Failed to send message');
    }
  }
}

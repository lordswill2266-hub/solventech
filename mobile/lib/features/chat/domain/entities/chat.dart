import 'package:equatable/equatable.dart';

class Message extends Equatable {
  final String id;
  final String senderId;
  final String text;
  final DateTime createdAt;
  final bool isMe; // Helper to distinguish UI alignment

  const Message({
    required this.id,
    required this.senderId,
    required this.text,
    required this.createdAt,
    this.isMe = false,
  });

  @override
  List<Object?> get props => [id, senderId, text, createdAt, isMe];
}

class Chat extends Equatable {
  final String id; // Conversation ID or User ID of other party
  final String name; // Name of other user
  final String lastMessage;
  final DateTime lastMessageTime;
  final String? avatarUrl;

  const Chat({
    required this.id,
    required this.name,
    required this.lastMessage,
    required this.lastMessageTime,
    this.avatarUrl,
  });

  @override
  List<Object?> get props => [id, name, lastMessage, lastMessageTime, avatarUrl];
}

import '../../domain/entities/chat.dart';

class MessageModel extends Message {
  const MessageModel({
    required super.id,
    required super.senderId,
    required super.text,
    required super.createdAt,
    super.isMe, // This is usually calculated based on current user ID
  });

  factory MessageModel.fromJson(Map<String, dynamic> json, {String? currentUserId}) {
    return MessageModel(
      id: json['id'] ?? '',
      senderId: json['senderId'] ?? '',
      text: json['text'] ?? '',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      isMe: currentUserId != null && json['senderId'] == currentUserId,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'text': text,
      'senderId': senderId,
    };
  }
}

class ChatModel extends Chat {
  const ChatModel({
    required super.id,
    required super.name,
    required super.lastMessage,
    required super.lastMessageTime,
    super.avatarUrl,
  });

  factory ChatModel.fromJson(Map<String, dynamic> json) {
    return ChatModel(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Unknown',
      lastMessage: json['lastMessage'] ?? '',
      lastMessageTime: DateTime.tryParse(json['lastMessageTime'] ?? '') ?? DateTime.now(),
      avatarUrl: json['avatarUrl'],
    );
  }
}

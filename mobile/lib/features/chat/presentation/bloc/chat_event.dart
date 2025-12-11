import 'package:equatable/equatable.dart';
import '../../domain/entities/chat.dart';

abstract class ChatEvent extends Equatable {
  const ChatEvent();
  @override
  List<Object> get props => [];
}

class GetChatsEvent extends ChatEvent {}

class GetMessagesEvent extends ChatEvent {
  final String chatId;
  const GetMessagesEvent(this.chatId);
  @override
  List<Object> get props => [chatId];
}

class SendMessageEvent extends ChatEvent {
  final String chatId;
  final String text;
  const SendMessageEvent(this.chatId, this.text);
  @override
  List<Object> get props => [chatId, text];
}

class ReceiveMessageEvent extends ChatEvent {
  final Message message;
  const ReceiveMessageEvent(this.message);
  @override
  List<Object> get props => [message];
}

class InitSocketEvent extends ChatEvent {}

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../injection_container.dart';
import '../bloc/chat_bloc.dart';
import '../bloc/chat_event.dart';
import '../bloc/chat_state.dart';

class ChatScreen extends StatefulWidget {
  final String chatId;
  final String chatName;

  const ChatScreen({super.key, required this.chatId, required this.chatName});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _controller = TextEditingController();
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _sendMessage(BuildContext context) {
    if (_controller.text.trim().isNotEmpty) {
      context.read<ChatBloc>().add(SendMessageEvent(widget.chatId, _controller.text.trim()));
      _controller.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => sl<ChatBloc>()..add(InitSocketEvent())..add(GetMessagesEvent(widget.chatId)),
      child: Scaffold(
        appBar: AppBar(title: Text(widget.chatName)),
        body: Column(
          children: [
            Expanded(
              child: BlocBuilder<ChatBloc, ChatState>(
                builder: (context, state) {
                  if (state is ChatLoading) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (state is MessagesLoaded) {
                     final messages = state.messages.reversed.toList(); // Reverse for bottom-up list usually
                     if (messages.isEmpty) return const Center(child: Text('Say hello!'));
                     
                     return ListView.builder(
                       reverse: true, // Start from bottom
                       padding: EdgeInsets.all(16.w),
                       itemCount: messages.length,
                       itemBuilder: (context, index) {
                         final msg = messages[index];
                         final isMe = msg.isMe;
                         return Align(
                           alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                           child: Container(
                             margin: EdgeInsets.only(bottom: 8.h),
                             padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
                             decoration: BoxDecoration(
                               color: isMe ? Theme.of(context).primaryColor : Colors.grey[200],
                               borderRadius: BorderRadius.only(
                                 topLeft: Radius.circular(12.r),
                                 topRight: Radius.circular(12.r),
                                 bottomLeft: isMe ? Radius.circular(12.r) : Radius.zero,
                                 bottomRight: isMe ? Radius.zero : Radius.circular(12.r),
                               ),
                             ),
                             child: Text(
                               msg.text,
                               style: TextStyle(color: isMe ? Colors.white : Colors.black87),
                             ),
                           ),
                         );
                       },
                     );
                  }
                  return const SizedBox();
                },
              ),
            ),
            Padding(
              padding: EdgeInsets.all(16.w),
              child: Row(
                children: [
                   Expanded(
                     child: TextField(
                       controller: _controller,
                       decoration: InputDecoration(
                         hintText: 'Type a message...',
                         border: OutlineInputBorder(
                           borderRadius: BorderRadius.circular(24.r),
                           borderSide: BorderSide.none
                         ),
                         filled: true,
                         fillColor: Colors.grey[100],
                         contentPadding: EdgeInsets.symmetric(horizontal: 20.w),
                       ),
                     ),
                   ),
                   SizedBox(width: 8.w),
                   Builder(
                     builder: (context) {
                       return CircleAvatar(
                         backgroundColor: Theme.of(context).primaryColor,
                         child: IconButton(
                           icon: const Icon(Icons.send, color: Colors.white, size: 20),
                           onPressed: () => _sendMessage(context),
                         ),
                       );
                     }
                   ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}

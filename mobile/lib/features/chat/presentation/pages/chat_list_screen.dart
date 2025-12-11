import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../../injection_container.dart';
import '../bloc/chat_bloc.dart';
import '../bloc/chat_event.dart';
import '../bloc/chat_state.dart';

class ChatListScreen extends StatelessWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => sl<ChatBloc>()..add(InitSocketEvent())..add(GetChatsEvent()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Messages'),
        ),
        body: BlocBuilder<ChatBloc, ChatState>(
          builder: (context, state) {
            if (state is ChatLoading) {
              return const Center(child: CircularProgressIndicator());
            } else if (state is ChatError) {
              return Center(child: Text(state.message));
            } else if (state is ChatsLoaded) {
              if (state.chats.isEmpty) {
                return const Center(child: Text('No conversations yet'));
              }
              return ListView.separated(
                 padding: EdgeInsets.all(16.w),
                 separatorBuilder: (context, index) => const Divider(),
                 itemCount: state.chats.length,
                 itemBuilder: (context, index) {
                   final chat = state.chats[index];
                   return ListTile(
                     leading: CircleAvatar(
                       backgroundImage: chat.avatarUrl != null ? NetworkImage(chat.avatarUrl!) : null,
                       child: chat.avatarUrl == null ? Text(chat.name[0]) : null,
                     ),
                     title: Text(chat.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                     subtitle: Text(
                       chat.lastMessage, 
                       maxLines: 1, 
                       overflow: TextOverflow.ellipsis
                     ),
                     trailing: Text(
                       chat.lastMessageTime.toString().substring(11, 16), // HH:mm simplified
                       style: TextStyle(color: Colors.grey, fontSize: 12.sp),
                     ),
                     onTap: () {
                       // Pass chat object or ID
                       context.push('/chat/${chat.id}', extra: chat.name);
                     },
                   );
                 },
              );
            }
            return const SizedBox();
          },
        ),
      ),
    );
  }
}

import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto, GetMessagesDto, MarkAsReadDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('send')
    @ApiOperation({ summary: 'Send a message (HTTP fallback)' })
    @ApiResponse({ status: 201, description: 'Message sent successfully' })
    async sendMessage(@Request() req, @Body() dto: SendMessageDto) {
        const message = await this.chatService.sendMessage({
            orderId: dto.orderId,
            senderId: req.user.id,
            receiverId: dto.receiverId,
            content: dto.content,
        });

        return {
            success: true,
            message: {
                id: message.id,
                orderId: message.orderId,
                content: message.content,
                createdAt: message.createdAt,
            },
        };
    }

    @Get('messages')
    @ApiOperation({ summary: 'Get messages for an order' })
    @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
    async getMessages(@Request() req, @Query() dto: GetMessagesDto) {
        return this.chatService.getMessages(dto.orderId, req.user.id, dto.limit);
    }

    @Post('mark-read')
    @ApiOperation({ summary: 'Mark messages as read' })
    @ApiResponse({ status: 200, description: 'Messages marked as read' })
    async markAsRead(@Request() req, @Body() dto: MarkAsReadDto) {
        return this.chatService.markMessagesAsRead(dto.orderId, req.user.id);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread message count' })
    @ApiResponse({ status: 200, description: 'Unread count retrieved' })
    async getUnreadCount(@Request() req) {
        return this.chatService.getUnreadCount(req.user.id);
    }

    @Get('conversations')
    @ApiOperation({ summary: 'Get all chat conversations' })
    @ApiResponse({ status: 200, description: 'Conversations retrieved' })
    async getConversations(@Request() req) {
        return this.chatService.getConversations(req.user.id);
    }
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Plus, 
  Users, 
  Hash, 
  Settings,
  Search,
  MoreVertical,
  Star,
  Pin
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LiveUserCount } from '@/components/live-user-count';

interface Chat {
  id: string;
  name: string;
  type: 'public' | 'private' | 'group';
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount?: number;
  isActive?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
  userCount?: number;
  isPermanent?: boolean;
  canReset?: boolean;
  canExport?: boolean;
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId?: string;
  onChatSelect: (chatId: string) => void;
  onCreateChat: () => void;
  onResetChat: (chatId: string) => void;
  onExportChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  userCount?: number;
}

export function ChatSidebar({ 
  chats, 
  activeChatId, 
  onChatSelect, 
  onCreateChat,
  onResetChat,
  onExportChat,
  onDeleteChat,
  userCount = 0 
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChatIcon = (type: string) => {
    switch (type) {
      case 'public':
        return <Hash className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getChatTypeColor = (type: string) => {
    switch (type) {
      case 'public':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'group':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatLastMessageTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Chats
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateChat}
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Help</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
        </div>

        {/* Live User Count */}
        <div className="mt-3">
          <LiveUserCount userCount={userCount} />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Pinned Chats */}
          {filteredChats.filter(chat => chat.isPinned).length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 px-2 py-1 mb-2">
                <Pin className="h-3 w-3 text-slate-500" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Pinned
                </span>
              </div>
              {filteredChats
                .filter(chat => chat.isPinned)
                .map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    onClick={() => onChatSelect(chat.id)}
                    onResetChat={onResetChat}
                    onExportChat={onExportChat}
                    onDeleteChat={onDeleteChat}
                    getChatIcon={getChatIcon}
                    getChatTypeColor={getChatTypeColor}
                    formatLastMessageTime={formatLastMessageTime}
                  />
                ))}
            </div>
          )}

          {/* Regular Chats */}
          <div>
            {filteredChats.filter(chat => !chat.isPinned).length > 0 && (
              <div className="flex items-center gap-2 px-2 py-1 mb-2">
                <MessageSquare className="h-3 w-3 text-slate-500" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  All Chats
                </span>
              </div>
            )}
            {filteredChats
              .filter(chat => !chat.isPinned)
              .map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    onClick={() => onChatSelect(chat.id)}
                    onResetChat={onResetChat}
                    onExportChat={onExportChat}
                    onDeleteChat={onDeleteChat}
                    getChatIcon={getChatIcon}
                    getChatTypeColor={getChatTypeColor}
                    formatLastMessageTime={formatLastMessageTime}
                  />
              ))}
          </div>

          {/* Empty State */}
          {filteredChats.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-2">No chats found</p>
              <p className="text-xs text-slate-400">
                {searchQuery ? 'Try a different search term' : 'Create your first chat to get started'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
  onResetChat: (chatId: string) => void;
  onExportChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  getChatIcon: (type: string) => React.ReactNode;
  getChatTypeColor: (type: string) => string;
  formatLastMessageTime: (timestamp?: number) => string;
}

function ChatItem({ 
  chat, 
  isActive, 
  onClick, 
  onResetChat,
  onExportChat,
  onDeleteChat,
  getChatIcon, 
  getChatTypeColor, 
  formatLastMessageTime 
}: ChatItemProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200
        ${isActive 
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
        }
      `}
    >
      {/* Chat Icon */}
      <div className={`
        flex items-center justify-center w-10 h-10 rounded-full
        ${isActive ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-slate-100 dark:bg-slate-800'}
      `}>
        {getChatIcon(chat.type)}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={`
              text-sm font-medium truncate
              ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-slate-100'}
            `}>
              {chat.name}
            </h3>
            {chat.isStarred && (
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            )}
          </div>
          <div className="flex items-center gap-1">
            {chat.lastMessageTime && (
              <span className="text-xs text-slate-500">
                {formatLastMessageTime(chat.lastMessageTime)}
              </span>
            )}
            {chat.unreadCount && chat.unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-slate-500 truncate">
            {chat.lastMessage || 'No messages yet'}
          </p>
          <Badge 
            variant="outline" 
            className={`text-xs ${getChatTypeColor(chat.type)}`}
          >
            {chat.type}
          </Badge>
        </div>
      </div>

      {/* More Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            {chat.isPinned ? 'Unpin' : 'Pin'} Chat
          </DropdownMenuItem>
          <DropdownMenuItem>
            {chat.isStarred ? 'Unstar' : 'Star'} Chat
          </DropdownMenuItem>
          {chat.canReset && (
            <DropdownMenuItem onClick={() => onResetChat(chat.id)}>
              Reset Chat
            </DropdownMenuItem>
          )}
          {chat.canExport && (
            <DropdownMenuItem onClick={() => onExportChat(chat.id)}>
              Export Chat
            </DropdownMenuItem>
          )}
          {!chat.isPermanent && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDeleteChat(chat.id)}
              >
                Delete Chat
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

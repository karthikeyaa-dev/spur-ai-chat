// src/components/ui/sidebar/Sidebar.tsx
import { useState, useEffect } from 'react';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Search, 
  Plus, 
  Pin,
  ChevronDown,
  Clock,
  User,
  Settings,
  Palette,
  LogOut,
  UserCircle,
  Sparkles,
  Moon,
  Sun,
  Monitor,
  HelpCircle,
  Shield,
  Bell,
  ChevronRight
} from "lucide-react";
import { Button } from "../button";
import ConversationList from "./ConversationList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "../dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../dialog";
import { Input } from "../input";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Switch } from "./switch";
import type { Conversation } from "@/types/chat";

interface SidebarProps {
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
  activeConversationId?: string;
  conversations?: Conversation[];
  className?: string;
}

// Mock data - replace with actual data from your backend
const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'React component help',
    lastMessage: 'Thanks for the help!',
    timestamp: new Date().toISOString(),
    isPinned: false,
    isStarred: false,
  },
  {
    id: '2',
    title: 'JavaScript debugging',
    lastMessage: 'Found the issue!',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isPinned: false,
    isStarred: true,
  },
  {
    id: '3',
    title: 'AI model discussion',
    lastMessage: 'That makes sense',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isPinned: false,
    isStarred: false,
  },
  {
    id: '4',
    title: 'Project planning',
    lastMessage: 'Let\'s proceed with this approach',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    isPinned: false,
    isStarred: false,
  },
  {
    id: '5',
    title: 'Code review',
    lastMessage: 'LGTM!',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    isPinned: false,
    isStarred: false,
  },
];

export default function Sidebar({ 
  onNewChat, 
  onSelectConversation,
  activeConversationId: externalActiveId,
  conversations: externalConversations,
  className = ""
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(
    externalConversations || mockConversations
  );
  const [activeConversationId, setActiveConversationId] = useState<string>(
    externalActiveId || '1'
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecentChatsOpen, setIsRecentChatsOpen] = useState(false);
  const [isFooterMenuOpen, setIsFooterMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  // Update conversations when external prop changes
  useEffect(() => {
    if (externalConversations) {
      setConversations(externalConversations);
    }
  }, [externalConversations]);

  // Update active conversation when external prop changes
  useEffect(() => {
    if (externalActiveId) {
      setActiveConversationId(externalActiveId);
    }
  }, [externalActiveId]);

  // User data - replace with actual user data
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '',
    initials: 'JD',
    plan: 'Pro',
  };

  // FIXED: Handle new chat - always call the parent callback if available
  const handleNewChat = () => {
    console.log('New chat clicked from Sidebar');
    if (onNewChat) {
      onNewChat();
    } else {
      // Fallback: create local new conversation
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: `New Chat ${conversations.length + 1}`,
        timestamp: new Date().toISOString(),
        isPinned: false,
        isStarred: false,
      };
      setConversations([newConversation, ...conversations]);
      setActiveConversationId(newConversation.id);
    }
    setIsRecentChatsOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setIsRecentChatsOpen(false);
    if (onSelectConversation) {
      onSelectConversation(id);
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(
      conversations.map((conv) =>
        conv.id === id ? { ...conv, title: newTitle } : conv
      )
    );
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(conversations.filter((conv) => conv.id !== id));
    if (activeConversationId === id) {
      const newActive = conversations[0]?.id || '';
      setActiveConversationId(newActive);
      if (onSelectConversation) {
        onSelectConversation(newActive);
      }
    }
  };

  const handlePinConversation = (id: string) => {
    setConversations(
      conversations.map((conv) =>
        conv.id === id ? { ...conv, isPinned: !conv.isPinned } : conv
      )
    );
  };

  const handleStarConversation = (id: string) => {
    setConversations(
      conversations.map((conv) =>
        conv.id === id ? { ...conv, isStarred: !conv.isStarred } : conv
      )
    );
  };

  const handleShareConversation = (id: string) => {
    console.log('Share conversation:', id);
  };

  const handleDuplicateConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      const newConv: Conversation = {
        ...conv,
        id: Date.now().toString(),
        title: `${conv.title} (Copy)`,
        isPinned: false,
        isStarred: false,
      };
      setConversations([newConv, ...conversations]);
    }
  };

  const handleArchiveConversation = (id: string) => {
    setConversations(conversations.filter((conv) => conv.id !== id));
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/chat/${id}`;
    navigator.clipboard.writeText(url);
    console.log('Link copied:', url);
  };

  // Footer menu handlers
  const handleProfile = () => {
    console.log('Open profile');
    setIsFooterMenuOpen(false);
  };

  const handleSettings = () => {
    console.log('Open settings');
    setIsFooterMenuOpen(false);
  };

  const handlePersonalizations = () => {
    console.log('Open personalizations');
    setIsFooterMenuOpen(false);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    setIsFooterMenuOpen(false);
  };

  const handleThemeChange = (theme: string) => {
    console.log(`Theme changed to: ${theme}`);
    setIsFooterMenuOpen(false);
  };

  const filteredConversations = searchQuery
    ? conversations.filter(conv => 
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Footer Dropdown Component - Reused for both collapsed and expanded
  const FooterDropdown = ({ isCollapsed }: { isCollapsed: boolean }) => (
    <DropdownMenu open={isFooterMenuOpen} onOpenChange={setIsFooterMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button 
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} w-full rounded-lg hover:bg-muted/50 transition-colors p-2 group`}
        >
          <Avatar className={isCollapsed ? "h-11 w-11" : "h-8 w-8"}>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          {!isCollapsed && (
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isFooterMenuOpen ? 'rotate-180' : ''}`} />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        side={isCollapsed ? "right" : "top"} 
        align={isCollapsed ? "start" : "center"} 
        className="w-64"
        sideOffset={isCollapsed ? 8 : 5}
        collisionPadding={{ right: 10 }}
      >
        <DropdownMenuLabel className="flex items-center gap-3 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            {user.plan && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                {user.plan}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile</span>
          <ChevronRight className="ml-auto h-3 w-3 text-muted-foreground" />
        </DropdownMenuItem>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
                <div className="ml-auto">
                  <Switch 
                    checked={isNotificationsEnabled}
                    onCheckedChange={setIsNotificationsEnabled}
                    className="scale-75"
                  />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Privacy & Security</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Palette className="mr-2 h-4 w-4" />
            <span>Personalizations</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-48">
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Theme
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleThemeChange('light')} className="cursor-pointer">
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
                {!isDarkMode && (
                  <span className="ml-auto text-xs text-primary">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('dark')} className="cursor-pointer">
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
                {isDarkMode && (
                  <span className="ml-auto text-xs text-primary">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('system')} className="cursor-pointer">
                <Monitor className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Customize Appearance</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Collapsed view
  if (isCollapsed) {
    return (
      <>
        <aside className={`flex flex-col items-center border-r bg-background h-screen w-[72px] py-4 gap-2 overflow-visible ${className}`}>
          {/* Logo */}
          <div className="flex h-10 w-10 items-center justify-center flex-shrink-0 mb-1">
            <svg
              className="h-8 w-8 text-primary"
              viewBox="0 0 143 180"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M97.6942 41.4769C102.953 41.4769 107.908 41.3299 112.848 41.5225C117.276 41.6947 121.897 41.5427 126.077 42.7536C138.363 46.3154 145.208 59.2401 141.753 71.6125C137.137 88.1547 132.521 104.702 127.683 121.178C120.63 145.189 99.1027 161.087 73.6333 161.285C64.7922 161.356 55.9512 161.244 47.1101 161.366C45.8282 161.386 44.3134 161.964 43.3305 162.795C38.4311 166.919 33.6889 171.225 28.8706 175.451C19.2037 183.922 4.17133 179.322 0.903426 166.863C0.589302 165.662 0.538637 164.365 0.538637 163.109C0.523438 130.171 0.523438 97.2339 0.523438 64.3015C0.523438 53.3933 9.27838 43.2755 20.1157 41.9582C24.5235 41.4211 29.0074 41.4769 33.9017 41.2438C33.9017 38.6295 33.6585 35.8581 33.9574 33.1526C34.4032 29.1602 34.7224 25.031 36.0093 21.2767C40.7415 7.48559 54.8213 -1.12749 69.3774 0.438064C83.6346 1.97322 95.6625 13.6465 97.3953 27.853C97.8107 31.2729 97.6131 34.7688 97.6891 38.2292C97.7094 39.2223 97.6891 40.2153 97.6891 41.4769H97.6942ZM13.2353 113.634C13.2353 129.503 13.2455 145.371 13.2252 161.244C13.2252 163.418 13.6711 165.343 15.8041 166.301C17.9269 167.253 19.6445 166.351 21.2759 164.882C26.3526 160.322 31.5255 155.874 36.597 151.309C38.9834 149.161 41.6788 148.223 44.8707 148.244C54.5477 148.304 64.2248 148.309 73.9018 148.254C93.4231 148.142 109.702 136.018 115.245 117.216C119.956 101.236 124.197 85.1199 129.015 69.1705C131.478 61.0134 125.388 54.432 118.031 54.4877C87.1457 54.7056 56.2602 54.6904 25.3747 54.4877C19.1277 54.4472 13.1036 58.4092 13.1897 66.7791C13.3468 82.3941 13.2353 98.0091 13.2353 113.629V113.634ZM86.8974 41.3553C86.8974 37.9354 87.0089 34.7384 86.8772 31.5516C86.5175 22.8321 81.0051 15.3032 73.0456 12.471C64.6352 9.4818 55.8042 11.8175 49.8764 18.5103C43.9536 25.1981 44.6984 33.2286 45.0176 41.3553H86.8924H86.8974Z"
                fill="currentColor"
              />
              <path
                d="M97.6635 97.9939C96.7869 114.572 84.4702 127.643 69.6405 129.148C52.3384 130.901 37.7823 119.359 34.636 103.825C34.1698 101.53 33.9621 99.144 33.957 96.7982C33.952 93.6164 36.3586 91.2199 39.2668 91.1541C42.104 91.0882 44.4194 93.2161 44.8045 96.3219C45.0325 98.156 44.9514 100.051 45.3516 101.839C47.7278 112.423 57.1617 119.344 67.8065 118.427C78.208 117.53 86.431 108.715 86.9022 97.9432C86.9326 97.2694 86.8768 96.5854 86.9528 95.9217C87.2568 93.2415 89.633 91.1439 92.3031 91.1591C94.8667 91.1743 97.1771 93.1503 97.5469 95.7291C97.6888 96.7222 97.6533 97.7456 97.6635 97.9939V97.9939Z"
                fill="currentColor"
              />
            </svg>
          </div>

          {/* New Chat Button */}
          <button
            className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            onClick={handleNewChat}
            title="New Chat"
          >
            <Plus className="h-5 w-5" />
          </button>

          {/* Search Button */}
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            onClick={() => setIsSearchOpen(true)}
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Recent Chats Dropdown */}
          <DropdownMenu open={isRecentChatsOpen} onOpenChange={setIsRecentChatsOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground relative"
                title="Recent Chats"
              >
                <Clock className="h-5 w-5" />
                {conversations.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[9px] text-primary-foreground items-center justify-center">
                      {conversations.length > 9 ? '9+' : conversations.length}
                    </span>
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-64 max-h-[400px] overflow-y-auto">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Recent Chats</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {conversations.length} conversations
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {conversations.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <DropdownMenuItem
                    key={conv.id}
                    className="cursor-pointer px-2 py-2 flex items-start gap-2"
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">
                          {conv.title}
                        </span>
                        {conv.isPinned && (
                          <Pin className="h-3 w-3 text-primary fill-primary flex-shrink-0" />
                        )}
                        {conv.isStarred && (
                          <span className="text-yellow-500 text-xs flex-shrink-0">⭐</span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessage}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                        {formatTime(conv.timestamp)}
                      </p>
                    </div>
                    {conv.id === activeConversationId && (
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    )}
                  </DropdownMenuItem>
                ))
              )}
              
              {conversations.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer justify-center text-primary"
                    onClick={() => {
                      setIsRecentChatsOpen(false);
                    }}
                  >
                    <span className="text-sm">View All Conversations</span>
                    <ChevronDown className="ml-1 h-3 w-3 rotate-[-90deg]" />
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Expand Button */}
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            onClick={() => setIsCollapsed(false)}
            title="Expand sidebar"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>

          {/* Divider */}
          <div className="w-10 h-px bg-border my-1" />

          {/* Quick access - pinned conversations */}
          <div className="flex-1 overflow-y-auto overflow-x-visible w-full px-1.5 space-y-1 custom-scrollbar">
            {conversations
              .filter(conv => conv.isPinned)
              .slice(0, 3)
              .map((conv) => (
                <button
                  key={conv.id}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors mx-auto ${
                    conv.id === activeConversationId 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => handleSelectConversation(conv.id)}
                  title={`${conv.title} (Pinned)`}
                >
                  <span className="text-sm font-medium">
                    {conv.title.charAt(0).toUpperCase()}
                  </span>
                  <div className="absolute -top-0.5 -right-0.5">
                    <Pin className="h-3 w-3 text-primary fill-primary" />
                  </div>
                  {conv.id === activeConversationId && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r" />
                  )}
                </button>
              ))}
          </div>

          {/* Footer - User Avatar with Dropdown */}
          <div className="w-full px-1.5 pt-1 border-t">
            <FooterDropdown isCollapsed={true} />
          </div>
        </aside>

        {/* Search Dialog */}
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Search Conversations</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or message..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              
              <div className="max-h-[300px] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations found</p>
                    <p className="text-xs">Try adjusting your search terms</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors flex items-center justify-between group"
                        onClick={() => {
                          handleSelectConversation(conv.id);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{conv.title}</p>
                          {conv.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.lastMessage}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground/70">
                            {formatTime(conv.timestamp)}
                          </p>
                        </div>
                        {conv.isPinned && (
                          <Pin className="h-3 w-3 text-primary fill-primary ml-2 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground border-t pt-3">
                <kbd className="px-2 py-1 bg-muted rounded-md">↑↓</kbd> Navigate •{' '}
                <kbd className="px-2 py-1 bg-muted rounded-md">Enter</kbd> Select •{' '}
                <kbd className="px-2 py-1 bg-muted rounded-md">Esc</kbd> Close
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Expanded view
  return (
    <aside 
      className={`flex flex-col border-r bg-background transition-all duration-300 h-screen overflow-visible ${className}`}
      style={{ width: '280px' }}
    >
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b px-4 w-full flex-shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 items-center justify-center flex-shrink-0">
            <svg
              className="h-7 w-7 text-primary"
              viewBox="0 0 143 180"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M97.6942 41.4769C102.953 41.4769 107.908 41.3299 112.848 41.5225C117.276 41.6947 121.897 41.5427 126.077 42.7536C138.363 46.3154 145.208 59.2401 141.753 71.6125C137.137 88.1547 132.521 104.702 127.683 121.178C120.63 145.189 99.1027 161.087 73.6333 161.285C64.7922 161.356 55.9512 161.244 47.1101 161.366C45.8282 161.386 44.3134 161.964 43.3305 162.795C38.4311 166.919 33.6889 171.225 28.8706 175.451C19.2037 183.922 4.17133 179.322 0.903426 166.863C0.589302 165.662 0.538637 164.365 0.538637 163.109C0.523438 130.171 0.523438 97.2339 0.523438 64.3015C0.523438 53.3933 9.27838 43.2755 20.1157 41.9582C24.5235 41.4211 29.0074 41.4769 33.9017 41.2438C33.9017 38.6295 33.6585 35.8581 33.9574 33.1526C34.4032 29.1602 34.7224 25.031 36.0093 21.2767C40.7415 7.48559 54.8213 -1.12749 69.3774 0.438064C83.6346 1.97322 95.6625 13.6465 97.3953 27.853C97.8107 31.2729 97.6131 34.7688 97.6891 38.2292C97.7094 39.2223 97.6891 40.2153 97.6891 41.4769H97.6942ZM13.2353 113.634C13.2353 129.503 13.2455 145.371 13.2252 161.244C13.2252 163.418 13.6711 165.343 15.8041 166.301C17.9269 167.253 19.6445 166.351 21.2759 164.882C26.3526 160.322 31.5255 155.874 36.597 151.309C38.9834 149.161 41.6788 148.223 44.8707 148.244C54.5477 148.304 64.2248 148.309 73.9018 148.254C93.4231 148.142 109.702 136.018 115.245 117.216C119.956 101.236 124.197 85.1199 129.015 69.1705C131.478 61.0134 125.388 54.432 118.031 54.4877C87.1457 54.7056 56.2602 54.6904 25.3747 54.4877C19.1277 54.4472 13.1036 58.4092 13.1897 66.7791C13.3468 82.3941 13.2353 98.0091 13.2353 113.629V113.634ZM86.8974 41.3553C86.8974 37.9354 87.0089 34.7384 86.8772 31.5516C86.5175 22.8321 81.0051 15.3032 73.0456 12.471C64.6352 9.4818 55.8042 11.8175 49.8764 18.5103C43.9536 25.1981 44.6984 33.2286 45.0176 41.3553H86.8924H86.8974Z"
                fill="currentColor"
              />
              <path
                d="M97.6635 97.9939C96.7869 114.572 84.4702 127.643 69.6405 129.148C52.3384 130.901 37.7823 119.359 34.636 103.825C34.1698 101.53 33.9621 99.144 33.957 96.7982C33.952 93.6164 36.3586 91.2199 39.2668 91.1541C42.104 91.0882 44.4194 93.2161 44.8045 96.3219C45.0325 98.156 44.9514 100.051 45.3516 101.839C47.7278 112.423 57.1617 119.344 67.8065 118.427C78.208 117.53 86.431 108.715 86.9022 97.9432C86.9326 97.2694 86.8768 96.5854 86.9528 95.9217C87.2568 93.2415 89.633 91.1439 92.3031 91.1591C94.8667 91.1743 97.1771 93.1503 97.5469 95.7291C97.6888 96.7222 97.6533 97.7456 97.6635 97.9939V97.9939Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="flex flex-col leading-tight">
            <h1 className="text-sm font-semibold">Spur</h1>
            <span className="text-[10px] text-muted-foreground">AI Chat</span>
          </div>
        </div>

        <button
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          onClick={() => setIsCollapsed(true)}
          title="Collapse sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </header>
      
      {/* New Chat Button */}
      <div className="flex-shrink-0 px-4 pt-3 pb-1">
        <Button
          onClick={handleNewChat}
          className="h-10 w-full rounded-xl bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="font-medium">New Chat</span>
        </Button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-hidden">
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
          onPinConversation={handlePinConversation}
          onStarConversation={handleStarConversation}
          onShareConversation={handleShareConversation}
          onDuplicateConversation={handleDuplicateConversation}
          onArchiveConversation={handleArchiveConversation}
          onCopyLink={handleCopyLink}
          onNewConversation={handleNewChat}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Footer - User Profile with Dropdown */}
      <div className="border-t p-3 flex-shrink-0">
        <FooterDropdown isCollapsed={false} />
      </div>
    </aside>
  );
}

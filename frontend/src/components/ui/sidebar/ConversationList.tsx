import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Search, Plus } from "lucide-react";

import { Button } from "../button";
import { Input } from "../input";
import { ScrollArea } from "../scroll-area";

import ConversationItem from "./ConversationItem";

interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  isPinned?: boolean;
  isStarred?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  onDeleteConversation?: (id: string) => void;
  onPinConversation?: (id: string) => void;
  onShareConversation?: (id: string) => void;
  onDuplicateConversation?: (id: string) => void;
  onArchiveConversation?: (id: string) => void;
  onStarConversation?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  onNewConversation?: () => void;
  isCollapsed?: boolean;
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  onPinConversation,
  onShareConversation,
  onDuplicateConversation,
  onArchiveConversation,
  onStarConversation,
  onCopyLink,
  onNewConversation,
  isCollapsed = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const activeItemRef = useRef<HTMLDivElement>(null);

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  useEffect(() => {
    if (activeItemRef.current) {
      requestAnimationFrame(() => {
        activeItemRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  }, [activeConversationId, sortedConversations]);

  if (isCollapsed) return null;

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="flex-shrink-0 px-4 pt-1 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 rounded-lg border-muted bg-muted/30 pl-9 text-sm focus-visible:bg-background"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full px-2">
          <div className="space-y-1 px-2 pb-3">
            {sortedConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "No conversations found"
                    : "No conversations yet"}
                </p>

                {!searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 rounded-lg"
                    onClick={onNewConversation}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Start a new chat
                  </Button>
                )}
              </div>
            ) : (
              sortedConversations.map((conv) => (
                <div
                  key={conv.id}
                  ref={
                    conv.id === activeConversationId
                      ? activeItemRef
                      : undefined
                  }
                  className="mb-1"
                >
                  <ConversationItem
                    {...conv}
                    isActive={conv.id === activeConversationId}
                    onSelect={onSelectConversation}
                    onRename={onRenameConversation}
                    onDelete={onDeleteConversation}
                    onPin={onPinConversation}
                    onShare={onShareConversation}
                    onDuplicate={onDuplicateConversation}
                    onArchive={onArchiveConversation}
                    onStar={onStarConversation}
                    onCopyLink={onCopyLink}
                  />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

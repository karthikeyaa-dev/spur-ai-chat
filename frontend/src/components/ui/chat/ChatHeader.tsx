// src/components/ui/chat/ChatHeader.tsx
import { Share, MoreVertical, Edit, Copy, Trash2 } from "lucide-react";
import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../dropdown-menu";

interface ChatHeaderProps {
  chatName?: string;
  onShare?: () => void;
  onRename?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export default function ChatHeader({ 
  chatName = "New Chat",
  onShare, 
  onRename,
  onDuplicate,
  onDelete
}: ChatHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4 w-full flex-shrink-0">
      {/* Left side - Chat Name */}
      <div className="flex items-center min-w-0">
        <h2 className="text-sm font-semibold truncate">
          {chatName}
        </h2>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-8 h-8 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          onClick={onShare}
          title="Share"
        >
          <Share className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRename}>
              <Edit className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

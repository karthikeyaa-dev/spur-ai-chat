// src/components/ui/sidebar/NewChatButton.tsx
import { Plus } from "lucide-react";
import { Button } from "../button";

interface NewChatButtonProps {
  onClick?: () => void;
  isCollapsed?: boolean;
}

export default function NewChatButton({ 
  onClick, 
  isCollapsed = false 
}: NewChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`
        w-full bg-primary text-primary-foreground hover:bg-primary/90 
        transition-all duration-300 gap-2 shadow-sm
        ${isCollapsed ? 'px-2 justify-center' : 'px-4 justify-start'}
      `}
      size={isCollapsed ? "icon" : "default"}
    >
      <Plus className="h-4 w-4 flex-shrink-0" />
      {!isCollapsed && <span>New Chat</span>}
    </Button>
  );
}

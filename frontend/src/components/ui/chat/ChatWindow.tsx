// src/components/ui/chat/ChatWindow.tsx
import ChatHeader from "./ChatHeader";

interface ChatWindowProps {
  conversationId?: string;
  className?: string;
  chatName?: string;
}

export default function ChatWindow({ 
  conversationId,
  className = "",
  chatName = "New Chat"
}: ChatWindowProps) {
  
  const handleShare = () => {
    console.log('Share conversation:', conversationId);
  };

  const handleRename = () => {
    console.log('Rename conversation:', conversationId);
  };

  const handleDuplicate = () => {
    console.log('Duplicate conversation:', conversationId);
  };

  const handleDelete = () => {
    console.log('Delete conversation:', conversationId);
  };

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      <ChatHeader 
        chatName={chatName}
        onShare={handleShare}
        onRename={handleRename}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
      
      {/* Chat content placeholder */}
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Chat content coming soon...
      </div>
    </div>
  );
}

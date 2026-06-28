// src/components/ui/sidebar/ConversationItem.tsx
import { 
  Trash2, 
  Edit2, 
  MoreVertical, 
  Pin, 
  Share2, 
  Copy,
  Archive,
  Star,
  Link
} from "lucide-react";
import { Button } from "../button";
import { useState, useRef, useEffect } from "react";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

interface ConversationItemProps {
  id: string;
  title: string;
  lastMessage?: string;
  isActive?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
  onSelect?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  onShare?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onArchive?: (id: string) => void;
  onStar?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  isCollapsed?: boolean;
}

export default function ConversationItem({
  id,
  title,
  lastMessage,
  isActive = false,
  isPinned = false,
  isStarred = false,
  onSelect,
  onRename,
  onDelete,
  onPin,
  onShare,
  onDuplicate,
  onArchive,
  onStar,
  onCopyLink,
  isCollapsed = false,
}: ConversationItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [menuPosition, setMenuPosition] = useState<'bottom' | 'top'>('bottom');
  const itemRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Scroll into view when active
  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isActive]);

  // Calculate menu position when opening
  useEffect(() => {
    if (showMenu && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const menuHeight = 280;
      
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      if (spaceAbove > spaceBelow && spaceAbove > menuHeight) {
        setMenuPosition('top');
      } else {
        setMenuPosition('bottom');
      }
    }
  }, [showMenu]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleRename = () => {
    if (editedTitle.trim() && editedTitle !== title) {
      onRename?.(id, editedTitle.trim());
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete?.(id);
  };

  const handlePin = () => {
    onPin?.(id);
    setShowMenu(false);
  };

  const handleShare = () => {
    setShowShareDialog(true);
    setShowMenu(false);
  };

  const handleDuplicate = () => {
    onDuplicate?.(id);
    setShowMenu(false);
  };

  const handleArchive = () => {
    onArchive?.(id);
    setShowMenu(false);
  };

  const handleStar = () => {
    onStar?.(id);
    setShowMenu(false);
  };

  const handleCopyLink = () => {
    onCopyLink?.(id);
    setShowMenu(false);
  };

  // Menu items configuration
  const menuItems = [
    {
      label: 'Rename',
      icon: Edit2,
      onClick: () => {
        setIsEditing(true);
        setShowMenu(false);
      },
      className: 'hover:bg-muted',
    },
    {
      label: isPinned ? 'Unpin' : 'Pin',
      icon: Pin,
      onClick: handlePin,
      className: 'hover:bg-muted',
    },
    {
      label: isStarred ? 'Unstar' : 'Star',
      icon: Star,
      onClick: handleStar,
      className: 'hover:bg-muted',
    },
    {
      label: 'Share',
      icon: Share2,
      onClick: handleShare,
      className: 'hover:bg-muted',
    },
    {
      label: 'Copy Link',
      icon: Link,
      onClick: handleCopyLink,
      className: 'hover:bg-muted',
    },
    {
      label: 'Duplicate',
      icon: Copy,
      onClick: handleDuplicate,
      className: 'hover:bg-muted',
    },
    {
      label: 'Archive',
      icon: Archive,
      onClick: handleArchive,
      className: 'hover:bg-muted',
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: () => {
        setShowDeleteDialog(true);
        setShowMenu(false);
      },
      className: 'text-destructive hover:bg-destructive/10',
    },
  ];

  // Collapsed view
  if (isCollapsed) {
    return (
      <>
        <div
          ref={itemRef}
          className="relative flex items-center justify-center p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors mx-auto w-10 h-10 group"
          onClick={() => onSelect?.(id)}
          title={title}
        >
          <span className="text-xs font-medium">
            {title.charAt(0).toUpperCase()}
          </span>
          
          {isPinned && (
            <div className="absolute -top-0.5 -right-0.5">
              <Pin className="h-2.5 w-2.5 text-primary fill-primary" />
            </div>
          )}
          
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r" />
          )}
          
          <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full p-0 bg-background shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>

          {showMenu && (
            <div 
              ref={menuRef}
              className={`absolute right-[-10px] z-10 min-w-[180px] bg-background rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border py-1 ${
                menuPosition === 'top' 
                  ? 'bottom-full mb-1' 
                  : 'top-full mt-1'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${item.className}`}
                  onClick={item.onClick}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title={`Delete "${title}"?`}
          description="This conversation will be permanently removed. This action cannot be undone."
        />

        {showShareDialog && (
          <ShareDialog
            isOpen={showShareDialog}
            onClose={() => setShowShareDialog(false)}
            conversationTitle={title}
            conversationId={id}
          />
        )}
      </>
    );
  }

  // Expanded view
  return (
    <>
      <div
        ref={itemRef}
        className={`
          group relative flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all
          ${isActive 
            ? 'bg-primary/10 text-primary hover:bg-primary/15' 
            : 'hover:bg-muted'
          }
        `}
        onClick={() => onSelect?.(id)}
      >
        {isPinned && (
          <Pin className="h-3.5 w-3.5 text-primary fill-primary flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditedTitle(title);
                }
              }}
              className="w-full bg-background border border-primary rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{title}</span>
                {isStarred && (
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                )}
              </div>
              {lastMessage && (
                <div className="text-xs text-muted-foreground truncate">{lastMessage}</div>
              )}
            </>
          )}
        </div>

        {!isEditing && (
          <div className="relative flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showMenu && (
              <div 
                ref={menuRef}
                className={`absolute right-[-8px] z-10 min-w-[200px] bg-background rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border py-1 ${
                  menuPosition === 'top' 
                    ? 'bottom-full mb-1' 
                    : 'top-full mt-1'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${item.className}`}
                    onClick={item.onClick}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isActive && !isCollapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r" />
      )}

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={`Delete "${title}"?`}
        description="This conversation will be permanently removed. All messages in this conversation will also be deleted. This action cannot be undone."
      />

      {showShareDialog && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          conversationTitle={title}
          conversationId={id}
        />
      )}
    </>
  );
}

// Share Dialog Component
interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationTitle: string;
  conversationId: string;
}

function ShareDialog({ isOpen, onClose, conversationTitle, conversationId }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/chat/${conversationId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-200 border">
        <h3 className="text-lg font-semibold">Share Conversation</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Share "{conversationTitle}" with others
        </p>
        
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 text-sm border rounded-lg bg-muted/50 focus:outline-none"
          />
          <Button onClick={handleCopy} size="sm">
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

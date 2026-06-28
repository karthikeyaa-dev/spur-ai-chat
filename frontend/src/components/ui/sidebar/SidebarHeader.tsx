// src/components/ui/sidebar/SidebarHeader.tsx
import { PanelLeftClose } from "lucide-react";
import { Button } from "../button";

interface SidebarHeaderProps {
  onCollapse?: () => void;
  isCollapsed?: boolean;
}

export default function SidebarHeader({ 
  onCollapse, 
  isCollapsed = false 
}: SidebarHeaderProps) {
  console.log('Header isCollapsed:', isCollapsed); // Debug

  return (
    <header className="flex h-16 items-center justify-between border-b px-6 w-full">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground flex-shrink-0">
          <span className="text-lg font-bold">S</span>
        </div>

        {!isCollapsed && (
          <div className="flex flex-col leading-tight">
            <h1 className="text-base font-semibold">Spur</h1>
            <span className="text-xs text-muted-foreground">AI Chat</span>
          </div>
        )}
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-lg flex-shrink-0"
        onClick={() => {
          console.log('Button clicked'); // Debug
          onCollapse?.();
        }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <PanelLeftClose className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
      </Button>
    </header>
  );
}

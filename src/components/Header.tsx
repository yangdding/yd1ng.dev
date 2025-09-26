import { Github, Menu, LogOut, Settings, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
  onPasswordReset: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ currentPage, onPageChange, isAdmin, onLoginClick, onLogout, onPasswordReset, isDarkMode, onToggleDarkMode, onToggleSidebar, isSidebarOpen }: HeaderProps) {
  // Use favicon from public to avoid bundling path issues
  const logoUrl = "/favicon-32x32.png";
  const navItems = [
    { name: "Posts", key: "posts" },
    { name: "About", key: "about" }
  ];

  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => onPageChange("posts")}
          >
            <img src={logoUrl} alt="yd1ng logo" className="h-6 w-6 rounded-sm" />
            <div>
              <h1 className="text-lg font-mono">yd1ng.dev</h1>
              <p className="text-xs text-muted-foreground">security researcher & developer</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onPageChange(item.key)}
                className={`transition-colors ${
                  currentPage === item.key 
                    ? "text-primary font-medium" 
                    : "text-foreground hover:text-primary"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onToggleDarkMode}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => window.open('https://github.com/yangdding', '_blank')}
            >
              <Github className="h-4 w-4" />
            </Button>
            
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={onToggleSidebar}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
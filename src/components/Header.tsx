import { Github, Menu, LogOut, Settings, Sun, Moon, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
  onPasswordReset: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onCategoryClick?: (categoryId: string | null) => void;
  selectedCategory?: string | null;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ currentPage, onPageChange, isAdmin, onLoginClick, onLogout, onPasswordReset, isDarkMode, onToggleDarkMode, onCategoryClick, selectedCategory, onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // App brand logo
  // Importing SVG as url works with Vite bundler
  // The svg file is located at the project root
  // Use a simple img for broad compatibility
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - allow importing asset as string
  const logoUrl = new URL("../../yd1ng.svg", import.meta.url).href;
  const navItems = [
    { name: "Posts", key: "posts" },
    { name: "About", key: "about" }
  ];

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handlePageChange = (page: string) => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

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
            {/* Sidebar Toggle Button */}
            {onToggleSidebar && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onToggleSidebar}
                title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
                className="hidden md:flex"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            
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
            
            {isAdmin ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10" title="Admin Settings">
                      <Settings className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onPasswordReset}>
                      Reset Password
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" onClick={onLogout} className="flex items-center space-x-1">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={onLoginClick}>
                Admin
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={handleMobileMenuToggle}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handlePageChange(item.key)}
                    className={`text-left py-2 px-3 rounded-md transition-colors ${
                      currentPage === item.key 
                        ? "text-primary font-medium bg-accent" 
                        : "text-foreground hover:text-primary hover:bg-accent"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
                
                {/* Mobile Category Filter */}
                {currentPage === "posts" && onCategoryClick && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Categories</h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => onCategoryClick(null)}
                        className={`w-full text-left py-2 px-3 rounded-md transition-colors ${
                          selectedCategory === null 
                            ? "text-primary font-medium bg-accent" 
                            : "text-foreground hover:text-primary hover:bg-accent"
                        }`}
                      >
                        All Posts
                      </button>
                      <button
                        onClick={() => onCategoryClick("security")}
                        className={`w-full text-left py-2 px-3 rounded-md transition-colors ${
                          selectedCategory === "security" 
                            ? "text-primary font-medium bg-accent" 
                            : "text-foreground hover:text-primary hover:bg-accent"
                        }`}
                      >
                        Security
                      </button>
                      <button
                        onClick={() => onCategoryClick("development")}
                        className={`w-full text-left py-2 px-3 rounded-md transition-colors ${
                          selectedCategory === "development" 
                            ? "text-primary font-medium bg-accent" 
                            : "text-foreground hover:text-primary hover:bg-accent"
                        }`}
                      >
                        Development
                      </button>
                      <button
                        onClick={() => onCategoryClick("research")}
                        className={`w-full text-left py-2 px-3 rounded-md transition-colors ${
                          selectedCategory === "research" 
                            ? "text-primary font-medium bg-accent" 
                            : "text-foreground hover:text-primary hover:bg-accent"
                        }`}
                      >
                        Research
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Mobile Admin Section */}
                <div className="border-t pt-4 mt-4">
                  {isAdmin ? (
                    <div className="space-y-2">
                      <button
                        onClick={onPasswordReset}
                        className="w-full text-left py-2 px-3 rounded-md text-foreground hover:text-primary hover:bg-accent transition-colors"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={onLogout}
                        className="w-full text-left py-2 px-3 rounded-md text-foreground hover:text-primary hover:bg-accent transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onLoginClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-2 px-3 rounded-md text-foreground hover:text-primary hover:bg-accent transition-colors"
                    >
                      Admin Login
                    </button>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
import React from "react";
import { Github, Mail, Linkedin, Twitter, LogOut } from "lucide-react";
import { Button } from "./ui/button";

interface FooterProps {
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
  onPasswordReset: () => void;
}

export function Footer({ isAdmin, onLoginClick, onLogout, onPasswordReset }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handlePasswordReset = () => {
    console.log('Password reset clicked');
    onPasswordReset();
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    onLogout();
  };

  const handleLoginClick = () => {
    console.log('Login clicked');
    onLoginClick();
  };

  return (
    <footer className="border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 mt-16">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
          <div className="flex items-center space-x-4">
            <p className="text-xs text-muted-foreground">
              © {currentYear} yd1ng.dev. All rights reserved.
            </p>
            
            {/* Admin Section */}
            <div className="flex items-center space-x-2">
              {isAdmin ? (
                <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs flex items-center">
                  <LogOut className="h-3 w-3 mr-1" />
                  Logout
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleLoginClick} className="text-xs">
                  Admin
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

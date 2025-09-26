import React from "react";
import { Button } from "./ui/button";
import { Home, ArrowLeft } from "lucide-react";

interface NotFoundProps {
  onGoHome: () => void;
  onGoBack: () => void;
}

export function NotFound({ onGoHome, onGoBack }: NotFoundProps) {
  return (
    <div 
      className="min-h-screen bg-background flex items-center justify-center p-4"
      style={{
        alignItems: window.innerWidth >= 640 ? 'flex-start' : 'center',
        paddingTop: window.innerWidth >= 640 ? '1rem' : '0'
      }}
    >
      <div className="text-center">
        <div 
          className="font-bold text-muted-foreground mb-4 leading-none" 
          style={{ fontSize: 'clamp(6rem, 15vw, 12rem)' }}
        >
          404
        </div>
        <div className="text-xl sm:text-2xl font-semibold mb-4">NOT FOUND</div>
        <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-md mx-auto">
          The page you're looking for cannot be found or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={onGoBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={onGoHome} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

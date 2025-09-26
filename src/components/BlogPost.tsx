import React, { useState } from "react";
import { Calendar, Share2, Edit, Trash2, Lock } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { sanitizeHtml, createSafeMarkdownHtml } from "../utils/xss-protection";

interface BlogPostProps {
  id?: string;
  title: string;
  excerpt: string;
  content?: string;
  date?: string;
  created_at?: string;
  published_at?: string;
  tags: string[];
  featured?: boolean;
  password?: string;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onRead?: () => void;
  onAuthenticated?: (postId: string) => void;
}

export function BlogPost({ 
  id,
  title, 
  excerpt, 
  content,
  date, 
  created_at,
  published_at,
  tags, 
  featured = false,
  password,
  isAdmin = false,
  onEdit,
  onDelete,
  onRead,
  onAuthenticated
}: BlogPostProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordError, setPasswordError] = useState("");


  const formatDate = (value?: string) => {
    if (!value) return '';
    
    try {
      // Handle different date formats
      let date: Date;
      
      if (value.includes('T')) {
        // ISO string format
        date = new Date(value);
      } else if (value.includes('-')) {
        // YYYY-MM-DD format
        date = new Date(value + 'T00:00:00');
      } else {
        // Fallback
        date = new Date(value);
      }
      
      if (isNaN(date.getTime())) {
        return value; // Return original if parsing fails
      }
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return value;
    }
  };

  const getPreviewText = () => {
    // 비밀글이면 미리보기 숨김
    if (password && !isAdmin) {
      return "🔒 비밀글입니다.";
    }
    
    // excerpt가 있으면 사용 (sanitize 적용)
    if (excerpt && excerpt.trim()) {
      return sanitizeHtml(excerpt);
    }
    
    // content가 있으면 첫 150자만 표시
    if (content && content.trim()) {
      const plainText = content.replace(/[#*`_~\[\]()]/g, '').replace(/\n+/g, ' ').trim();
      return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    }
    
    return "내용을 확인하려면 클릭하세요.";
  };

  const displayDate = formatDate(published_at || date || created_at);

  const handlePostClick = () => {
    if (password && !isAdmin) {
      setShowPasswordDialog(true);
      setPasswordError("");
    } else {
      onRead?.();
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === password) {
      setShowPasswordDialog(false);
      setPasswordInput("");
      setPasswordError("");
      onAuthenticated?.(id || "");
      onRead?.();
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const generatePostUrl = () => {
    const baseUrl = window.location.origin;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${baseUrl}/post/${id}`;
  };

  const handleShare = async () => {
    if (!id) return;
    
    setIsSharing(true);
    const postUrl = generatePostUrl();
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: excerpt,
          url: postUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(postUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      if (err.name !== 'AbortError') {
        // Try copying to clipboard as fallback
        try {
          await navigator.clipboard.writeText(postUrl);
          alert('Link copied to clipboard!');
        } catch (clipboardErr) {
          console.error('Failed to copy to clipboard:', clipboardErr);
          alert('Unable to share. Please copy the URL manually.');
        }
      }
    } finally {
      setIsSharing(false);
    }
  };
  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 max-w-full ${featured ? 'border-primary' : ''}`}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <h2 
                className="text-xl font-mono group-hover:text-primary transition-colors cursor-pointer"
                onClick={handlePostClick}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(title) }}
              >
              </h2>
              {password && !isAdmin && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{displayDate}</span>
              </div>
            </div>
          </div>
          {featured && (
            <Badge variant="default" className="ml-4">
              Featured
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p 
          className="text-muted-foreground leading-relaxed cursor-pointer hover:text-foreground transition-colors"
          onClick={handlePostClick}
        >
          {getPreviewText()}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
            >
              <Share2 className="h-4 w-4" />
              <span>{isSharing ? "Sharing..." : "Share"}</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <>
                <Button variant="ghost" size="sm" onClick={onEdit} className="flex items-center space-x-1">
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={onDelete} className="flex items-center space-x-1 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>

      {/* Password Modal */}
      {showPasswordDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg border p-6 w-full max-w-md mx-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Password Protected Post</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                This post is password protected. Please enter the password to view the content.
              </p>
              <div className="space-y-2">
                <Label htmlFor="post-password">Password</Label>
                <Input
                  id="post-password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password..."
                  autoComplete="current-password"
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPasswordDialog(false);
                    setPasswordInput("");
                    setPasswordError("");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handlePasswordSubmit}>
                  Access Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
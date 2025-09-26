import React, { useState } from "react";
import { Calendar, Share2, ArrowLeft, Link, Check } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect } from 'react';

interface PostDetailProps {
  id?: string;
  title: string;
  content?: string;
  excerpt: string;
  date: string;
  published_at?: string;
  tags: string[];
  featured?: boolean;
  password?: string;
  onClose: () => void;
}

export function PostDetail({ 
  id,
  title, 
  content,
  excerpt,
  date, 
  published_at,
  tags, 
  featured = false,
  password,
  onClose 
}: PostDetailProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  

  const formatDisplayDate = (dateValue?: string) => {
    if (!dateValue) return '';
    
    try {
      // Handle different date formats
      let date: Date;
      
      if (dateValue.includes('T')) {
        // ISO string format
        date = new Date(dateValue);
      } else if (dateValue.includes('-')) {
        // YYYY-MM-DD format
        date = new Date(dateValue + 'T00:00:00');
      } else {
        // Fallback
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) {
        return dateValue; // Return original if parsing fails
      }
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateValue;
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === password) {
      setIsAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("비밀번호가 올바르지 않습니다.");
    }
  };

  // Check if post is password protected and user is not authenticated
  const isPasswordProtected = password && !isAuthenticated;

  // Update meta tags for social sharing
  useEffect(() => {
    const updateMetaTags = () => {
      const baseUrl = window.location.origin;
      const postUrl = `${baseUrl}/post/${id}`;
      const description = excerpt || (content ? content.replace(/[#*`_~\[\]()]/g, '').replace(/\n+/g, ' ').trim().substring(0, 160) + '...' : '');
      
      // Update or create meta tags
      const metaTags = [
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: postUrl },
        { property: 'og:type', content: 'article' },
        { property: 'og:image', content: '/yd1ng.svg' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: '/yd1ng.svg' },
        { name: 'description', content: description }
      ];

      metaTags.forEach(({ property, name, content }) => {
        const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
        let meta = document.querySelector(selector) as HTMLMetaElement;
        
        if (!meta) {
          meta = document.createElement('meta');
          if (property) {
            meta.setAttribute('property', property);
          } else if (name) {
            meta.setAttribute('name', name);
          }
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      });

      // Update page title
      document.title = `${title} - yd1ng's Blog`;
    };

    updateMetaTags();
  }, [title, excerpt, content, id]);

  const generatePostUrl = () => {
    const baseUrl = window.location.origin;
    const slug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    return `${baseUrl}/post/${id}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatePostUrl());
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = async () => {
    console.log('Share button clicked');
    setIsSharing(true);
    
    try {
      if (navigator.share) {
        console.log('Web Share API is supported');
        await navigator.share({
          title: title,
          text: excerpt,
          url: generatePostUrl(),
        });
        console.log('Share successful');
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } else {
        console.log('Web Share API not supported, copying link instead');
        await handleCopyLink();
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // User probably cancelled the share
      if (err.name !== 'AbortError') {
        await handleCopyLink();
      }
    } finally {
      setIsSharing(false);
    }
  };

  const renderMarkdown = (content: string) => {
    if (!content) {
      return (
        <p className="text-muted-foreground leading-relaxed">
          No content available for this post.
        </p>
      );
    }

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mt-12 mb-8 first:mt-0 text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-semibold mt-10 mb-6 text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-medium mt-8 mb-4 text-foreground">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-lg leading-relaxed mb-8 text-foreground">
              {children}
            </p>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono border">
                  {children}
                </code>
              );
            }
            return (
              <code className={className}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 my-6 text-lg leading-relaxed">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 my-6 text-lg leading-relaxed">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-lg leading-relaxed text-foreground">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic">
              {children}
            </em>
          ),
          del: ({ children }) => (
            <del className="line-through">
              {children}
            </del>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  // Show password input if post is password protected
  if (isPasswordProtected) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header - same as normal post detail */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Password Modal - same style as BlogPost */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg border p-6 w-full max-w-md mx-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="text-2xl">🔒</div>
                <h3 className="text-lg font-semibold">Password Protected Post</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                This post is password protected. Please enter the password to view the content.
              </p>
              <div className="space-y-2">
                <label htmlFor="post-password" className="text-sm font-medium">Password</label>
                <input
                  id="post-password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password..."
                  autoComplete="current-password"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={onClose}
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                disabled={isSharing}
                className="flex items-center space-x-1 text-xs sm:text-sm"
              >
                {shareSuccess ? (
                  <>
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span className="text-green-500 hidden sm:inline">Shared!</span>
                    <span className="text-green-500 sm:hidden">✓</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Share</span>
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyLink}
                className="flex items-center space-x-1 text-xs sm:text-sm"
              >
                {linkCopied ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : <Link className="h-3 w-3 sm:h-4 sm:w-4" />}
                <span>{linkCopied ? "✓" : "Link"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Post Header */}
        <div className="space-y-6 mb-12 text-center">
          <div className="space-y-6">
            <h1 className="font-black leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">{title}</h1>
            <div className="flex items-center justify-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <span>{formatDisplayDate(published_at || date)}</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2">
              {featured && (
                <Badge variant="default" className="text-xs">
                  Featured
                </Badge>
              )}
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Excerpt */}
        {excerpt && (
          <div className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-12 pb-6 sm:pb-8 border-b italic leading-relaxed text-center max-w-xl mx-auto px-4">
            {excerpt}
          </div>
        )}
        
        {/* Article Content */}
        <article className="prose prose-gray dark:prose-invert max-w-none">
          <div className="space-y-8">
            {renderMarkdown(content || '')}
          </div>
        </article>
      </div>
    </div>
  );
}

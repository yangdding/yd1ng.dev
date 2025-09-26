import React from "react";
import { Shield, Code, Bug, Database, Server, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { categoriesAPI } from "../utils/api";
import { useState, useEffect } from "react";
import { useIsMobile } from "./ui/use-mobile";

interface SidebarProps {
  onCategoryClick?: (categoryId: string | null) => void;
  selectedCategory?: string | null;
  posts?: any[];
  onTagClick?: (tag: string) => void;
  onPageChange?: (page: string) => void;
  currentPage?: string;
}

export function Sidebar({ onCategoryClick, selectedCategory, posts = [], onTagClick, onPageChange, currentPage }: SidebarProps) {
  const isMobile = useIsMobile();
  const [categories, setCategories] = useState<any[]>([]);
  const [postCounts, setPostCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Profile image - using favicon from public folder
  const profileImgUrl = "/favicon-96x96.png";

  useEffect(() => {
    loadCategories();
  }, []);

  // Recompute post counts whenever posts change
  useEffect(() => {
    const counts: Record<string, number> = {};
    posts?.forEach((post: any) => {
      if (post?.category_id) {
        counts[post.category_id] = (counts[post.category_id] || 0) + 1;
      }
    });
    setPostCounts(counts);
  }, [posts]);

  const loadCategories = async () => {
    try {
      const categoriesData = await categoriesAPI.getAll();
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
      } else {
        // Derive categories from posts if DB has none
        const derived: Record<string, { id: string; name: string; icon: string }> = {};
        posts?.forEach((post: any) => {
          if (post?.category_id) {
            const cid = String(post.category_id);
            if (!derived[cid]) {
              derived[cid] = { id: cid, name: cid, icon: "FileText" };
            }
          }
        });
        setCategories(Object.values(derived));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback categories
      setCategories([
        { id: '1', name: "Security", icon: "Shield", count: 12 },
        { id: '2', name: "Web Development", icon: "Code", count: 8 },
        { id: '3', name: "Bug Hunting", icon: "Bug", count: 15 },
        { id: '4', name: "DevOps", icon: "Server", count: 4 },
        { id: '5', name: "Research", icon: "FileText", count: 6 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Shield,
      Code,
      Bug,
      Database,
      Server,
      FileText
    };
    return icons[iconName] || Shield;
  };

  // Extract and count tags from posts
  const getPopularTags = () => {
    const tagCounts: Record<string, number> = {};
    
    posts.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // Sort by count and return top tags
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8) // Show top 8 tags
      .map(([tag]) => tag);
  };

  const popularTags = getPopularTags();

  return (
    <aside className="space-y-6 sticky top-8">
      {/* Mobile Navigation - Only visible on mobile */}
      <div className="block md:hidden">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div 
                className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer ${
                  currentPage === 'posts' ? 'bg-accent' : ''
                }`}
                onClick={() => onPageChange?.('posts')}
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm">Posts</span>
              </div>
              <div 
                className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer ${
                  currentPage === 'about' ? 'bg-accent' : ''
                }`}
                onClick={() => onPageChange?.('about')}
              >
                <Shield className="h-4 w-4" />
                <span className="text-sm">About</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Card (conditionally rendered) */}
      {!isMobile && (
      <Card>
        <CardHeader className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarImage 
              src={profileImgUrl}
              alt="yd1ng profile" 
              className="object-cover"
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              YD
            </AvatarFallback>
          </Avatar>
          <CardTitle className="font-mono">yd1ng</CardTitle>
          <p className="text-sm text-muted-foreground">
            Aspiring security-focused developer with a goal to become a skilled developer who prioritizes security in every aspect of software development.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-end text-center text-sm">
            <div className="flex flex-col items-center">
              <div className="font-mono text-base leading-none">{posts.length}</div>
              <div className="mt-1 text-muted-foreground whitespace-nowrap leading-tight">Posts</div>
            </div>
            {/* Fixed spacer to guarantee separation */}
            <div className="w-6" aria-hidden="true" />
            <div className="flex flex-col items-center">
              <div className="font-mono text-base leading-none">0</div>
              <div className="mt-1 text-muted-foreground whitespace-nowrap leading-tight">CVEs</div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Categories (conditionally rendered) */}
      {!isMobile && (
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* All Posts Option */}
            <div 
              className={`flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer ${
                selectedCategory === null ? 'bg-accent' : ''
              }`}
              onClick={() => onCategoryClick?.(null)}
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">All Posts</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {posts?.length || 0}
              </Badge>
            </div>
            
            {categories.map((category) => {
              const Icon = getIconComponent(category.icon);
              const count = postCounts[category.id] || 0;
              return (
                <div 
                  key={category.id} 
                  className={`flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer ${
                    selectedCategory === category.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => onCategoryClick?.(category.id)}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Popular Tags (conditionally rendered) */}
      {popularTags.length > 0 && !isMobile && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => onTagClick?.(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  );
}
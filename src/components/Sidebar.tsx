import { Shield, Code, Bug, Database, Server, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { categoriesAPI, postsAPI } from "../utils/api";
import { useState, useEffect } from "react";

interface SidebarProps {
  onCategoryClick?: (categoryId: string | null) => void;
  selectedCategory?: string | null;
  posts?: any[];
  onTagClick?: (tag: string) => void;
}

export function Sidebar({ onCategoryClick, selectedCategory, posts = [], onTagClick }: SidebarProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [postCounts, setPostCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const [categoriesData, postsData] = await Promise.all([
        categoriesAPI.getAll(),
        postsAPI.getAll()
      ]);

      setCategories(categoriesData || []);

      // Count posts per category
      const counts: Record<string, number> = {};
      postsData?.forEach((post: any) => {
        if (post.category_id) {
          counts[post.category_id] = (counts[post.category_id] || 0) + 1;
        }
      });
      setPostCounts(counts);
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
      {/* Profile Card */}
      <Card>
        <CardHeader className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarImage 
              src="/yd1ng.svg" 
              alt="yd1ng profile" 
              className="object-cover"
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              YD
            </AvatarFallback>
          </Avatar>
          <CardTitle className="font-mono">yd1ng</CardTitle>
          <p className="text-sm text-muted-foreground">
            Security researcher passionate about finding vulnerabilities and building secure applications.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-mono">45</div>
              <div className="text-muted-foreground">Posts</div>
            </div>
            <div>
              <div className="font-mono">128</div>
              <div className="text-muted-foreground">CVEs</div>
            </div>
            <div>
              <div className="font-mono">1.2k</div>
              <div className="text-muted-foreground">Stars</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
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
                {Object.values(postCounts).reduce((sum, count) => sum + count, 0)}
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

      {/* Popular Tags */}
      {popularTags.length > 0 && (
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
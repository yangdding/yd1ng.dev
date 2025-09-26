import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";
import { BlogPost } from "./components/BlogPost";
import { About } from "./components/About";
import { AdminLogin } from "./components/AdminLogin";
import { PostEditor } from "./components/PostEditor";
import { PasswordReset } from "./components/PasswordReset";
import { PostDetail } from "./components/PostDetail";
import { NotFound } from "./components/NotFound";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Search, Plus } from "lucide-react";
import { supabase } from "./utils/supabase/client";
import { postsAPI, authAPI } from "./utils/api";
import { AuthManager, AuthRateLimit } from "./utils/auth";

export default function App() {
  const [currentPage, setCurrentPage] = useState("posts");

  const navigateToPage = (page: string) => {
    // Clear 404 state when navigating via UI
    setShowNotFound(false);
    setCurrentPage(page);
    const url = page === 'posts' ? '/' : `/${page}`;
    window.history.pushState({}, '', url);
  };
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [authenticatedPosts, setAuthenticatedPosts] = useState<Set<string>>(new Set());
  const [showNotFound, setShowNotFound] = useState<boolean>(false);

  // No default posts - use empty array
  const defaultPosts: any[] = [];

  useEffect(() => {
    loadPosts();
    checkAuthStatus();
    handleUrlRouting();
    
    // Listen for browser back/forward button
    const handlePopState = () => {
      handleUrlRouting();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Handle dark mode changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Update meta tags based on current page
  useEffect(() => {
    const updateMetaTags = () => {
      const baseUrl = window.location.origin;
      
      if (showPostDetail && selectedPost) {
        // Post detail page - handled by PostDetail component
        return;
      }
      
      // Main pages meta tags
      const pageMeta = {
        'about': {
          title: 'About - yd1ng\'s Blog',
          description: 'Aspiring security-focused developer with a goal to become a skilled developer who prioritizes security in every aspect of software development.',
          url: `${baseUrl}/about`
        },
        'posts': {
          title: 'Posts - yd1ng\'s Blog',
          description: 'Latest blog posts about security, development, and technology.',
          url: `${baseUrl}/posts`
        },
        'editor': {
          title: 'Editor - yd1ng\'s Blog',
          description: 'Create and edit blog posts.',
          url: `${baseUrl}/editor`
        }
      };
      
      const meta = pageMeta[currentPage] || {
        title: 'yd1ng',
        description: 'Aspiring security-focused developer with a goal to become a skilled developer who prioritizes security in every aspect of software development.',
        url: baseUrl
      };
      
      // Update meta tags
      const metaTags = [
        { property: 'og:title', content: meta.title },
        { property: 'og:description', content: meta.description },
        { property: 'og:url', content: meta.url },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:title', content: meta.title },
        { name: 'twitter:description', content: meta.description },
        { name: 'description', content: meta.description }
      ];

      metaTags.forEach(({ property, name, content }) => {
        const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
        let metaElement = document.querySelector(selector) as HTMLMetaElement;
        
        if (metaElement) {
          metaElement.setAttribute('content', content);
        }
      });

      // Update page title
      document.title = meta.title;
    };

    updateMetaTags();
  }, [currentPage, showPostDetail, selectedPost]);

  const handleUrlRouting = () => {
    const path = window.location.pathname;
    
    // Check if URL is a post URL pattern: /post/{id}
    const postMatch = path.match(/^\/post\/([a-f0-9-]+)$/);
    if (postMatch) {
      setShowNotFound(false);
      const postId = postMatch[1];
      // Find post by ID and show PostDetail
      loadPostById(postId);
      return;
    }
    
    // Handle page routing
    switch (path) {
      case '/about':
        setShowNotFound(false);
        setCurrentPage('about');
        break;
      case '/editor':
        setShowNotFound(false);
        setCurrentPage('editor');
        break;
      case '/posts':
      case '/':
        setShowNotFound(false);
        setCurrentPage('posts');
        break;
      default:
        // For unknown routes, show 404 page
        console.log('Unknown route:', path);
        setShowNotFound(true);
        setCurrentPage('notfound');
        break;
    }
  };

  const loadPostById = async (postId: string) => {
    try {
      console.log('Loading post by ID:', postId);
      
      // Load from API
      const posts = await postsAPI.getAll();
      const post = posts.find(p => p.id === postId);
      
      if (post) {
        console.log('Post found:', post.title);
        setSelectedPost(post);
        setShowPostDetail(true);
        
        // Update URL without page reload
        window.history.pushState({}, '', `/post/${postId}`);
      } else {
        console.error('Post not found:', postId);
        // Redirect to home page
        window.history.pushState({}, '', '/');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      // Redirect to home page on error
      window.history.pushState({}, '', '/');
    }
  };

  const checkAuthStatus = async () => {
    try {
      // Use new auth manager
      const isAdmin = AuthManager.isAdmin();
      setIsAdmin(isAdmin);
      setAccessToken(isAdmin ? "admin_token" : "");
    } catch (error) {
      console.log('Auth check error:', error);
      setIsAdmin(false);
      setAccessToken("");
    }
  };

  const loadPosts = async () => {
    try {
      console.log('Loading posts, isAdmin:', isAdmin);
      
      // Try to load from Supabase, but fallback to defaults quickly
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      );
      
      const postsPromise = isAdmin ? postsAPI.getAllAdmin() : postsAPI.getAll();
      
      const posts = await Promise.race([postsPromise, timeoutPromise]);
      
      if (posts && Array.isArray(posts) && posts.length > 0) {
        setBlogPosts(posts);
        setFilteredPosts(posts);
        
        // Check URL routing after posts are loaded
        setTimeout(() => handleUrlRouting(), 100);
      } else {
        setBlogPosts(defaultPosts);
        setFilteredPosts(defaultPosts);
        console.log('Using default posts - no data from Supabase');
      }
    } catch (error) {
      console.log('Error loading posts, using defaults:', error);
      setBlogPosts(defaultPosts);
      setFilteredPosts(defaultPosts);
    }
  };

  // Filter posts based on category and search term
  useEffect(() => {
    let filtered = blogPosts;

    if (selectedCategory) {
      filtered = filtered.filter(post => post.category_id === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  }, [blogPosts, selectedCategory, searchTerm]);

  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      // Check rate limiting
      if (AuthRateLimit.isBlocked(email)) {
        const remainingTime = Math.ceil(AuthRateLimit.getRemainingTime(email) / 60000);
        throw new Error(`Too many failed attempts. Please try again in ${remainingTime} minutes.`);
      }

      // Attempt login with new auth manager
      const result = await AuthManager.loginAdmin(email, password);
      
      if (result.success) {
        AuthRateLimit.recordAttempt(email, true);
        setIsAdmin(true);
        setAccessToken("admin_token");
        setShowLogin(false);
        loadPosts(); // Reload posts for admin
        return true;
      } else {
        AuthRateLimit.recordAttempt(email, false);
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      // Use new auth manager for logout
      AuthManager.logout();
      setIsAdmin(false);
      setAccessToken("");
      loadPosts(); // Reload posts for public view
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSavePost = async (postData: any) => {
    try {
      
      if (editingPost) {
        // Update existing post
        const updatedPost = await postsAPI.update(editingPost.id, postData);
        setBlogPosts(prev => prev.map(post => 
          post.id === editingPost.id ? updatedPost : post
        ));
      } else {
        // Create new post
        const newPost = await postsAPI.create(postData);
        setBlogPosts(prev => [newPost, ...prev]);
      }
      
      navigateToPage("posts");
      setEditingPost(null);
      
      // Reload posts to ensure consistency
      setTimeout(() => {
        loadPosts();
      }, 500);
      
      return true;
    } catch (error) {
      console.error('App.tsx - Error saving post:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      alert(`Failed to save post: ${error.message}`);
      return false;
    }
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setCurrentPage("editor");
    window.history.pushState({}, '', '/editor');
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setCurrentPage("editor");
    window.history.pushState({}, '', '/editor');
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.delete(postId);
        setBlogPosts(prev => prev.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleReadPost = (post: any) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  const handlePostAuthenticated = (postId: string) => {
    setAuthenticatedPosts(prev => new Set(prev).add(postId));
  };

  const handlePasswordReset = async (newPassword: string) => {
    try {
      await authAPI.resetPassword(newPassword);
      setShowPasswordReset(false);
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  };

  const renderMainContent = () => {
    // Show PostDetail as full page if showPostDetail is true
    if (showPostDetail && selectedPost) {
      return (
        <PostDetail
          {...selectedPost}
          isAuthenticated={authenticatedPosts.has(selectedPost.id) || isAdmin}
          onClose={() => {
            setShowPostDetail(false);
            setSelectedPost(null);
            navigateToPage('posts');
          }}
        />
      );
    }

    // Show 404 page if not found
    if (showNotFound) {
      return (
        <NotFound
          onGoHome={() => {
            setShowNotFound(false);
            navigateToPage('posts');
          }}
          onGoBack={() => {
            setShowNotFound(false);
            window.history.back();
          }}
        />
      );
    }

    switch (currentPage) {
      case "about":
        return <About />;
      case "editor":
        return (
          <PostEditor
            post={editingPost}
            onSave={handleSavePost}
            onCancel={() => navigateToPage("posts")}
          />
        );
      case "posts":
      default:
        return (
          <div className="space-y-8">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search posts..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <Button 
                    onClick={handleNewPost}
                    size="sm" 
                    className="flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Post</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Posts Grid */}
            <div className={`grid gap-6 ${isSidebarOpen ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
              {filteredPosts.map((post, index) => (
                <BlogPost 
                  key={post.id || index} 
                  {...post} 
                  isAdmin={isAdmin}
                  onEdit={() => handleEditPost(post)}
                  onDelete={() => handleDeletePost(post.id)}
                  onRead={() => handleReadPost(post)}
                  onAuthenticated={handlePostAuthenticated}
                />
              ))}
              
              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms" : "No posts available"}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentPage={currentPage} 
        onPageChange={navigateToPage}
        isAdmin={isAdmin}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
        onPasswordReset={() => setShowPasswordReset(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      
      {currentPage === "editor" || showPostDetail ? (
        renderMainContent()
      ) : (
      <div className="container mx-auto px-4 py-8">
        {isSidebarOpen ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Sidebar */}
            <div className="lg:col-span-1">
              <div className="block">
                <Sidebar 
                  onCategoryClick={handleCategoryFilter}
                  selectedCategory={selectedCategory}
                  posts={blogPosts}
                  onTagClick={handleTagClick}
                  onPageChange={navigateToPage}
                  currentPage={currentPage}
                />
              </div>
            </div>
            {/* Main Content */}
            <div className="lg:col-span-3">
              {renderMainContent()}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {renderMainContent()}
          </div>
        )}
      </div>
      )}

      {showLogin && (
        <AdminLogin
          onLogin={handleLogin}
          onClose={() => setShowLogin(false)}
        />
      )}
      
      {showPasswordReset && (
        <PasswordReset
          onReset={handlePasswordReset}
          onClose={() => setShowPasswordReset(false)}
        />
      )}
      
        <Footer 
          isAdmin={isAdmin}
          onLoginClick={() => setShowLogin(true)}
          onLogout={handleLogout}
          onPasswordReset={() => setShowPasswordReset(true)}
        />
    </div>
  );
}
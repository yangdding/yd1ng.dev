import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, Plus, X, Upload, Eye, Lock, Unlock } from "lucide-react";
import { categoriesAPI } from "../utils/api";

interface Post {
  id?: string;
  title: string;
  excerpt?: string;
  content?: string;
  category_id?: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  password?: string;
  meta_description?: string;
  published_at?: string;
}

interface PostEditorProps {
  post?: Post;
  onSave: (post: Post) => void;
  onCancel: () => void;
}

export function PostEditor({ post, onSave, onCancel }: PostEditorProps) {
  const [formData, setFormData] = useState<Post>({
    title: post?.title || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    category_id: post?.category_id || null,
    tags: post?.tags || [],
    featured: post?.featured || false,
    published: post?.published ?? true,
    password: post?.password || "",
    meta_description: post?.meta_description || "",
    published_at: post?.published_at || new Date().toISOString().split('T')[0],
    ...(post?.id && { id: post.id })
  });

  const [newTag, setNewTag] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("write");
  const [isPreview, setIsPreview] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(!!post?.password);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  // Update form data when post prop changes
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        category_id: post.category_id || null,
        tags: post.tags || [],
        featured: post.featured || false,
        published: post.published ?? true,
        password: post.password || "",
        meta_description: post.meta_description || "",
        published_at: post.published_at || new Date().toISOString().split('T')[0],
        ...(post.id && { id: post.id })
      });
      setIsPasswordProtected(!!post.password);
    } else {
      // Reset form for new post
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        category_id: null,
        tags: [],
        featured: false,
        published: true,
        password: "",
        meta_description: "",
        published_at: new Date().toISOString().split('T')[0],
      });
      setIsPasswordProtected(false);
    }
  }, [post]);

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, we'll use a simple base64 approach
    // In production, you'd want to upload to a cloud service
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const imageMarkdown = `![${file.name}](${result})\n`;
      
      setFormData(prev => ({
        ...prev,
        content: prev.content + imageMarkdown
      }));
    };
    reader.readAsDataURL(file);
  };

  const addDefaultImage = () => {
    const defaultImageMarkdown = `![yd1ng-logo](/yd1ng.svg)\n`;
    
    setFormData(prev => ({
      ...prev,
      content: prev.content + defaultImageMarkdown
    }));
  };

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = before + selectedText + after;
    
    const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    
    setFormData(prev => ({
      ...prev,
      content: newContent
    }));

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      password: isPasswordProtected ? formData.password : undefined,
      published_at: formData.published_at ? new Date(formData.published_at).toISOString().split('T')[0] : undefined
    };
    onSave(submitData);
  };

  const renderMarkdownPreview = (content: string) => {
    // Simple markdown rendering (in production, use a proper markdown library)
    return content
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`(.*)`/gim, '<code>$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/gim, '<br />');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onCancel}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold">
                {post ? "Edit Post" : "Create New Post"}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="post-form"
                disabled={!formData.title.trim()}
                className="min-w-[100px]"
              >
                {post ? "Update" : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-6 py-8">
        <form id="post-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Information */}
              <div className="bg-card border rounded-lg p-6 space-y-6">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  <h2 className="text-lg font-semibold">Basic Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-medium">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter post title..."
                      className="text-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="excerpt" className="text-base font-medium">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Brief description of your post..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-base font-medium">Category</Label>
                    <Select 
                      value={formData.category_id || ""} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value || null }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div className="bg-card border rounded-lg p-6 space-y-6">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full" />
                  <h2 className="text-lg font-semibold">Tags</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 min-h-[3rem] p-4 bg-muted/30 rounded-md border-dashed border">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-3 py-2">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-3 items-center">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag (press Enter)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={addTag} className="px-4">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-card border rounded-lg p-6 space-y-6">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <h2 className="text-lg font-semibold">Settings</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                    />
                    <Label htmlFor="published" className="font-medium cursor-pointer">
                      {formData.published ? "Published" : "Draft"}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                    />
                    <Label htmlFor="featured" className="font-medium cursor-pointer">Featured</Label>
                  </div>
                  
                  {/* Password Protection */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="password-protected"
                        checked={isPasswordProtected}
                        onCheckedChange={setIsPasswordProtected}
                      />
                      <Label htmlFor="password-protected" className="font-medium cursor-pointer flex items-center gap-2">
                        {isPasswordProtected ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        Password Protected
                      </Label>
                    </div>
                    {isPasswordProtected && (
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password..."
                          autoComplete="new-password"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Content Editor */}
              <div className="bg-card border rounded-lg p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                    <h2 className="text-lg font-semibold">Content</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-1"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Image</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDefaultImage}
                      className="flex items-center space-x-1"
                    >
                      <span>Add Default Image</span>
                    </Button>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="split">Split</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="write" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown('**', '**')}>
                          Bold
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown('*', '*')}>
                          Italic
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown('`', '`')}>
                          Code
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown('### ')}>
                          H3
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown('## ')}>
                          H2
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown('# ')}>
                          H1
                        </Button>
                      </div>
                      <Textarea
                        name="content"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Write your post content here... (Markdown supported)"
                        className="min-h-[500px] font-mono text-sm"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview" className="mt-4">
                    <div className="min-h-[500px] p-4 border rounded-md bg-muted/20">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(formData.content || '') }}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="split" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Editor</Label>
                        <Textarea
                          name="content"
                          value={formData.content}
                          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Write your post content here..."
                          className="min-h-[500px] font-mono text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Preview</Label>
                        <div className="min-h-[500px] p-4 border rounded-md bg-muted/20 overflow-auto">
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(formData.content || '') }}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* SEO */}
              <div className="bg-card border rounded-lg p-6 space-y-6">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                  <h2 className="text-lg font-semibold">SEO</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="published_at" className="text-base font-medium">Published Date</Label>
                    <Input
                      id="published_at"
                      type="date"
                      value={formData.published_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meta_description" className="text-base font-medium">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                      placeholder="Brief description for search engines..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
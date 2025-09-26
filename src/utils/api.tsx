import { supabase } from './supabase/client';
import { APIRateLimiter } from './rate-limiter';
import { rateLimiter, validateFormData, schemas } from './security';

// Auth API
export const authAPI = {
  async signup(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });
    if (error) throw error;
    return data;
  },
    
  async resetPassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  },
};

// Categories API
export const categoriesAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async create(category: any) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, category: any) {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },
};

// Posts API
export const postsAPI = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  async getAllAdmin() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  async create(post: any) {
    try {
      
      // Prepare post data without timestamps (let DB handle them)
      const postData = {
        title: post.title,
        content: post.content || '',
        excerpt: post.excerpt,
        category_id: post.category_id && post.category_id.trim() !== '' ? post.category_id : null,
        tags: post.tags || [],
        featured: post.featured || false,
        published: post.published ?? true,
        meta_description: post.meta_description || '',
        password: post.password || null,
        published_at: post.published_at || null,
        slug: post.slug || null
      };
      
      
      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select('*')
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },
    
  async update(id: string, post: any) {
    try {
      // Clean up the post data before updating
      const updateData = {
        ...post,
        category_id: post.category_id && post.category_id.trim() !== '' ? post.category_id : null,
        password: post.password || null,
        published_at: post.published_at || null,
        updated_at: new Date().toISOString()
      };
      
      
      const { data, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error('Update post error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },
    
  async delete(id: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async incrementViews(id: string) {
    const { error } = await supabase.rpc('increment_post_views', { p_post_id: id });
    if (error) throw error;
    return true;
  },

  async getByCategory(categoryId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category_id', categoryId)
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
};

// Projects API
export const projectsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  
  async create(project: any) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
    
  async update(id: string, project: any) {
    const { data, error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
    
  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },
};

// Research API
export const researchAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('research')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },
  
  async create(research: any) {
    const { data, error } = await supabase
      .from('research')
      .insert([research])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
    
  async update(id: string, research: any) {
    const { data, error } = await supabase
      .from('research')
      .update(research)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
    
  async delete(id: string) {
    const { error } = await supabase
      .from('research')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },
};

// About API
export const aboutAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('about')
      .select('*')
      .order('section');
    if (error) throw error;
    return data;
  },
  
  async update(section: string, content: any) {
    const { data, error } = await supabase
      .from('about')
      .update({ content })
      .eq('section', section)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Comments API
export const commentsAPI = {
  async getByPostId(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('approved', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(comment: any) {
    // Rate limiting for comments
    if (!rateLimiter.isAllowed(`comment_create_${comment.author_email}`, 5, 300000)) {
      throw new Error('Too many comments posted. Please wait before posting another.');
    }

    // Validate comment data
    const validation = validateFormData(comment, schemas.comment);
    if (!validation.isValid) {
      throw new Error(`Validation errors: ${Object.values(validation.errors).join(', ')}`);
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([comment])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async approve(id: string) {
    const { data, error } = await supabase
      .from('comments')
      .update({ approved: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },
};
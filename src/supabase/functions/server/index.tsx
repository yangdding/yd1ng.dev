import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Note: Admin user creation moved to manual signup endpoint to avoid startup issues

// Auth helpers
async function verifyAdmin(request: Request) {
  try {
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return null;
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log('Auth verification error:', error);
      return null;
    }
    
    // Check if user is admin (you can customize this logic)
    if (user.email === 'admin@yd1ng.dev' || user.email === 'yd1ng@example.com') {
      return user;
    }
    
    return null;
  } catch (error) {
    console.log('Auth verification exception:', error);
    return null;
  }
}

// Admin signup route (for creating admin users)
app.post('/make-server-68b4b456/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    // For demo purposes, allow creating admin account
    if (email === 'admin@yd1ng.dev') {
      // Check if user already exists first
      try {
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const userExists = existingUsers?.users?.some(user => user.email === email);
        
        if (userExists) {
          return c.json({ error: 'User already exists' }, 409);
        }
      } catch (listError) {
        console.log('Error checking existing users:', listError);
        // Continue with creation attempt
      }
      
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: password || 'yd1ng2024!', // Use provided password or default
        user_metadata: { name: name || 'yd1ng Admin' },
        // Automatically confirm the user's email since an email server hasn't been configured.
        email_confirm: true
      });
      
      if (error) {
        console.log('Admin signup error:', error);
        // Check if it's a user already exists error
        if (error.message.includes('already been registered') || error.message.includes('already exists')) {
          return c.json({ error: 'User already exists' }, 409);
        }
        return c.json({ error: error.message }, 400);
      }
      
      return c.json({ user: data.user, message: 'Admin user created successfully' });
    }
    
    return c.json({ error: 'Only admin account creation is allowed' }, 403);
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Password reset for admin
app.post('/make-server-68b4b456/auth/reset-password', async (c) => {
  const user = await verifyAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { newPassword } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );
    
    if (error) {
      console.log('Password reset error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Password reset error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Blog Posts CRUD
app.get('/make-server-68b4b456/posts', async (c) => {
  try {
    const posts = await kv.get('blog_posts') || [];
    return c.json(posts);
  } catch (error) {
    console.log('Get posts error:', error);
    return c.json({ error: 'Failed to fetch posts' }, 500);
  }
});

app.post('/make-server-68b4b456/posts', async (c) => {
  const user = await verifyAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const newPost = await c.req.json();
    const posts = await kv.get('blog_posts') || [];
    
    const postWithId = {
      ...newPost,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    };
    
    posts.unshift(postWithId);
    await kv.set('blog_posts', posts);
    
    return c.json(postWithId);
  } catch (error) {
    console.log('Create post error:', error);
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

app.put('/make-server-68b4b456/posts/:id', async (c) => {
  const user = await verifyAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const postId = c.req.param('id');
    const updatedData = await c.req.json();
    const posts = await kv.get('blog_posts') || [];
    
    const index = posts.findIndex((post: any) => post.id === postId);
    if (index === -1) {
      return c.json({ error: 'Post not found' }, 404);
    }
    
    posts[index] = { ...posts[index], ...updatedData };
    await kv.set('blog_posts', posts);
    
    return c.json(posts[index]);
  } catch (error) {
    console.log('Update post error:', error);
    return c.json({ error: 'Failed to update post' }, 500);
  }
});

app.delete('/make-server-68b4b456/posts/:id', async (c) => {
  const user = await verifyAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const postId = c.req.param('id');
    const posts = await kv.get('blog_posts') || [];
    
    const filteredPosts = posts.filter((post: any) => post.id !== postId);
    await kv.set('blog_posts', filteredPosts);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete post error:', error);
    return c.json({ error: 'Failed to delete post' }, 500);
  }
});

// Projects CRUD
app.get('/make-server-68b4b456/projects', async (c) => {
  try {
    const projects = await kv.get('projects') || [];
    return c.json(projects);
  } catch (error) {
    console.log('Get projects error:', error);
    return c.json({ error: 'Failed to fetch projects' }, 500);
  }
});

app.post('/make-server-68b4b456/projects', async (c) => {
  const user = await verifyAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const newProject = await c.req.json();
    const projects = await kv.get('projects') || [];
    
    const projectWithId = {
      ...newProject,
      id: Date.now().toString()
    };
    
    projects.unshift(projectWithId);
    await kv.set('projects', projects);
    
    return c.json(projectWithId);
  } catch (error) {
    console.log('Create project error:', error);
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

app.put('/make-server-68b4b456/projects/:id', async (c) => {
  const user = await verifyAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const projectId = c.req.param('id');
    const updatedData = await c.req.json();
    const projects = await kv.get('projects') || [];
    
    const index = projects.findIndex((project: any) => project.id === projectId);
    if (index === -1) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    projects[index] = { ...projects[index], ...updatedData };
    await kv.set('projects', projects);
    
    return c.json(projects[index]);
  } catch (error) {
    console.log('Update project error:', error);
    return c.json({ error: 'Failed to update project' }, 500);
  }
});

app.delete('/make-server-68b4b456/projects/:id', async (c) => {
  const user = await verifyAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const projectId = c.req.param('id');
    const projects = await kv.get('projects') || [];
    
    const filteredProjects = projects.filter((project: any) => project.id !== projectId);
    await kv.set('projects', filteredProjects);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete project error:', error);
    return c.json({ error: 'Failed to delete project' }, 500);
  }
});

// Research CRUD
app.get('/make-server-68b4b456/research', async (c) => {
  try {
    const research = await kv.get('research') || [];
    return c.json(research);
  } catch (error) {
    console.log('Get research error:', error);
    return c.json({ error: 'Failed to fetch research' }, 500);
  }
});

app.post('/make-server-68b4b456/research', async (c) => {
  const user = await verifyAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const newResearch = await c.req.json();
    const research = await kv.get('research') || [];
    
    const researchWithId = {
      ...newResearch,
      id: Date.now().toString()
    };
    
    research.unshift(researchWithId);
    await kv.set('research', research);
    
    return c.json(researchWithId);
  } catch (error) {
    console.log('Create research error:', error);
    return c.json({ error: 'Failed to create research' }, 500);
  }
});

app.put('/make-server-68b4b456/research/:id', async (c) => {
  const user = await verifyAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const researchId = c.req.param('id');
    const updatedData = await c.req.json();
    const research = await kv.get('research') || [];
    
    const index = research.findIndex((item: any) => item.id === researchId);
    if (index === -1) {
      return c.json({ error: 'Research not found' }, 404);
    }
    
    research[index] = { ...research[index], ...updatedData };
    await kv.set('research', research);
    
    return c.json(research[index]);
  } catch (error) {
    console.log('Update research error:', error);
    return c.json({ error: 'Failed to update research' }, 500);
  }
});

app.delete('/make-server-68b4b456/research/:id', async (c) => {
  const user = await verifyAdmin(c.req.raw);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const researchId = c.req.param('id');
    const research = await kv.get('research') || [];
    
    const filteredResearch = research.filter((item: any) => item.id !== researchId);
    await kv.set('research', filteredResearch);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete research error:', error);
    return c.json({ error: 'Failed to delete research' }, 500);
  }
});

Deno.serve(app.fetch);
import { Github, ExternalLink, Star, GitFork, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ProjectEditor } from "./ProjectEditor";
import { projectsAPI } from "../utils/api";
import { useState, useEffect } from "react";

interface ProjectsProps {
  isAdmin?: boolean;
}

export function Projects({ isAdmin = false }: ProjectsProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectEditor, setShowProjectEditor] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsAPI.getAll();
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (projectData: any) => {
    try {
      if (editingProject) {
        const updatedProject = await projectsAPI.update(editingProject.id, projectData);
        setProjects(prev => prev.map(p => p.id === editingProject.id ? updatedProject : p));
      } else {
        const newProject = await projectsAPI.create(projectData);
        setProjects(prev => [newProject, ...prev]);
      }
      setShowProjectEditor(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setShowProjectEditor(true);
  };

  const handleNewProject = () => {
    setEditingProject(null);
    setShowProjectEditor(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectsAPI.delete(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-mono">Projects</h1>
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-green-500";
      case "beta": return "bg-yellow-500";
      case "completed": return "bg-blue-500";
      case "archived": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <h1 className="text-3xl font-mono">Projects</h1>
          {isAdmin && (
            <Button 
              onClick={handleNewProject}
              size="sm" 
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </Button>
          )}
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Open source security tools and frameworks I've built to help the community 
          and advance the field of cybersecurity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-mono">{projects.length}</div>
            <div className="text-sm text-muted-foreground">Total Projects</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-mono">{projects.reduce((sum, p) => sum + (p.stars || 0), 0)}</div>
            <div className="text-sm text-muted-foreground">GitHub Stars</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-mono">{projects.reduce((sum, p) => sum + (p.forks || 0), 0)}</div>
            <div className="text-sm text-muted-foreground">Total Forks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-mono">{projects.filter(p => p.status?.toLowerCase() === "active").length}</div>
            <div className="text-sm text-muted-foreground">Active Projects</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                    <span className="text-xs text-muted-foreground capitalize">{project.status}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>{project.stars || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <GitFork className="h-3 w-3" />
                    <span>{project.forks || 0}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {(project.tech_stack || []).map((tech: string) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  {project.github_url && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center space-x-1"
                      onClick={() => window.open(project.github_url, '_blank')}
                    >
                      <Github className="h-3 w-3" />
                      <span>GitHub</span>
                    </Button>
                  )}
                  {project.demo_url && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center space-x-1"
                      onClick={() => window.open(project.demo_url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Demo</span>
                    </Button>
                  )}
                </div>
                
                {isAdmin && (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditProject(project)}
                      className="flex items-center space-x-1"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteProject(project.id)}
                      className="flex items-center space-x-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <h3 className="text-xl font-mono">Want to Collaborate?</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            I'm always interested in working on new security tools and frameworks. 
            Feel free to reach out if you have ideas or want to contribute!
          </p>
          <Button 
            className="flex items-center space-x-2"
            onClick={() => window.open('https://github.com/yangdding', '_blank')}
          >
            <Github className="h-4 w-4" />
            <span>View All on GitHub</span>
          </Button>
        </CardContent>
      </Card>

      {/* Project Editor Modal */}
      {showProjectEditor && (
        <ProjectEditor
          project={editingProject}
          onSave={handleSaveProject}
          onCancel={() => {
            setShowProjectEditor(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
}
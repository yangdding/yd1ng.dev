import { FileText, Calendar, ExternalLink, Award, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ResearchEditor } from "./ResearchEditor";
import { researchAPI } from "../utils/api";
import { useState, useEffect } from "react";

interface ResearchProps {
  isAdmin?: boolean;
}

export function Research({ isAdmin = false }: ResearchProps) {
  const [research, setResearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResearchEditor, setShowResearchEditor] = useState(false);
  const [editingResearch, setEditingResearch] = useState<any>(null);

  useEffect(() => {
    loadResearch();
  }, []);

  const loadResearch = async () => {
    try {
      const data = await researchAPI.getAll();
      setResearch(data || []);
    } catch (error) {
      console.error('Error loading research:', error);
      setResearch([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResearch = async (researchData: any) => {
    try {
      if (editingResearch) {
        const updatedResearch = await researchAPI.update(editingResearch.id, researchData);
        setResearch(prev => prev.map(r => r.id === editingResearch.id ? updatedResearch : r));
      } else {
        const newResearch = await researchAPI.create(researchData);
        setResearch(prev => [newResearch, ...prev]);
      }
      setShowResearchEditor(false);
      setEditingResearch(null);
    } catch (error) {
      console.error('Error saving research:', error);
      alert('Failed to save research. Please try again.');
    }
  };

  const handleEditResearch = (researchItem: any) => {
    setEditingResearch(researchItem);
    setShowResearchEditor(true);
  };

  const handleDeleteResearch = async (researchId: string) => {
    if (!window.confirm('Are you sure you want to delete this research?')) {
      return;
    }

    try {
      await researchAPI.delete(researchId);
      setResearch(prev => prev.filter(r => r.id !== researchId));
    } catch (error) {
      console.error('Error deleting research:', error);
      alert('Failed to delete research. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-mono">Security Research</h1>
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Separate papers and CVEs
  const papers = research.filter(r => r.type !== 'cve');
  const cves = research.filter(r => r.cve_id);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <h1 className="text-3xl font-mono">Security Research</h1>
          {isAdmin && (
            <Button 
              onClick={() => setShowResearchEditor(true)}
              size="sm" 
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>New Research</span>
            </Button>
          )}
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Publications, presentations, and vulnerability discoveries contributing 
          to the cybersecurity community and advancing the field.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-mono">{papers.length}</div>
            <div className="text-sm text-muted-foreground">Publications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-mono">{cves.length}</div>
            <div className="text-sm text-muted-foreground">CVEs Assigned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-mono">15</div>
            <div className="text-sm text-muted-foreground">Conference Talks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-mono">8</div>
            <div className="text-sm text-muted-foreground">Bug Bounty HoFs</div>
          </CardContent>
        </Card>
      </div>

      {/* Research Papers */}
      <div className="space-y-6">
        <h2 className="text-2xl font-mono">Recent Publications</h2>
        <div className="space-y-4">
          {papers.map((paper, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {paper.title}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{paper.date}</span>
                      </div>
                      <span>{paper.venue}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {paper.type}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {paper.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {paper.abstract}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {(paper.tags || []).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    {paper.pdf_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center space-x-1"
                        onClick={() => window.open(paper.pdf_url, '_blank')}
                      >
                        <FileText className="h-3 w-3" />
                        <span>PDF</span>
                      </Button>
                    )}
                    {paper.slides_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center space-x-1"
                        onClick={() => window.open(paper.slides_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Slides</span>
                      </Button>
                    )}
                    {paper.video_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center space-x-1"
                        onClick={() => window.open(paper.video_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Video</span>
                      </Button>
                    )}
                  </div>
                  
                  {isAdmin && (
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditResearch(paper)}
                        className="flex items-center space-x-1"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteResearch(paper.id)}
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
      </div>

      {/* CVE Discoveries */}
      <div className="space-y-6">
        <h2 className="text-2xl font-mono">CVE Discoveries</h2>
        <div className="grid grid-cols-1 gap-4">
          {cves.map((cve, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-mono">{cve.cve_id}</h3>
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(cve.severity)}`}></div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {cve.severity}
                      </Badge>
                      {cve.cvss_score && (
                        <span className="text-xs text-muted-foreground">CVSS: {cve.cvss_score}</span>
                      )}
                    </div>
                    <h4 className="text-sm">{cve.title}</h4>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Vendor: {cve.vendor}</span>
                      <Badge variant={cve.status === "published" ? "secondary" : "destructive"} className="text-xs capitalize">
                        {cve.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center space-x-1"
                      onClick={() => window.open(`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve.cve_id}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>View CVE</span>
                    </Button>
                    {isAdmin && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditResearch(cve)}
                          className="flex items-center space-x-1"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteResearch(cve.id)}
                          className="flex items-center space-x-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <Award className="h-12 w-12 mx-auto text-primary" />
          <h3 className="text-xl font-mono">Responsible Disclosure</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Found a vulnerability in one of my projects or want to collaborate on research? 
            I follow responsible disclosure practices and am always happy to work with the community.
          </p>
          <Button className="flex items-center space-x-2">
            <ExternalLink className="h-4 w-4" />
            <span>Contact for Research</span>
          </Button>
        </CardContent>
      </Card>

      {/* Research Editor Modal */}
      {showResearchEditor && (
        <ResearchEditor
          research={editingResearch}
          onSave={handleSaveResearch}
          onCancel={() => {
            setShowResearchEditor(false);
            setEditingResearch(null);
          }}
        />
      )}
    </div>
  );
}
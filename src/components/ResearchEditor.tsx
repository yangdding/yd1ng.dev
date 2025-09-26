import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { X, Plus } from "lucide-react";

interface ResearchEditorProps {
  research?: any;
  onSave: (researchData: any) => void;
  onCancel: () => void;
}

export function ResearchEditor({ research, onSave, onCancel }: ResearchEditorProps) {
  const [formData, setFormData] = useState({
    title: "",
    type: "paper" as "paper" | "presentation" | "workshop" | "journal",
    venue: "",
    abstract: "",
    tags: [] as string[],
    status: "draft" as "published" | "presented" | "submitted" | "draft",
    date: "",
    pdf_url: "",
    slides_url: "",
    video_url: "",
    cve_id: "",
    severity: "" as "critical" | "high" | "medium" | "low" | "",
    cvss_score: "",
    vendor: ""
  });

  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (research) {
      setFormData({
        title: research.title || "",
        type: research.type || "paper",
        venue: research.venue || "",
        abstract: research.abstract || "",
        tags: research.tags || [],
        status: research.status || "draft",
        date: research.date || "",
        pdf_url: research.pdf_url || "",
        slides_url: research.slides_url || "",
        video_url: research.video_url || "",
        cve_id: research.cve_id || "",
        severity: research.severity || "",
        cvss_score: research.cvss_score?.toString() || "",
        vendor: research.vendor || ""
      });
    }
  }, [research]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      cvss_score: formData.cvss_score ? parseFloat(formData.cvss_score) : null,
      severity: formData.severity || null
    };
    onSave(submitData);
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

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {research ? "Edit Research" : "Add New Research"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Research title"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paper">Paper</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="journal">Journal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="presented">Presented</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
              placeholder="Conference, Journal, or Event name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="abstract">Abstract</Label>
            <Textarea
              id="abstract"
              value={formData.abstract}
              onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
              placeholder="Research abstract or description"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pdf_url">PDF URL</Label>
              <Input
                id="pdf_url"
                value={formData.pdf_url}
                onChange={(e) => setFormData(prev => ({ ...prev, pdf_url: e.target.value }))}
                placeholder="https://example.com/paper.pdf"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slides_url">Slides URL</Label>
              <Input
                id="slides_url"
                value={formData.slides_url}
                onChange={(e) => setFormData(prev => ({ ...prev, slides_url: e.target.value }))}
                placeholder="https://example.com/slides.pdf"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">Video URL</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          {/* CVE Information Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">CVE Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cve_id">CVE ID</Label>
                <Input
                  id="cve_id"
                  value={formData.cve_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, cve_id: e.target.value }))}
                  placeholder="CVE-2024-XXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  placeholder="Company or Product name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select 
                  value={formData.severity} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvss_score">CVSS Score</Label>
                <Input
                  id="cvss_score"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.cvss_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, cvss_score: e.target.value }))}
                  placeholder="9.3"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {research ? "Update Research" : "Create Research"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { X, Plus } from "lucide-react";

interface AboutEditorProps {
  aboutData?: any;
  onSave: (aboutData: any) => void;
  onCancel: () => void;
}

export function AboutEditor({ aboutData, onSave, onCancel }: AboutEditorProps) {
  const [formData, setFormData] = useState({
    bio: {
      paragraphs: ["", "", ""]
    },
    skills: {
      items: [] as string[]
    },
    achievements: {
      items: [] as Array<{ title: string; description: string }>
    },
    contact: {
      items: [] as Array<{ type: string; label: string; url: string }>
    }
  });

  const [newSkill, setNewSkill] = useState("");
  const [newContact, setNewContact] = useState({ type: "", label: "", url: "" });
  const [newAchievement, setNewAchievement] = useState({ title: "", description: "" });

  useEffect(() => {
    if (aboutData && Array.isArray(aboutData)) {
      const bioData = aboutData.find(item => item.section === 'bio');
      const skillsData = aboutData.find(item => item.section === 'skills');
      const achievementsData = aboutData.find(item => item.section === 'achievements');
      const contactData = aboutData.find(item => item.section === 'contact');

      setFormData({
        bio: bioData?.content || { paragraphs: ["", "", ""] },
        skills: skillsData?.content || { items: [] },
        achievements: achievementsData?.content || { items: [] },
        contact: contactData?.content || { items: [] }
      });
    }
  }, [aboutData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateBioParagraph = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      bio: {
        ...prev.bio,
        paragraphs: prev.bio.paragraphs.map((p, i) => i === index ? value : p)
      }
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.items.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          items: [...prev.skills.items, newSkill.trim()]
        }
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        items: prev.skills.items.filter(s => s !== skill)
      }
    }));
  };

  const addAchievement = () => {
    if (newAchievement.title.trim() && newAchievement.description.trim()) {
      setFormData(prev => ({
        ...prev,
        achievements: {
          ...prev.achievements,
          items: [...prev.achievements.items, { ...newAchievement }]
        }
      }));
      setNewAchievement({ title: "", description: "" });
    }
  };

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: {
        ...prev.achievements,
        items: prev.achievements.items.filter((_, i) => i !== index)
      }
    }));
  };

  const addContact = () => {
    if (newContact.type.trim() && newContact.label.trim() && newContact.url.trim()) {
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          items: [...prev.contact.items, { ...newContact }]
        }
      }));
      setNewContact({ type: "", label: "", url: "" });
    }
  };

  const removeContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        items: prev.contact.items.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit About Information</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="bio" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bio">Bio</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="bio" className="space-y-4">
              <div className="space-y-4">
                <Label>Biography Paragraphs</Label>
                {formData.bio.paragraphs.map((paragraph, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`bio-${index}`}>Paragraph {index + 1}</Label>
                    <Textarea
                      id={`bio-${index}`}
                      value={paragraph}
                      onChange={(e) => updateBioParagraph(index, e.target.value)}
                      placeholder={`Enter paragraph ${index + 1}...`}
                      className="min-h-[80px]"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
              <div className="space-y-4">
                <Label>Technical Skills</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add new skill"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.items.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center space-x-1">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <div className="space-y-4">
                <Label>Notable Achievements</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="achievement-title">Title</Label>
                    <Input
                      id="achievement-title"
                      value={newAchievement.title}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Achievement title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="achievement-description">Description</Label>
                    <Input
                      id="achievement-description"
                      value={newAchievement.description}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Achievement description"
                    />
                  </div>
                  <Button type="button" onClick={addAchievement} className="md:col-span-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Achievement
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.achievements.items.map((achievement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAchievement(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="space-y-4">
                <Label>Contact Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="contact-type">Type</Label>
                    <Input
                      id="contact-type"
                      value={newContact.type}
                      onChange={(e) => setNewContact(prev => ({ ...prev, type: e.target.value }))}
                      placeholder="email, twitter, github, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-label">Label</Label>
                    <Input
                      id="contact-label"
                      value={newContact.label}
                      onChange={(e) => setNewContact(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="Display text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-url">URL</Label>
                    <Input
                      id="contact-url"
                      value={newContact.url}
                      onChange={(e) => setNewContact(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://... or mailto:..."
                    />
                  </div>
                  <Button type="button" onClick={addContact} className="md:col-span-3">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.contact.items.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{contact.type}: </span>
                        <span>{contact.label}</span>
                        <span className="text-sm text-muted-foreground ml-2">({contact.url})</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContact(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Update About Information
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

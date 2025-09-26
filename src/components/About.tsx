import React, { useState, useEffect } from "react";
import { Code, Award, ExternalLink, GraduationCap, Trophy, FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { aboutAPI } from "../utils/api";

export function About() {
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAboutData();
  }, []);

  const loadAboutData = async () => {
    try {
      const data = await aboutAPI.getAll();
      setAboutData(data);
    } catch (error) {
      console.error('Error loading about data:', error);
      // Use fallback data if API fails
      setAboutData([
        { 
          section: 'bio', 
          content: { 
            paragraphs: [
              "Aspiring security-focused developer with a goal to become a skilled developer who prioritizes security in every aspect of software development.",
              "Currently studying at Korea University and actively participating in various security programs including Night Frontier, Knock On, and Team Rubiya Lab.",
              "This blog serves as my personal documentation of learning journey, development insights, and security research findings."
            ]
          }
        },
        {
          section: 'skills',
          content: {
            items: [
              "Web Application Security",
              "Penetration Testing", 
              "Bug Bounty Hunting",
              "Reverse Engineering",
              "Node.js / React",
              "Python / Go", 
              "Docker / Kubernetes",
              "Cloud Security (AWS/GCP)"
            ]
          }
        },
        {
          section: 'achievements',
          content: {
            items: [
              { title: "CVE-2024-XXXX", description: "Critical XSS vulnerability in popular CMS" },
              { title: "Hall of Fame", description: "Google, Facebook, Microsoft Bug Bounty Programs" },
              { title: "OSCP Certified", description: "Offensive Security Certified Professional" },
              { title: "DEF CON Speaker", description: "Presented research on container escape techniques" }
            ]
          }
        },
        {
          section: 'contact',
          content: {
            items: [
              { type: "email", label: "wlsdud0905@korea.ac.kr", url: "wlsdud0905@korea.ac.kr" },
              { type: "discord", label: "@yd1ng_404", url: "https://discord.com/users/yd1ng_404" },
              { type: "github", label: "yangdding", url: "https://github.com/yangdding" }
            ]
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-mono">About yd1ng</h1>
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <h1 className="text-3xl font-mono">About yd1ng</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Aspiring security-focused developer with a goal to become a skilled developer 
          who prioritizes security in every aspect of software development.
        </p>
      </div>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Technical Skills</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-sm">C</Badge>
            <Badge variant="secondary" className="text-sm">C++</Badge>
            <Badge variant="secondary" className="text-sm">Python</Badge>
            <Badge variant="secondary" className="text-sm">TypeScript</Badge>
            <Badge variant="secondary" className="text-sm">Web Security</Badge>
            <Badge variant="secondary" className="text-sm">Node.js</Badge>
            <Badge variant="secondary" className="text-sm">React</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span># Education</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-muted-foreground">•</span>
                <span>2022.03~2025.01 Jangseong High School</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-muted-foreground">•</span>
                <span>2025.03~ Korea University</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-muted-foreground">•</span>
                <span>2025.09 Night Frontier 1기</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-muted-foreground">•</span>
                <span>2025.09 Knock On 6기 Certificate</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-muted-foreground">•</span>
                <span>2025.09 Team Rubiya Lab</span>
              </div>
            </div>
        </CardContent>
      </Card>

      {/* Awards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span># Awards</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg mb-2">2022</h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-muted-foreground">•</span>
                  <span>2022.11 - Dacon 태양광 발전량 예측 AI 경진대회 - 은상</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-2">2023</h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-muted-foreground">•</span>
                  <span>2023.08 - 전라남도 sw 융합 해커톤 - 전라남도 교육감상</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span># Projects</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 2025.09 ~ */}
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-sm font-semibold">CURT 2nd - TBA</h4>
                <span className="text-xs text-muted-foreground">2025.09~</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Second project from Korea University CURT program. Details to be announced.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs">TBA</Badge>
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-sm font-semibold">Blog Platform</h4>
                <span className="text-xs text-muted-foreground">2025.09~</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Full-stack blog platform built with React, TypeScript, and Supabase. 
                Features include admin authentication, post management, and password protection.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs">React</Badge>
                <Badge variant="outline" className="text-xs">TypeScript</Badge>
                <Badge variant="outline" className="text-xs">Supabase</Badge>
                <Badge variant="outline" className="text-xs">Tailwind CSS</Badge>
              </div>
              <div className="mt-3">
                <a 
                  href="https://github.com/yangdding/yd1ng.dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  GitHub Repository
                </a>
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-sm font-semibold">Goal Memo</h4>
                <span className="text-xs text-muted-foreground">2025.09~09</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Goal tracking and memo application for personal productivity. 
                Features include goal setting, progress tracking, and memo management with real-time updates.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs">JavaScript</Badge>
                <Badge variant="outline" className="text-xs">React</Badge>
                <Badge variant="outline" className="text-xs">Supabase</Badge>
                <Badge variant="outline" className="text-xs">Tailwind CSS</Badge>
              </div>
            </div>

            {/* 2025.04 ~ */}
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-sm font-semibold">LLM Project</h4>
                <span className="text-xs text-muted-foreground">2025.04~</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered zero-day vulnerability discovery system using Large Language Models. 
                Automates security research and vulnerability detection through advanced AI analysis.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs">Python</Badge>
                <Badge variant="outline" className="text-xs">LLM</Badge>
                <Badge variant="outline" className="text-xs">AI/ML</Badge>
                <Badge variant="outline" className="text-xs">Zero-day Research</Badge>
              </div>
            </div>

            {/* CURT 1st - 맨 밑으로 이동 */}
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-sm font-semibold">CURT 1st - Malicious URL Detection</h4>
                <span className="text-xs text-muted-foreground">2025.04~07</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Deep learning-based malicious URL analysis system developed as part of Korea University CURT program. 
                Uses feature-based machine learning and ensemble techniques to classify URLs as malicious or benign.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs">Python</Badge>
                <Badge variant="outline" className="text-xs">XGBoost</Badge>
                <Badge variant="outline" className="text-xs">Scikit-learn</Badge>
                <Badge variant="outline" className="text-xs">Flask</Badge>
                <Badge variant="outline" className="text-xs">Machine Learning</Badge>
              </div>
              <div className="mt-3">
                <a 
                  href="https://github.com/yangdding/KoreaUniv_CURT_malicious_url_analysis" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  GitHub Repository
                </a>
              </div>
            </div>
         </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Get In Touch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={() => {
                const email = 'wlsdud0905@korea.ac.kr';
                navigator.clipboard.writeText(email).then(() => {
                  alert('이메일 주소가 클립보드에 복사되었습니다: ' + email);
                }).catch(() => {
                  // 클립보드 복사 실패 시 fallback
                  window.location.href = 'mailto:' + email;
                });
              }}
            >
              <ExternalLink className="h-4 w-4" />
              <span>Email: wlsdud0905@korea.ac.kr</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={() => window.open('https://discord.com/users/yd1ng_404', '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              <span>Discord: @yd1ng_404</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={() => window.open('https://github.com/yangdding', '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              <span>GitHub: yangdding</span>
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
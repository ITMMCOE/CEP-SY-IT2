import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TemplateCard from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Zap, Target, Download, Wand2, Clock, Eye } from "lucide-react";

const Index = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const templates = [
    {
      id: 1,
      title: "Product Ad",
      description: "Perfect for showcasing physical products like sneakers, perfumes, or gadgets",
      category: "E-commerce"
    },
    {
      id: 2,
      title: "Service Ad",
      description: "Ideal for promoting restaurants, salons, or professional services",
      category: "Business"
    },
    {
      id: 3,
      title: "Social Media Ad",
      description: "Optimized for Instagram, Facebook, and other social platforms",
      category: "Social"
    },
    {
      id: 4,
      title: "Special Offer Ad",
      description: "Eye-catching designs for sales, discounts, and limited-time offers",
      category: "Promotion"
    }
  ];

  const features = [
    {
      icon: <Wand2 className="w-8 h-8" />,
      title: "AI-Powered Generation",
      description: "Create stunning ad visuals and copy in seconds using advanced AI"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Generate professional ads in under 10 seconds"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Platform Optimized",
      description: "Tailored for Instagram, Facebook, LinkedIn, and more"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Export & Share",
      description: "Download as PNG/JPG or share directly to social media"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 mb-6 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">AI-Powered Marketing Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-fade-in">
              AI-Powered Ad Maker
            </span>
            <br />
            <span className="text-foreground">for Businesses and Creators</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Create stunning ad visuals and copy in seconds using AI.
            <br />
            <span className="text-lg">No design skills required.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/generate">
              <Button size="lg" className="group text-lg px-8 py-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Create Your Own Ad
              </Button>
            </Link>
            <Link to="/templates">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Browse Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Why Choose <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AdGen AI</span>
            </h2>
            <p className="text-muted-foreground text-lg">Everything you need to create professional marketing ads</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="text-center p-8 rounded-lg border border-border bg-card hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group"
              >
                <div className="text-primary mb-4 flex justify-center group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Choose a <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Template</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Start with a pre-designed template or create from scratch
            </p>
            <Link to="/templates">
              <Button variant="outline" size="lg">
                View All Templates
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                title={template.title}
                description={template.description}
                imageUrl="/placeholder.svg"
                onClick={() => setSelectedTemplate(template.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Template Preview Modal */}
      <Dialog open={selectedTemplate !== null} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {templates.find(t => t.id === selectedTemplate)?.title}
            </DialogTitle>
            <DialogDescription>
              {templates.find(t => t.id === selectedTemplate)?.category} Template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 rounded-lg flex items-center justify-center border border-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,191,255,0.1),transparent_50%)]" />
              <div className="text-center relative z-10">
                <Eye className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Template Preview</p>
                <p className="text-sm text-muted-foreground/60 mt-2">Full preview coming soon</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-4">
                {templates.find(t => t.id === selectedTemplate)?.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  AI-Generated
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                  Customizable
                </span>
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                  High Resolution
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <Link to="/generate" className="flex-1">
                <Button className="w-full" size="lg">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Use This Template
                </Button>
              </Link>
              <Button variant="outline" size="lg" onClick={() => setSelectedTemplate(null)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;

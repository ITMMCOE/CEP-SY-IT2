import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TemplateCard from "@/components/TemplateCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import sneakerAd from "@/assets/sneaker-ad.jpg";
import perfumeAd from "@/assets/perfume-ad.jpg";
import restaurantPromo from "@/assets/restaurant-promo.jpg";
import professionalService from "@/assets/professional-service.jpg";

const Templates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const templates = [
    {
      id: 1,
      title: "Product Ad - Sneaker",
      description: "Perfect for showcasing footwear and athletic products",
      imageUrl: sneakerAd,
      category: "Product",
      platform: "Instagram"
    },
    {
      id: 2,
      title: "Product Ad - Perfume",
      description: "Luxury design for beauty and fragrance products",
      imageUrl: perfumeAd,
      category: "Product",
      platform: "Facebook"
    },
    {
      id: 3,
      title: "Restaurant Promotion",
      description: "Ideal for food services and dining promotions",
      imageUrl: restaurantPromo,
      category: "Service",
      platform: "Instagram"
    },
    {
      id: 4,
      title: "Professional Service",
      description: "Clean design for B2B and professional services",
      imageUrl: professionalService,
      category: "Service",
      platform: "LinkedIn"
    }
  ];

  const categories = ["all", "Product", "Service"];
  
  const filteredTemplates = filter === "all" 
    ? templates 
    : templates.filter(t => t.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Ad <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Templates</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Choose from professionally designed templates and customize with AI
            </p>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={filter === category ? "default" : "outline"}
                  onClick={() => setFilter(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                title={template.title}
                description={template.description}
                imageUrl={template.imageUrl}
                onClick={() => setSelectedTemplate(template.id)}
              />
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No templates found in this category</p>
            </div>
          )}
        </div>
      </div>

      {/* Template Preview Modal */}
      <Dialog open={selectedTemplate !== null} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {templates.find(t => t.id === selectedTemplate)?.title}
            </DialogTitle>
            <DialogDescription>
              {templates.find(t => t.id === selectedTemplate)?.category} • {templates.find(t => t.id === selectedTemplate)?.platform}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 rounded-lg flex items-center justify-center border border-primary/20 relative overflow-hidden">
              {templates.find(t => t.id === selectedTemplate)?.imageUrl.includes('placeholder') ? (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,191,255,0.1),transparent_50%)]" />
                  <div className="text-center relative z-10">
                    <Eye className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Template Preview</p>
                    <p className="text-sm text-muted-foreground/60 mt-2">Full preview coming soon</p>
                  </div>
                </>
              ) : (
                <img 
                  src={templates.find(t => t.id === selectedTemplate)?.imageUrl}
                  alt={templates.find(t => t.id === selectedTemplate)?.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </div>
            <div>
              <p className="text-muted-foreground mb-4">
                {templates.find(t => t.id === selectedTemplate)?.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  AI-Powered
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                  Fully Customizable
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

      <Footer />
    </div>
  );
};

export default Templates;

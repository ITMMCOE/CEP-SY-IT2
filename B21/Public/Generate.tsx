import { useState, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Bot, User, Sparkles, Download, RefreshCw, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImageEditor } from "@/components/ImageEditor";
import cakeAdTemplate from "@/assets/cake-ad-template.jpg";

type Message = {
  role: "bot" | "user";
  content: string;
};

type ChatStep = "greeting" | "product_name" | "description" | "audience" | "platform" | "theme" | "generating" | "preview";

const Generate = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hi! Let's design your next great ad. What's your product or service name?" }
  ]);
  const [input, setInput] = useState("");
  const [currentStep, setCurrentStep] = useState<ChatStep>("product_name");
  const [adData, setAdData] = useState({
    productName: "",
    description: "",
    audience: "",
    platform: "",
    theme: ""
  });
  const [generatedAd, setGeneratedAd] = useState<{ copy: string; image: string } | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);

    // Process based on current step
    setTimeout(() => {
      processStep(input);
    }, 500);

    setInput("");
  };

  const processStep = (userInput: string) => {
    let botResponse = "";
    let nextStep: ChatStep = currentStep;

    switch (currentStep) {
      case "product_name":
        setAdData(prev => ({ ...prev, productName: userInput }));
        botResponse = `Great! Tell me a short description of ${userInput}.`;
        nextStep = "description";
        break;
      case "description":
        setAdData(prev => ({ ...prev, description: userInput }));
        botResponse = "Who is your target audience? (e.g., young adults, professionals, parents)";
        nextStep = "audience";
        break;
      case "audience":
        setAdData(prev => ({ ...prev, audience: userInput }));
        botResponse = "Which platform will this ad be for? (Instagram, Facebook, LinkedIn, etc.)";
        nextStep = "platform";
        break;
      case "platform":
        setAdData(prev => ({ ...prev, platform: userInput }));
        botResponse = "What theme or mood do you want? (e.g., luxury, modern, energetic, professional)";
        nextStep = "theme";
        break;
      case "theme":
        setAdData(prev => ({ ...prev, theme: userInput }));
        botResponse = "Perfect! Let me generate your ad now...";
        nextStep = "generating";
        setTimeout(() => {
          generateAd();
        }, 1500);
        break;
    }

    setMessages(prev => [...prev, { role: "bot", content: botResponse }]);
    setCurrentStep(nextStep);
  };

  const generateAd = async () => {
    try {
      console.log("Generating ad with data:", adData);

      const { data, error } = await supabase.functions.invoke('generate-ad-image', {
        body: {
          productName: adData.productName,
          description: adData.description,
          audience: adData.audience,
          platform: adData.platform,
          theme: adData.theme
        }
      });

      if (error) {
        console.error("Error generating ad:", error);
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate ad. Please try again.",
          variant: "destructive"
        });
        setCurrentStep("theme");
        return;
      }

      if (data?.imageUrl) {
        const newAd = {
          copy: `${adData.productName}\n\n${adData.description}\n\nPerfect for ${adData.audience}`,
          image: data.imageUrl
        };
        setGeneratedAd(newAd);
        setCurrentStep("preview");
        setMessages(prev => [...prev, { 
          role: "bot", 
          content: "Your ad is ready! You can edit the text, regenerate, or download it below." 
        }]);
        
        toast({
          title: "Ad Generated!",
          description: "Your marketing ad is ready to use.",
        });
      }
    } catch (error) {
      console.error("Error in generateAd:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      setCurrentStep("theme");
    }
  };

  const handleRegenerate = () => {
    setGeneratedAd(null);
    setCurrentStep("generating");
    setMessages(prev => [...prev, 
      { role: "user", content: "Regenerate ad" },
      { role: "bot", content: "Generating a new version..." }
    ]);
    generateAd();
  };

  const handleDownload = () => {
    if (!generatedAd?.image) return;

    try {
      // Create a link element
      const link = document.createElement('a');
      link.href = generatedAd.image;
      link.download = `${adData.productName.replace(/\s+/g, '-')}-ad.png`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "Your ad is being downloaded.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditSave = (editedImageUrl: string) => {
    setGeneratedAd(prev => prev ? { ...prev, image: editedImageUrl } : null);
    setIsEditorOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              AI Ad <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Generator</span>
            </h1>
            <p className="text-muted-foreground">Let our AI assistant help you create the perfect marketing ad</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chat Interface */}
            <Card className="p-6 flex flex-col h-[600px]">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "bot" ? "bg-primary/10" : "bg-secondary/10"
                    }`}>
                      {message.role === "bot" ? (
                        <Bot className="w-4 h-4 text-primary" />
                      ) : (
                        <User className="w-4 h-4 text-secondary" />
                      )}
                    </div>
                    <div className={`px-4 py-3 rounded-lg max-w-[80%] ${
                      message.role === "bot" 
                        ? "bg-muted" 
                        : "bg-primary text-primary-foreground"
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {currentStep === "generating" && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                    <div className="px-4 py-3 rounded-lg bg-muted">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {currentStep !== "generating" && currentStep !== "preview" && (
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type your answer..."
                    className="flex-1"
                  />
                  <Button onClick={handleSend} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </Card>

            {/* Preview Panel */}
            <Card className="p-6 flex flex-col h-[600px]">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Ad Preview
              </h3>
              
              {generatedAd ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 rounded-lg mb-4 relative overflow-hidden bg-muted">
                    <img 
                      src={generatedAd.image} 
                      alt="Generated Ad" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={handleRegenerate}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditorOpen(true)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div className="max-w-md">
                    <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground mb-2">Your ad will appear here</p>
                    <p className="text-sm text-muted-foreground/60">Answer the questions to generate your ad</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Image Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Your Ad</DialogTitle>
          </DialogHeader>
          {generatedAd && (
            <ImageEditor
              imageUrl={generatedAd.image}
              productName={adData.productName}
              description={adData.description}
              onSave={handleEditSave}
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Generate;

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-4">About AdGen AI</h1>
          <p className="text-muted-foreground">Learn more about our AI-powered ad generator...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;

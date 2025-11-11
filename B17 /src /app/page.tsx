import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, Shield } from 'lucide-react';
import { AppLogo } from '@/components/common/AppLogo';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'landing-hero');

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-8">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover -z-10 brightness-[0.9]"
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm -z-10" />

      <div className="flex flex-col items-center text-center max-w-2xl mb-12">
        <AppLogo />
        <h1 className="text-4xl md:text-6xl font-bold font-headline mt-4">CivicConnect</h1>
        <p className="text-lg md:text-xl text-foreground mt-2">
          Your direct line to a better community. Report issues, track progress, and connect with local authorities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="bg-card/80 backdrop-blur-lg border-2 border-primary/20 shadow-lg hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader>
            <div className="flex items-center gap-4">
              <User className="w-8 h-8 text-primary" />
              <CardTitle className="text-2xl font-headline">User</CardTitle>
            </div>
            <CardDescription>
              Report <strong>Login</strong> issues in your community and track their resolution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login/user">
              <Button className="w-full" variant="secondary">
                Continue as User <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-lg border-2 border-accent/20 shadow-lg hover:shadow-accent/20 hover:border-accent/50 transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-accent" />
              <CardTitle className="text-2xl font-headline">Authority</CardTitle>
            </div>
            <CardDescription>
              Access <strong>Login</strong> the dashboard to manage and address community reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login/authority">
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Continue as Authority <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

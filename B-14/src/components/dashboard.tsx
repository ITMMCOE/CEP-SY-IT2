
'use client';

import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Briefcase, Lightbulb, TrendingUp, GraduationCap, Star, ArrowRight, BrainCircuit, Bot, MessageCircle, Flag, Target, BookOpen, Upload } from 'lucide-react';
import { getCareerPathRecommendations } from '@/ai/flows/career-path-from-prompt';
import type { CareerPathRecommendationsOutput } from '@/ai/flows/schemas/career-path-from-prompt-schema';
import { skillsGapAnalysisAndSuggestions } from '@/ai/flows/skills-gap-analysis-and-suggestions';
import type { SkillsGapAnalysisAndSuggestionsOutput } from '@/ai/flows/schemas/skills-gap-analysis-and-suggestions-schema';
import { analyzeJobMarketTrends } from '@/ai/flows/job-market-trend-analysis-for-career';
import type { JobMarketTrendAnalysisOutput } from '@/ai/flows/schemas/job-market-trend-analysis-for-career-schema';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemo } from 'react';


const formSchema = z.object({
  prompt: z.string().min(20, {
    message: 'Please describe your interests and experiences in at least 20 characters.',
  }),
  userSkills: z.string().optional(),
});

type AppState = 'IDLE' | 'LOADING_PATHS' | 'SHOWING_PATHS' | 'LOADING_ANALYSIS' | 'SHOWING_ANALYSIS';

type AnalysisData = {
  skillsGap: SkillsGapAnalysisAndSuggestionsOutput;
  marketTrends: JobMarketTrendAnalysisOutput;
};

export function Dashboard() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [careerPaths, setCareerPaths] = useState<string[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile } = useDoc(userProfileRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      userSkills: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      let promptText = '';
      if (userProfile.goals) {
        promptText += `I'm interested in ${userProfile.goals}. `;
      }
      if (userProfile.education) {
        promptText += `My education is in ${userProfile.education}. `;
      }
      if (promptText.length > 0) {
        form.setValue('prompt', promptText.trim());
      }
      form.setValue('userSkills', userProfile.skills || '');
    }
  }, [userProfile, form]);

  const handleAIError = (error: any, context: string) => {
    console.error(`AI Error during ${context}:`, error);
    let description = `An error occurred while ${context}. Please try again.`;
    if (error instanceof Error && (error.message.includes('503') || error.message.includes('overloaded'))) {
      description = "The AI service is currently overloaded. Please try again in a few moments.";
    } else if (error instanceof Error) {
      description = error.message;
    }
    
    toast({
      variant: "destructive",
      title: "AI Service Error",
      description: description,
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setAppState('LOADING_PATHS');
    setSelectedCareer(null);
    setAnalysis(null);
    try {
      const result = await getCareerPathRecommendations({ prompt: values.prompt });
      setCareerPaths(result.careerPaths);
      setAppState('SHOWING_PATHS');
    } catch (error) {
      handleAIError(error, "generating career recommendations");
      setAppState('IDLE');
    }
  }

  async function handleSelectCareer(career: string) {
    setSelectedCareer(career);
    setAppState('LOADING_ANALYSIS');
    const userSkills = form.getValues('userSkills')?.split(',').map(s => s.trim()).filter(Boolean) || [];

    try {
      const [skillsGap, marketTrends] = await Promise.all([
        skillsGapAnalysisAndSuggestions({ careerPath: career, userSkills }),
        analyzeJobMarketTrends({ careerPath: career }),
      ]);
      setAnalysis({ skillsGap, marketTrends });
      setAppState('SHOWING_ANALYSIS');
    } catch (error) {
      handleAIError(error, "loading career analysis");
      setAppState('SHOWING_PATHS');
    }
  }
  
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        form.setValue('prompt', text);
        toast({
            title: 'File Uploaded',
            description: `${file.name} has been loaded into the text area.`,
        })
      };
      reader.onerror = () => {
        toast({
            variant: "destructive",
            title: 'File Read Error',
            description: `Could not read the file ${file.name}.`,
        })
      }
      reader.readAsText(file);
    }
  };
  
  const currentSkills = form.getValues('userSkills')?.split(',').map(s => s.trim()).filter(Boolean) || [];


  return (
    <div className="relative">
      <div className="flex flex-col gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Your Career Dashboard</CardTitle>
            <CardDescription>Tell us about yourself, and our AI will map out potential career paths for you.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="text-base">Interests, Hobbies & Experiences</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload File
                        </Button>
                        <FormControl>
                           <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.md,.text" />
                        </FormControl>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., I love building things with code, enjoy solving complex puzzles, and have experience leading small project teams... Or, upload a file."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This helps us understand what drives you. You can also update your profile in the <Link href="/profile" className="underline">Profile page</Link>.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Your Current Skills</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Python, Project Management, Public Speaking" {...field} />
                      </FormControl>
                      <FormDescription>
                        List your skills, separated by commas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={appState === 'LOADING_PATHS' || appState === 'LOADING_ANALYSIS'} className="w-full sm:w-auto">
                  {appState === 'LOADING_PATHS' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Paths...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      Discover My Career Paths
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {(appState === 'LOADING_PATHS' || appState === 'LOADING_ANALYSIS' || (appState !== 'IDLE' && careerPaths.length > 0)) && (
          <Card className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Recommended Career Paths</CardTitle>
              <CardDescription>Based on your profile, here are some careers that might be a great fit for you.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {appState === 'LOADING_PATHS' && Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="flex flex-col justify-between p-4">
                  <div className="h-6 bg-muted rounded w-3/4 animate-pulse mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                </Card>
              ))}
              {careerPaths.map((path) => (
                <Button
                  key={path}
                  variant="outline"
                  className={`h-auto text-left flex-col items-start p-4 justify-between transition-all duration-300 ${selectedCareer === path ? 'border-primary ring-2 ring-primary' : 'hover:bg-accent/10'}`}
                  onClick={() => handleSelectCareer(path)}
                  disabled={appState === 'LOADING_ANALYSIS'}
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-base">{path}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Click to explore this path in detail</p>
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
        
        {appState === 'LOADING_ANALYSIS' && (
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="animate-in fade-in-50">
                <CardHeader>
                  <div className="h-6 w-1/2 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {appState === 'SHOWING_ANALYSIS' && analysis && selectedCareer && (
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <Alert className="bg-primary/5 border-primary/20">
              <Star className="h-4 w-4 !text-primary" />
              <AlertTitle className="font-headline text-xl text-primary">Analysis for: {selectedCareer}</AlertTitle>
              <AlertDescription>
                Here's a detailed breakdown of what it takes to succeed as a {selectedCareer}.
              </AlertDescription>
            </Alert>
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline"><Lightbulb className="text-primary" />Skills Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible defaultValue="item-1">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-base font-semibold">Missing Skills</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4 text-muted-foreground">These are skills commonly required for a {selectedCareer} that weren't in your profile.</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.skillsGap.missingSkills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-base font-semibold"><GraduationCap className="inline-block mr-2" />Suggested Learning</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4 text-muted-foreground">Our AI recommends these resources to help you bridge your skills gap.</p>
                        <ul className="space-y-3 list-disc pl-5">
                          {analysis.skillsGap.suggestedResources.map(resource => <li key={resource}>{resource}</li>)}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline"><TrendingUp className="text-primary" />Job Market Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-base mb-2">Market Trends</h4>
                      <p className="text-muted-foreground">{analysis.marketTrends.trends}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-base mb-2">Opportunities & Challenges</h4>
                      <p className="text-muted-foreground">{analysis.marketTrends.insights}</p>
                    </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {appState === 'SHOWING_ANALYSIS' && analysis && selectedCareer && (
          <Card id="roadmap" className="shadow-lg animate-in fade-in-50 slide-in-from-bottom-5 duration-700">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Your Career Roadmap to become a {selectedCareer}</CardTitle>
              <CardDescription>A step-by-step guide to help you achieve your career goals.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Step 1: Current Position */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <div className="relative mb-2">
                    <Flag className="w-12 h-12 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-lg">Starting Point</h3>
                  <p className="text-muted-foreground text-sm mb-2">Your current skillset</p>
                  <Card className="w-full p-3 bg-muted/50">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {currentSkills.length > 0 ? currentSkills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>) : <p className="text-sm text-muted-foreground">No skills listed</p>}
                    </div>
                  </Card>
                </div>
                
                <div className="hidden md:flex items-center">
                  <ArrowRight className="w-8 h-8 text-muted-foreground" />
                </div>

                {/* Step 2: Learning Phase */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <div className="relative mb-2">
                    <BookOpen className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-lg">Learning Phase</h3>
                  <p className="text-muted-foreground text-sm mb-2">Acquire these missing skills</p>
                  <Card className="w-full p-3 bg-muted/50">
                     <div className="flex flex-wrap gap-2 justify-center">
                      {analysis.skillsGap.missingSkills.length > 0 ? analysis.skillsGap.missingSkills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>) : <p className="text-sm text-muted-foreground">No missing skills identified!</p>}
                    </div>
                  </Card>
                </div>

                <div className="hidden md:flex items-center">
                  <ArrowRight className="w-8 h-8 text-muted-foreground" />
                </div>

                {/* Step 3: Goal */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <div className="relative mb-2">
                    <Target className="w-12 h-12 text-red-500" />
                  </div>
                  <h3 className="font-semibold text-lg">Your Goal</h3>
                  <p className="text-muted-foreground text-sm mb-2">Achieve your target career</p>
                  <Card className="w-full p-3 bg-muted/50">
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-4 py-1">{selectedCareer}</Badge>
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

    
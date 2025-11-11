
import { MainLayout } from '@/components/main-layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy } from 'lucide-react';

const faqs = [
    {
        question: "How does the AI generate career recommendations?",
        answer: "Our AI analyzes the skills, interests, and experiences you provide in your profile and on the dashboard. It then cross-references this information with a vast database of job market trends and career path data to suggest roles that are a strong match for you."
    },
    {
        question: "Is my data secure?",
        answer: "Yes, we take data privacy very seriously. Your personal information is encrypted and stored securely. We do not share your data with third parties without your explicit consent. For more details, please review our Privacy Policy."
    },
    {
        question: "How can I update my profile information?",
        answer: "You can update your skills, education, and career goals at any time by navigating to the 'Profile' page from the sidebar."
    },
    {
        question: "What if I don't agree with a career suggestion?",
        answer: "Our AI provides suggestions based on the data available. If a recommendation doesn't feel right, you can simply explore other paths. The more detail you provide in your profile, the more accurate the recommendations will become."
    }
]

export default function SupportPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <LifeBuoy className="w-10 h-10 text-primary" />
              <div>
                <CardTitle className="font-headline text-3xl">Support</CardTitle>
                <CardDescription>Get help and find answers to your questions.</CardDescription>
              </div>
            </div>
          </CardHeader>
           <CardContent>
                <h3 className="font-semibold text-lg mb-2">Contact Us</h3>
                <p className="text-muted-foreground">For any questions, issues, or feedback that are not covered in the FAQ, please contact our support team at <a href="mailto:support@careercompass.ai" className="text-primary underline">support@careercompass.ai</a>.</p>
                <p className="mt-2 text-muted-foreground">We are here to help you on your career journey!</p>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index + 1}`} key={index}>
                            <AccordionTrigger className="text-base text-left">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>

      </div>
    </MainLayout>
  );
}

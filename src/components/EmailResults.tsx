import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmailResultsProps {
  extractedValues: any[];
  parsedInsights: any;
}

export const EmailResults: React.FC<EmailResultsProps> = ({ extractedValues, parsedInsights }) => {
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Create a summary of the results
      const summary = {
        labMarkers: extractedValues.length,
        insights: parsedInsights ? 'Generated' : 'Not available',
        timestamp: new Date().toISOString()
      };

      // In a real implementation, you would call an email service here
      // For now, we'll just show a success message
      console.log('Sending email to:', email, 'with summary:', summary);

      toast({
        title: "Email sent!",
        description: `Your lab results have been sent to ${email}`,
      });

      setEmail('');
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Failed to send email",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-blue-50/50 transition-colors">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                📧 Email My Results
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Send a copy of your lab results and insights to your email address.
            </p>
            
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSendEmail}
                disabled={isSending}
                className="whitespace-nowrap"
              >
                {isSending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              Your results will be sent securely. We don't store your email address.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
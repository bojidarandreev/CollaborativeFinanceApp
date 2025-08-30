import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2 } from 'lucide-react';

const mockAdvice = {
  summary: "Your spending is generally balanced, but there's a significant opportunity to save on dining out.",
  positive_points: [
    "Great job keeping your grocery spending consistent.",
    "Your utility bills are lower than average for your area."
  ],
  areas_for_improvement: [
    "You spent $450 on dining out this month. Consider cooking at home more often to reduce this by up to 50%.",
    "There are three subscriptions you haven't used in the last 90 days, totaling $45/month. Consider canceling them."
  ]
};

const AiAdvisorPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<typeof mockAdvice | null>(null);

  const handleGetAdvice = () => {
    setIsLoading(true);
    setAdvice(null);
    setTimeout(() => {
      setAdvice(mockAdvice);
      setIsLoading(false);
    }, 2000); // Simulate network delay
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">AI Budget Advisor</h1>
        <Button onClick={handleGetAdvice} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Get New Advice
        </Button>
      </div>
      <p className="text-gray-500 mb-6">Get personalized financial advice based on your spending habits.</p>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      )}

      {advice && (
        <div className="space-y-4">
            <Card>
                <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                <CardContent><p>{advice.summary}</p></CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-green-500">
                    <CardHeader><CardTitle>What You're Doing Well</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2">
                            {advice.positive_points.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
                    </CardContent>
                </Card>
                <Card className="border-red-500">
                    <CardHeader><CardTitle>Areas for Improvement</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2">
                            {advice.areas_for_improvement.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
};

export default AiAdvisorPage;

import { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Calendar, Clock, Target, Lightbulb } from 'lucide-react';
import backend from '~backend/client';
import TimelineView from '../components/improvement/TimelineView';
import SkillsPriority from '../components/improvement/SkillsPriority';
import ProjectSuggestions from '../components/improvement/ProjectSuggestions';

export default function ImprovementPlanPage() {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const { toast } = useToast();
  const analysisResult = location.state?.analysisResult;

  const [timeUntilInterview, setTimeUntilInterview] = useState('');
  const [userAvailability, setUserAvailability] = useState<'full-time' | 'part-time' | 'minimal'>('part-time');
  const [improvementPlan, setImprovementPlan] = useState<any>(null);

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      if (!analysisResult) throw new Error('Analysis result not available');
      
      return backend.analysis.generateImprovementPlan({
        skillsGap: analysisResult.skillsGap,
        timeUntilInterview: parseInt(timeUntilInterview),
        userAvailability
      });
    },
    onSuccess: (plan) => {
      setImprovementPlan(plan);
      toast({
        title: "Improvement plan generated!",
        description: "Your personalized learning roadmap is ready.",
      });
    },
    onError: (error) => {
      console.error('Plan generation error:', error);
      toast({
        title: "Failed to generate plan",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  });

  const handleGeneratePlan = () => {
    if (!timeUntilInterview || parseInt(timeUntilInterview) <= 0) {
      toast({
        title: "Invalid timeline",
        description: "Please enter a valid number of days until your interview.",
        variant: "destructive",
      });
      return;
    }
    generatePlanMutation.mutate();
  };

  if (!analysisResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-gray-600 mb-4">No analysis data found</p>
            <Link to={`/analysis/${userId}`}>
              <Button>Go to Job Analysis</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to={`/analysis/${userId}`} className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Analysis
          </Link>
          {improvementPlan && (
            <Link to={`/resume/${userId}`}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Build Resume
              </Button>
            </Link>
          )}
        </div>

        <div className="mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                Skill Improvement Plan
              </CardTitle>
              <CardDescription className="text-gray-600">
                Create a personalized roadmap to close skill gaps and improve your job match
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Timeline & Availability
              </CardTitle>
              <CardDescription>
                Tell us about your timeline and availability for skill improvement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timeUntilInterview">Days until interview/application deadline</Label>
                <Input
                  id="timeUntilInterview"
                  type="number"
                  placeholder="e.g., 30"
                  value={timeUntilInterview}
                  onChange={(e) => setTimeUntilInterview(e.target.value)}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Study availability</Label>
                <Select value={userAvailability} onValueChange={(value: any) => setUserAvailability(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time (40+ hours/week)</SelectItem>
                    <SelectItem value="part-time">Part-time (20 hours/week)</SelectItem>
                    <SelectItem value="minimal">Minimal (10 hours/week)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGeneratePlan}
                disabled={generatePlanMutation.isPending || !timeUntilInterview}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {generatePlanMutation.isPending ? 'Generating Plan...' : 'Generate Improvement Plan'}
              </Button>
            </CardContent>
          </Card>

          {improvementPlan && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Plan Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {improvementPlan.estimatedCompletionRate.toFixed(0)}%
                    </div>
                    <p className="text-gray-600 mb-4">Estimated Completion Rate</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-blue-700">
                        {improvementPlan.prioritizedSkills.length}
                      </div>
                      <div className="text-sm text-blue-600">Skills to Focus</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-green-700">
                        {improvementPlan.timeline.length}
                      </div>
                      <div className="text-sm text-green-600">Weeks Planned</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {improvementPlan && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkillsPriority skills={improvementPlan.prioritizedSkills} />
              <TimelineView timeline={improvementPlan.timeline} />
            </div>
            
            <ProjectSuggestions projects={improvementPlan.projectSuggestions} />
          </div>
        )}
      </div>
    </div>
  );
}

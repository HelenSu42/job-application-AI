import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Trophy, Plus, Trash2 } from 'lucide-react';
import backend from '~backend/client';

interface AchievementsFormProps {
  userProfile: any;
}

export default function AchievementsForm({ userProfile }: AchievementsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [achievements, setAchievements] = useState(
    userProfile.achievements?.length > 0 
      ? userProfile.achievements.map((a: any) => ({
          ...a,
          dateReceived: a.dateReceived ? new Date(a.dateReceived).toISOString().split('T')[0] : ''
        }))
      : [{ title: '', description: '', dateReceived: '' }]
  );

  const updateAchievementsMutation = useMutation({
    mutationFn: async (achievementsData: any[]) => {
      return backend.user.updateAchievements({
        userId: userProfile.id,
        achievements: achievementsData.map(achievement => ({
          title: achievement.title,
          description: achievement.description,
          dateReceived: achievement.dateReceived ? new Date(achievement.dateReceived) : undefined
        }))
      });
    },
    onSuccess: () => {
      toast({
        title: "Achievements updated",
        description: "Your achievements have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['user', userProfile.id] });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: "Update failed",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validAchievements = achievements.filter(achievement => achievement.title);
    updateAchievementsMutation.mutate(validAchievements);
  };

  const addAchievement = () => {
    setAchievements([...achievements, { title: '', description: '', dateReceived: '' }]);
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const updateAchievementField = (index: number, field: string, value: string) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-blue-600" />
          Achievements & Awards
        </CardTitle>
        <CardDescription>
          Add your professional achievements, awards, and recognitions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {achievements.map((achievement, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">Achievement {index + 1}</h4>
                {achievements.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAchievement(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${index}`}>Achievement Title</Label>
                  <Input
                    id={`title-${index}`}
                    value={achievement.title}
                    onChange={(e) => updateAchievementField(index, 'title', e.target.value)}
                    placeholder="e.g., Employee of the Year, Dean's List"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`dateReceived-${index}`}>Date Received</Label>
                  <Input
                    id={`dateReceived-${index}`}
                    type="date"
                    value={achievement.dateReceived}
                    onChange={(e) => updateAchievementField(index, 'dateReceived', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea
                  id={`description-${index}`}
                  value={achievement.description}
                  onChange={(e) => updateAchievementField(index, 'description', e.target.value)}
                  placeholder="Brief description of the achievement..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={addAchievement}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Achievement
            </Button>

            <Button 
              type="submit" 
              disabled={updateAchievementsMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {updateAchievementsMutation.isPending ? 'Updating...' : 'Update Achievements'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

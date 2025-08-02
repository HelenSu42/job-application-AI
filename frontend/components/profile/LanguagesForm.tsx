import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Globe, Plus, Trash2 } from 'lucide-react';
import backend from '~backend/client';

interface LanguagesFormProps {
  userProfile: any;
}

const proficiencyLevels = ['Basic', 'Conversational', 'Fluent', 'Native'];

export default function LanguagesForm({ userProfile }: LanguagesFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [languages, setLanguages] = useState(
    userProfile.languages?.length > 0 
      ? userProfile.languages 
      : [{ language: '', proficiency: 'Conversational' }]
  );

  const updateLanguagesMutation = useMutation({
    mutationFn: async (languagesData: any[]) => {
      return backend.user.updateLanguages({
        userId: userProfile.id,
        languages: languagesData.map(lang => ({
          language: lang.language,
          proficiency: lang.proficiency
        }))
      });
    },
    onSuccess: () => {
      toast({
        title: "Languages updated",
        description: "Your language information has been successfully updated.",
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
    const validLanguages = languages.filter(lang => lang.language);
    updateLanguagesMutation.mutate(validLanguages);
  };

  const addLanguage = () => {
    setLanguages([...languages, { language: '', proficiency: 'Conversational' }]);
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const updateLanguageField = (index: number, field: string, value: string) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    setLanguages(updated);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          Languages
        </CardTitle>
        <CardDescription>
          Add the languages you speak and your proficiency level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {languages.map((lang, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">Language {index + 1}</h4>
                {languages.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeLanguage(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`language-${index}`}>Language</Label>
                  <Input
                    id={`language-${index}`}
                    value={lang.language}
                    onChange={(e) => updateLanguageField(index, 'language', e.target.value)}
                    placeholder="e.g., English, Spanish, Mandarin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`proficiency-${index}`}>Proficiency Level</Label>
                  <Select 
                    value={lang.proficiency} 
                    onValueChange={(value) => updateLanguageField(index, 'proficiency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {proficiencyLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={addLanguage}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Language
            </Button>

            <Button 
              type="submit" 
              disabled={updateLanguagesMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {updateLanguagesMutation.isPending ? 'Updating...' : 'Update Languages'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

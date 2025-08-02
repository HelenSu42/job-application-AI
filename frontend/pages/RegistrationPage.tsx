import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, User, Mail, Phone, MapPin, DollarSign, Eye, EyeOff, Check, X } from 'lucide-react';
import backend from '~backend/client';

interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    currentSalary: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return backend.user.create({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        location: data.location || undefined,
        currentSalary: data.currentSalary ? parseInt(data.currentSalary) : undefined
      });
    },
    onSuccess: () => {
      toast({
        title: "Account created successfully!",
        description: "Please log in with your new account.",
      });
      navigate('/login');
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      const errorMessage = error.message || "Registration failed. Please try again.";
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const validatePassword = (password: string): PasswordRequirements => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const calculatePasswordStrength = (requirements: PasswordRequirements): 'weak' | 'medium' | 'strong' => {
    const satisfied = Object.values(requirements).filter(Boolean).length;
    if (satisfied < 3) return 'weak';
    if (satisfied < 5) return 'medium';
    return 'strong';
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthWidth = (strength: string) => {
    switch (strength) {
      case 'weak': return 'w-1/3';
      case 'medium': return 'w-2/3';
      case 'strong': return 'w-full';
      default: return 'w-0';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Terms & Conditions",
        description: "Please accept the Terms & Conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    const requirements = validatePassword(formData.password);
    const allRequirementsMet = Object.values(requirements).every(Boolean);
    
    if (!allRequirementsMet) {
      toast({
        title: "Password too weak",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both password fields match.",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      setPasswordRequirements(validatePassword(value as string));
    }
  };

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsDontMatch = formData.confirmPassword && formData.password !== formData.confirmPassword;
  const strength = calculatePasswordStrength(passwordRequirements);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Create Your Account</CardTitle>
            <CardDescription className="text-gray-600">
              Get started with your personalized job application assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength)} ${getStrengthWidth(strength)}`}></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        strength === 'weak' ? 'text-red-600' :
                        strength === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {strength.charAt(0).toUpperCase() + strength.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div className={`flex items-center gap-1 ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        At least 8 characters
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        One uppercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        One lowercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        One number
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        One special character
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pr-10 ${passwordsDontMatch ? 'border-red-500' : passwordsMatch ? 'border-green-500' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordsDontMatch && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Passwords don't match
                  </p>
                )}
                {passwordsMatch && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Passwords match
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                  Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="City, State/Country"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentSalary" className="text-sm font-medium text-gray-700">
                  Current Salary (Optional)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="currentSalary"
                    type="number"
                    placeholder="Annual salary in USD"
                    value={formData.currentSalary}
                    onChange={(e) => handleInputChange('currentSalary', e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  This helps us provide salary analysis and market comparisons
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
                />
                <Label htmlFor="acceptTerms" className="text-sm text-gray-700">
                  I accept the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Privacy Note:</strong> Your information is private and secure. 
                We use it only to provide personalized guidance and never share it with employers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

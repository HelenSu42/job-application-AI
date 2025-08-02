import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface SalaryAnalysisProps {
  salaryAnalysis: {
    estimatedRange: {
      min: number;
      max: number;
    };
    changePercentage: number;
    marketComparison: string;
  };
}

export default function SalaryAnalysis({ salaryAnalysis }: SalaryAnalysisProps) {
  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isPositiveChange = salaryAnalysis.changePercentage > 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Salary Analysis
        </CardTitle>
        <CardDescription>
          Estimated compensation for this role
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatSalary(salaryAnalysis.estimatedRange.min)} - {formatSalary(salaryAnalysis.estimatedRange.max)}
            </div>
            <p className="text-sm text-gray-600">Estimated salary range</p>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            {isPositiveChange ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
            <span className={`font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveChange ? '+' : ''}{salaryAnalysis.changePercentage}%
            </span>
            <span className="text-gray-600">vs current salary</span>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Market Comparison</h4>
            <p className="text-sm text-gray-700">{salaryAnalysis.marketComparison}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

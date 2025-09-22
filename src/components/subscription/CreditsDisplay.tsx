import { useCreditsSimple } from '@/hooks/useCreditsSimple';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ShoppingCart, Zap } from 'lucide-react';
import BuyCreditsDialog from './BuyCreditsDialog';

const CreditsDisplay = () => {
  const { 
    monthlyRemaining, 
    monthlyLimit, 
    purchasedRemaining, 
    isLoading 
  } = useCreditsSimple();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const monthlyPercentage = monthlyLimit > 0 ? (monthlyRemaining / monthlyLimit) * 100 : 0;

  return (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Crédits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crédits Mensuels */}
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50 border-b">
            <CardTitle className="text-lg font-bold text-slate-700">Crédits Mensuels</CardTitle>
            <Zap className="h-5 w-5 text-aurentia-orange-aurentia" />
            </CardHeader>
            <CardContent className="p-6">
            <div className="text-4xl font-extrabold text-slate-800 mb-2">
                {monthlyRemaining}
                <span className="text-lg font-medium text-slate-500"> / {monthlyLimit}</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">
                Crédits restants ce mois-ci. Se renouvelle le 1er de chaque mois.
            </p>
            <Progress value={monthlyPercentage} className="w-full h-3 [&>div]:bg-aurentia-orange-aurentia" />
            </CardContent>
        </Card>

        {/* Crédits Achetés */}
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50 border-b">
            <CardTitle className="text-lg font-bold text-slate-700">Crédits Achetés</CardTitle>
            <ShoppingCart className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent className="p-6">
            <div className="text-4xl font-extrabold text-slate-800 mb-2">
                {purchasedRemaining}
            </div>
            <p className="text-sm text-slate-500 mb-4">
                Crédits supplémentaires qui n'expirent pas.
            </p>
            <BuyCreditsDialog>
              <Button className="w-full bg-aurentia-orange-aurentia hover:bg-aurentia-orange-dark">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Acheter des crédits
              </Button>
            </BuyCreditsDialog>
            </CardContent>
        </Card>
        </div>
    </div>
  );
};

export default CreditsDisplay;

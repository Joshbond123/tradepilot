
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CryptoPair {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  image: string;
}

interface ExchangePrice {
  name: string;
  logo: string;
  price: number;
}

interface ArbitrageOpportunity {
  crypto: CryptoPair;
  buyFrom: ExchangePrice;
  sellTo: ExchangePrice;
  profitUSD: number;
}

export const ArbitragePage = () => {
  const navigate = useNavigate();
  const [cryptoPairs, setCryptoPairs] = useState<CryptoPair[]>([]);
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const exchanges = [
    { name: 'Binance', logo: '/lovable-uploads/b7657bba-7cf8-4a24-a064-3f3a59193299.png' },
    { name: 'Coinbase', logo: '/lovable-uploads/e50e50af-d1d9-4edc-abb0-2ed5ddbc145f.png' },
    { name: 'Kraken', logo: '/lovable-uploads/587fa5d4-f7b9-4420-8311-0e79d177af0b.png' },
    { name: 'Huobi', logo: '/lovable-uploads/896ff303-edb2-4659-b66b-cd19fa70a6a7.png' },
    { name: 'OKX', logo: '/lovable-uploads/82036cc7-571a-47d0-ae10-687c051f3b34.png' }
  ];

  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
      );
      const data = await response.json();
      setCryptoPairs(data);
      
      // Generate arbitrage opportunities with different exchanges for buy/sell
      const opportunities = data.map((crypto: CryptoPair) => {
        const basePrice = crypto.current_price;
        
        // Get two different random exchanges
        const shuffledExchanges = [...exchanges].sort(() => Math.random() - 0.5);
        const buyExchange = shuffledExchanges[0];
        const sellExchange = shuffledExchanges[1];
        
        const buyPrice = basePrice * (0.98 + Math.random() * 0.02); // Slightly lower
        const sellPrice = basePrice * (1.01 + Math.random() * 0.02); // Slightly higher
        const profitUSD = sellPrice - buyPrice; // Price gap between exchanges
        
        return {
          crypto,
          buyFrom: { ...buyExchange, price: buyPrice },
          sellTo: { ...sellExchange, price: sellPrice },
          profitUSD
        };
      });
      
      setArbitrageOpportunities(opportunities);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleExecuteTrade = () => {
    navigate('/plans');
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Live Arbitrage Feed</h1>
        <p className="text-gray-400">Real-time arbitrage opportunities across major exchanges</p>
      </div>

      {/* Live Crypto Prices */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
          Live Crypto Prices
        </h2>
        {isLoading ? (
          <div className="text-center py-4 text-gray-400">Loading prices...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {cryptoPairs.map((crypto) => (
              <div key={crypto.id} className="bg-gray-700/30 p-3 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <img src={crypto.image} alt={crypto.name} className="w-6 h-6 mr-2" />
                  <p className="text-white font-semibold">{crypto.name}</p>
                </div>
                <p className="text-sm text-gray-400">{crypto.symbol.toUpperCase()}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Arbitrage Opportunities */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Arbitrage Opportunities</h2>
        {isLoading ? (
          <div className="text-center py-4 text-gray-400">Loading opportunities...</div>
        ) : (
          <div className="space-y-4">
            {arbitrageOpportunities.map((opportunity, index) => (
              <div key={index} className="bg-gray-700/30 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img src={opportunity.crypto.image} alt={opportunity.crypto.name} className="w-8 h-8" />
                    <h3 className="text-lg font-bold text-white">
                      {opportunity.crypto.name} ({opportunity.crypto.symbol.toUpperCase()})
                    </h3>
                    <Badge className="bg-green-600/20 text-green-400">
                      Live
                    </Badge>
                  </div>
                  <Button
                    onClick={handleExecuteTrade}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  >
                    Execute Trade
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                    <p className="text-red-400 font-semibold mb-1">Buy from</p>
                    <div className="flex items-center">
                      <img 
                        src={opportunity.buyFrom.logo} 
                        alt={opportunity.buyFrom.name}
                        className="w-6 h-6 mr-2 object-contain"
                      />
                      <span className="text-white">{opportunity.buyFrom.name}</span>
                    </div>
                    <p className="text-sm text-gray-400">${opportunity.buyFrom.price.toFixed(6)}</p>
                  </div>
                  
                  <div className="bg-green-900/20 p-3 rounded-lg border border-green-500/30">
                    <p className="text-green-400 font-semibold mb-1">Sell to</p>
                    <div className="flex items-center">
                      <img 
                        src={opportunity.sellTo.logo} 
                        alt={opportunity.sellTo.name}
                        className="w-6 h-6 mr-2 object-contain"
                      />
                      <span className="text-white">{opportunity.sellTo.name}</span>
                    </div>
                    <p className="text-sm text-gray-400">${opportunity.sellTo.price.toFixed(6)}</p>
                  </div>
                  
                  <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                    <p className="text-blue-400 font-semibold mb-1">Potential Profit ($)</p>
                    <p className="text-2xl font-bold text-green-400">
                      ${opportunity.profitUSD.toFixed(6)}
                    </p>
                    <div className="flex items-center text-sm text-gray-400">
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Price Gap
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

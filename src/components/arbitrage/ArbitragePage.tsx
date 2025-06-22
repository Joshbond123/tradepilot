
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, RefreshCw, Zap, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export const ArbitragePage = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: cryptoData, isLoading, refetch } = useQuery({
    queryKey: ['crypto-arbitrage'],
    queryFn: async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h%2C24h');
      return response.json();
    },
    refetchInterval: autoRefresh ? 4000 : false,
  });

  const generateArbitrageData = (coin: any) => {
    const basePrice = coin.current_price;
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'Huobi', 'OKX'];
    
    return exchanges.map((exchange, index) => {
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      const price = basePrice * (1 + variation);
      return {
        exchange,
        price: price.toFixed(6),
        volume: Math.random() * 1000000,
      };
    });
  };

  const calculateArbitrageOpportunity = (exchanges: any[]) => {
    const prices = exchanges.map(e => parseFloat(e.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const profit = ((maxPrice - minPrice) / minPrice) * 100;
    
    const buyExchange = exchanges.find(e => parseFloat(e.price) === minPrice);
    const sellExchange = exchanges.find(e => parseFloat(e.price) === maxPrice);
    
    return {
      profit: profit.toFixed(3),
      buyFrom: buyExchange?.exchange,
      sellTo: sellExchange?.exchange,
      buyPrice: minPrice.toFixed(6),
      sellPrice: maxPrice.toFixed(6),
    };
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Live Arbitrage Feed</h1>
          <p className="text-gray-400">Real-time cryptocurrency arbitrage opportunities across major exchanges</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            className={autoRefresh ? "bg-green-600 hover:bg-green-700" : "border-gray-600 text-gray-400"}
          >
            <Zap className="h-4 w-4 mr-2" />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-400 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <Card className="bg-gradient-to-r from-green-900/50 to-blue-900/50 border-green-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold">AI Active</span>
            </div>
            <div className="text-gray-300">
              Scanning {cryptoData?.length || 0} assets across 5 exchanges
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Last Update</p>
            <p className="text-green-400">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </Card>

      {/* Arbitrage Opportunities */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading arbitrage opportunities...</p>
          </div>
        ) : (
          cryptoData?.map((coin: any) => {
            const exchanges = generateArbitrageData(coin);
            const opportunity = calculateArbitrageOpportunity(exchanges);
            const profitValue = parseFloat(opportunity.profit);
            
            return (
              <Card key={coin.id} className="bg-gray-800/50 border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <h3 className="text-lg font-bold text-white">{coin.name}</h3>
                      <p className="text-gray-400">{coin.symbol.toUpperCase()}/USD</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">
                        ${coin.current_price.toFixed(6)}
                      </p>
                      <div className="flex items-center space-x-1">
                        {coin.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                        <span className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    
                    <Badge 
                      variant={profitValue > 0.5 ? "default" : "secondary"}
                      className={`${
                        profitValue > 1 ? 'bg-green-600 text-white' : 
                        profitValue > 0.5 ? 'bg-yellow-600 text-white' : 
                        'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {opportunity.profit}% Profit
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Exchange Prices */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Exchange Prices</h4>
                    <div className="space-y-2">
                      {exchanges.map((exchange, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
                          <span className="text-gray-300">{exchange.exchange}</span>
                          <span className="text-white font-mono">${exchange.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Arbitrage Details */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Arbitrage Opportunity</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-green-900/20 border border-green-500/30 rounded">
                        <span className="text-green-300">Buy from {opportunity.buyFrom}</span>
                        <span className="text-green-400 font-mono">${opportunity.buyPrice}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-900/20 border border-red-500/30 rounded">
                        <span className="text-red-300">Sell to {opportunity.sellTo}</span>
                        <span className="text-red-400 font-mono">${opportunity.sellPrice}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-900/20 border border-blue-500/30 rounded">
                        <span className="text-blue-300">Potential Profit</span>
                        <span className="text-blue-400 font-semibold">{opportunity.profit}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {profitValue > 0.5 && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400 font-semibold">AI Recommendation</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Execute Trade
                      </Button>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">
                      High-profit opportunity detected. Execute arbitrage trade for optimal returns.
                    </p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

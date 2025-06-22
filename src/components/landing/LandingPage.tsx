
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Bot, TrendingUp, Shield, Zap, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">TradePilot AI</span>
          </div>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-2"
          >
            Login / Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AI-Powered Crypto
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent"> Arbitrage</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Harness the power of advanced AI to automatically identify and capitalize on cryptocurrency arbitrage opportunities across multiple exchanges. Start earning passive income today.
          </p>
          <Button 
            onClick={() => navigate('/login')}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg"
          >
            Start Trading Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose TradePilot AI?
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Our cutting-edge AI technology monitors thousands of trading pairs across major exchanges to find profitable opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-gray-800/50 border-gray-700 p-6 backdrop-blur-sm">
            <Bot className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Advanced AI Algorithm</h3>
            <p className="text-gray-300">
              Our proprietary AI scans multiple exchanges 24/7, identifying arbitrage opportunities with millisecond precision.
            </p>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6 backdrop-blur-sm">
            <TrendingUp className="h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Consistent Returns</h3>
            <p className="text-gray-300">
              Generate steady passive income with daily profit distributions ranging from 1.5% to 4.5% monthly.
            </p>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6 backdrop-blur-sm">
            <Shield className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Secure & Regulated</h3>
            <p className="text-gray-300">
              Bank-level security with multi-signature wallets and compliance with international regulations.
            </p>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6 backdrop-blur-sm">
            <Zap className="h-12 w-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-300">
              Execute trades in milliseconds to capture fleeting arbitrage opportunities before they disappear.
            </p>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6 backdrop-blur-sm">
            <Users className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Referral Program</h3>
            <p className="text-gray-300">
              Earn additional income by referring friends. Get 10% commission on their trading profits.
            </p>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6 backdrop-blur-sm">
            <Star className="h-12 w-12 text-orange-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">24/7 Support</h3>
            <p className="text-gray-300">
              Dedicated customer support team available round the clock to assist with any questions.
            </p>
          </Card>
        </div>
      </section>

      {/* Investment Plans Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Choose Your AI Trading Plan
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Select from our range of AI-powered investment plans designed for different risk appetites and investment amounts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/30 p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-2">Starter AI</h3>
            <div className="text-3xl font-bold text-blue-400 mb-2">1.5%</div>
            <p className="text-gray-300 text-sm mb-4">Monthly Returns</p>
            <p className="text-gray-400 text-sm mb-4">Min: $50 | 30 Days</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Binance Integration</li>
              <li>• Coinbase Pro</li>
              <li>• Kraken Access</li>
            </ul>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-blue-900/50 border-green-500/30 p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-2">Professional AI</h3>
            <div className="text-3xl font-bold text-green-400 mb-2">2.2%</div>
            <p className="text-gray-300 text-sm mb-4">Monthly Returns</p>
            <p className="text-gray-400 text-sm mb-4">Min: $1,000 | 45 Days</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 5 Major Exchanges</li>
              <li>• Advanced Algorithms</li>
              <li>• Priority Support</li>
            </ul>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30 p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-2">Premium AI</h3>
            <div className="text-3xl font-bold text-purple-400 mb-2">3.1%</div>
            <p className="text-gray-300 text-sm mb-4">Monthly Returns</p>
            <p className="text-gray-400 text-sm mb-4">Min: $10,000 | 60 Days</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• DeFi Integration</li>
              <li>• 6 Premium Exchanges</li>
              <li>• VIP Support</li>
            </ul>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-yellow-500/30 p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-2">Elite AI</h3>
            <div className="text-3xl font-bold text-yellow-400 mb-2">4.5%</div>
            <p className="text-gray-300 text-sm mb-4">Monthly Returns</p>
            <p className="text-gray-400 text-sm mb-4">Min: $100,000 | 90 Days</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Exclusive Access</li>
              <li>• 7 Elite Exchanges</li>
              <li>• Personal Manager</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center bg-gradient-to-r from-blue-900/50 to-green-900/50 rounded-2xl p-12 backdrop-blur-sm border border-blue-500/30">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users already earning passive income with our AI-powered arbitrage trading platform.
          </p>
          <Button 
            onClick={() => navigate('/login')}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg"
          >
            Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-800">
        <div className="text-center text-gray-400">
          <p>&copy; 2024 TradePilot AI. All rights reserved. | Advanced AI-Powered Crypto Arbitrage Trading</p>
        </div>
      </footer>
    </div>
  );
};

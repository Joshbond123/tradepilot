
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Bot, TrendingUp, Zap, Activity, Clock, BarChart2, ArrowUpDown, Cpu, Globe, Shield, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminAuth } from '@/components/admin/AdminAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const { isAuthenticated, login } = useAdminAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogoClick = () => {
    setLogoClickCount(prev => prev + 1);
    
    if (logoClickCount + 1 === 5) {
      setShowAdminAuth(true);
      setLogoClickCount(0);
    }
    
    setTimeout(() => {
      setLogoClickCount(0);
    }, 3000);
  };

  const handleAdminLogin = () => {
    login();
    setShowAdminAuth(false);
    navigate('/admin');
  };

  const aiFeatures = [
    {
      icon: Globe,
      title: "Real-Time Exchange Scanning",
      description: "Continuously monitors 15+ major exchanges worldwide for arbitrage opportunities",
      delay: "0ms"
    },
    {
      icon: Zap,
      title: "Lightning-Fast Price Comparison",
      description: "Advanced algorithms compare prices across exchanges in milliseconds",
      delay: "200ms"
    },
    {
      icon: Bot,
      title: "Automated Arbitrage Execution",
      description: "AI-powered trading bots execute profitable trades automatically",
      delay: "400ms"
    },
    {
      icon: Activity,
      title: "High-Frequency Trading Logic",
      description: "Sophisticated HFT algorithms capitalize on micro-price differences",
      delay: "600ms"
    },
    {
      icon: Cpu,
      title: "Machine Learning Algorithms",
      description: "Self-improving AI that learns from market patterns and trends",
      delay: "800ms"
    },
    {
      icon: Clock,
      title: "Ultra-Low Latency Performance",
      description: "Sub-millisecond execution times ensure maximum profit capture",
      delay: "1000ms"
    }
  ];

  const stats = [
    { icon: Globe, value: "15+", label: "Exchanges Monitored", delay: "0ms" },
    { icon: Zap, value: "<1ms", label: "Execution Speed", delay: "200ms" },
    { icon: BarChart2, value: "24/7", label: "Market Monitoring", delay: "400ms" },
    { icon: TrendingUp, value: "99.8%", label: "Uptime Guarantee", delay: "600ms" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div 
              className={`flex items-center space-x-2 cursor-pointer transition-all duration-700 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}
              onClick={handleLogoClick}
            >
              <Bot className="h-8 w-8 text-blue-400 transition-transform duration-300 hover:scale-110" />
              <span className="text-2xl font-bold text-white">TradePilot AI</span>
            </div>
            <div className={`transition-all duration-700 delay-300 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all duration-300 hover:scale-105"
              >
                Login / Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <Badge className="bg-blue-600/20 text-blue-400 mb-6 animate-pulse">
                🤖 Advanced AI Trading Engine
              </Badge>
            </div>
            
            <div className={`transition-all duration-1000 delay-200 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                AI-Powered
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 block">
                  Arbitrage Engine
                </span>
              </h1>
            </div>
            
            <div className={`transition-all duration-1000 delay-400 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Revolutionary AI technology that scans global crypto exchanges in real-time, 
                identifying and executing profitable arbitrage opportunities with lightning speed.
              </p>
            </div>
            
            <div className={`transition-all duration-1000 delay-600 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <Button 
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Start Trading with AI
                <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Engine Features */}
      <section className="py-20 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 delay-800 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How Our AI Arbitrage Engine Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Cutting-edge artificial intelligence meets high-frequency trading
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiFeatures.map((feature, index) => (
              <Card 
                key={index}
                className={`bg-gray-800/50 border-gray-700 p-6 hover:bg-gray-800/70 transition-all duration-500 hover:scale-105 hover:shadow-xl`}
                style={{
                  animation: isVisible ? `fadeInUp 0.8s ease-out ${feature.delay} both` : 'none'
                }}
              >
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-600/20 to-green-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110">
                    <feature.icon className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Statistics */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 delay-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ultra-High Performance Metrics
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Real-time performance indicators of our AI trading engine
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`text-center group transition-all duration-500 hover:scale-105`}
                style={{
                  animation: isVisible ? `fadeInUp 0.8s ease-out ${stat.delay} both` : 'none'
                }}
              >
                <div className="bg-gradient-to-r from-blue-600/10 to-green-600/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:from-blue-600/20 group-hover:to-green-600/20">
                  <stat.icon className="h-10 w-10 text-blue-400 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 mb-2">
                  {stat.value}
                </h3>
                <p className="text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Technology Deep Dive */}
      <section className="py-20 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transition-all duration-1000 delay-1200 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Advanced Machine Learning
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 block">
                  Trading Intelligence
                </span>
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                Our proprietary AI engine uses advanced machine learning algorithms to analyze market patterns, 
                predict price movements, and execute trades with unprecedented accuracy and speed.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Neural network pattern recognition</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Predictive market analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Risk optimization algorithms</span>
                </div>
              </div>
            </div>
            
            <div className={`transition-all duration-1000 delay-1400 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}>
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Market Analysis</span>
                    <span className="text-green-400 font-semibold">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">AI Processing Speed</span>
                    <span className="text-blue-400 font-semibold">847ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Arbitrage Opportunities</span>
                    <span className="text-purple-400 font-semibold">23 Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Success Rate</span>
                    <span className="text-yellow-400 font-semibold">98.7%</span>
                  </div>
                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-300">AI Engine Status: Online</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900/50 to-green-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transition-all duration-1000 delay-1600 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Experience AI-Powered Trading
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Join the future of cryptocurrency arbitrage with our advanced AI trading engine.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-white text-blue-900 hover:bg-gray-100 text-lg px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Start Trading Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Admin Auth Modal */}
      {showAdminAuth && (
        <AdminAuth
          onLogin={handleAdminLogin}
          onClose={() => setShowAdminAuth(false)}
        />
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

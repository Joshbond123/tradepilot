import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, TrendingUp, Shield, Zap, Users, Star, ChevronRight, Globe, BarChart3, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminAuth } from '@/components/admin/AdminAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const { isAuthenticated, login } = useAdminAuth();

  const handleLogoClick = () => {
    setLogoClickCount(prev => prev + 1);
    
    if (logoClickCount + 1 === 5) {
      setShowAdminAuth(true);
      setLogoClickCount(0);
    }
    
    // Reset count after 3 seconds if not completed
    setTimeout(() => {
      setLogoClickCount(0);
    }, 3000);
  };

  const handleAdminLogin = () => {
    login();
    setShowAdminAuth(false);
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={handleLogoClick}
            >
              <Bot className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">TradePilot AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-blue-600/20 text-blue-400 mb-6">
              🚀 AI-Powered Trading Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Smart Trading with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400"> AI Precision</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Harness the power of artificial intelligence to maximize your crypto arbitrage profits. 
              Our advanced algorithms scan multiple exchanges 24/7 to find the best opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-4"
              >
                Start Trading Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:text-white text-lg px-8 py-4"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose TradePilot AI?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Advanced features designed to maximize your trading success
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800/50 border-gray-700 p-6 hover:bg-gray-800/70 transition-colors">
              <div className="text-center">
                <div className="bg-blue-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI-Powered Analysis</h3>
                <p className="text-gray-400">
                  Our advanced AI continuously monitors market conditions and identifies profitable arbitrage opportunities across multiple exchanges.
                </p>
              </div>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 p-6 hover:bg-gray-800/70 transition-colors">
              <div className="text-center">
                <div className="bg-green-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Guaranteed Returns</h3>
                <p className="text-gray-400">
                  Enjoy consistent daily profits with our proven investment plans, backed by sophisticated trading algorithms.
                </p>
              </div>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 p-6 hover:bg-gray-800/70 transition-colors">
              <div className="text-center">
                <div className="bg-purple-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Secure & Reliable</h3>
                <p className="text-gray-400">
                  Your investments are protected with enterprise-grade security and transparent reporting.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How TradePilot AI Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Simple steps to start earning with AI-powered arbitrage trading
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Users, title: "Sign Up", desc: "Create your account in minutes" },
              { icon: Coins, title: "Deposit", desc: "Fund your account with crypto" },
              { icon: BarChart3, title: "Choose Plan", desc: "Select an investment strategy" },
              { icon: TrendingUp, title: "Earn Profits", desc: "Watch your balance grow daily" }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-blue-600 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-blue-400 mb-2">15+</h3>
              <p className="text-gray-400">Exchanges Monitored</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-green-400 mb-2">$2.5M+</h3>
              <p className="text-gray-400">Total Profits Generated</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-purple-400 mb-2">10K+</h3>
              <p className="text-gray-400">Active Traders</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-yellow-400 mb-2">99.8%</h3>
              <p className="text-gray-400">Uptime Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Traders Say
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Join thousands of successful traders earning daily profits
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Professional Trader",
                content: "TradePilot AI has revolutionized my trading strategy. The consistent daily returns are exactly what I needed for passive income.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Crypto Investor",
                content: "The AI analysis is incredibly accurate. I've seen steady growth in my portfolio since joining the platform.",
                rating: 5
              },
              {
                name: "Emma Rodriguez",
                role: "Day Trader",
                content: "Finally, a platform that delivers on its promises. The arbitrage opportunities are real and profitable.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-green-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join TradePilot AI today and start earning consistent daily profits with AI-powered arbitrage trading.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/login')}
            className="bg-white text-blue-900 hover:bg-gray-100 text-lg px-8 py-4"
          >
            Get Started Today
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold text-white">TradePilot AI</span>
              </div>
              <p className="text-gray-400">
                The future of automated crypto arbitrage trading, powered by artificial intelligence.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investment Plans</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Risk Disclosure</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TradePilot AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Admin Auth Modal */}
      {showAdminAuth && (
        <AdminAuth
          onLogin={handleAdminLogin}
          onClose={() => setShowAdminAuth(false)}
        />
      )}
    </div>
  );
};

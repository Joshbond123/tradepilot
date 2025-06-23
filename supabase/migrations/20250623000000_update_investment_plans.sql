
-- Update existing investment plans with professional AI names and daily profit percentages
UPDATE public.investment_plans 
SET name = 'Alpha Neural Trader',
    description = 'Entry-level AI system utilizing advanced neural networks for consistent arbitrage opportunities across top-tier exchanges.',
    daily_profit_percentage = 0.10
WHERE name = 'Starter AI Plan';

UPDATE public.investment_plans 
SET name = 'Quantum Arbitrage Engine',
    description = 'Professional-grade quantum computing algorithms for high-frequency arbitrage trading with enhanced profit margins.',
    daily_profit_percentage = 0.15
WHERE name = 'Professional AI Plan';

UPDATE public.investment_plans 
SET name = 'Titan Intelligence Platform',
    description = 'Premium AI infrastructure with deep learning capabilities for institutional-level arbitrage strategies and maximum returns.',
    daily_profit_percentage = 0.22
WHERE name = 'Premium AI Plan';

UPDATE public.investment_plans 
SET name = 'Nexus Elite AI System',
    description = 'Ultimate AI trading system with proprietary algorithms, real-time market analysis, and exclusive access to premium liquidity pools.',
    daily_profit_percentage = 0.30
WHERE name = 'Elite AI Plan';

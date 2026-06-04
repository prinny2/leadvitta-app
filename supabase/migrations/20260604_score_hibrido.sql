-- Migration: score híbrido (inteligência de NLP do "leadvitta-brain")
-- Rodar no Supabase SQL Editor. Persiste intenção, sentimento e score combinado
-- em historico_respostas para o dashboard exibir leads prioritários.

-- 1. Colunas de inteligência preditiva
ALTER TABLE public.historico_respostas
ADD COLUMN IF NOT EXISTS intent VARCHAR(100),
ADD COLUMN IF NOT EXISTS intent_confidence NUMERIC CHECK (intent_confidence BETWEEN 0 AND 1),
ADD COLUMN IF NOT EXISTS sentiment_label VARCHAR(50),
ADD COLUMN IF NOT EXISTS score_hibrido NUMERIC DEFAULT 0 CHECK (score_hibrido BETWEEN 0 AND 100);

-- 2. Índices para busca de leads prioritários no dashboard
CREATE INDEX IF NOT EXISTS idx_historico_score ON public.historico_respostas (score_hibrido DESC);
CREATE INDEX IF NOT EXISTS idx_historico_intent ON public.historico_respostas (intent);

-- 3. Documentação do esquema (visível no painel do Supabase)
COMMENT ON COLUMN public.historico_respostas.intent IS 'Intenção classificada pelo modelo de NLP (ex: quer agendar, objeção, preço)';
COMMENT ON COLUMN public.historico_respostas.intent_confidence IS 'Nível de confiança da classificação (0.0 a 1.0)';
COMMENT ON COLUMN public.historico_respostas.sentiment_label IS 'Nota de sentimento inferida (ex: 1 star a 5 stars)';
COMMENT ON COLUMN public.historico_respostas.score_hibrido IS 'Score combinado unindo dados clínicos e inteligência de NLP (0 a 100)';

# Project Brief — Color

## 1. Visao Geral

**Nome:** Color
**Tipo:** Plataforma de curadoria de paletas de cores
**Publico-alvo:** Desenvolvedores e designers
**Proposta de valor:** Ferramenta sem atrito para descobrir, criar e salvar paletas de cores, com interface minimalista (Clean UI), tracionada por UGC e SEO programatico.

## 2. Stack Tecnologica

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 15 (App Router) |
| Hospedagem & Edge | Cloudflare (via @opennextjs/cloudflare) |
| UI | Tailwind CSS + shadcn/ui + Lucide Icons |
| Autenticacao | Auth.js (Google + GitHub OAuth) |
| Banco de Dados | Cloudflare D1 (SQLite distribuido na borda) |
| ORM | Drizzle ORM (Edge Runtime) |
| Geracao de Conteudo | OpenAI API |
| Monetizacao | Google AdSense (pos-lancamento) |

## 3. Arquitetura do Produto

### 3.1 Estrategia "Mullet" de SEO

- **Acima da dobra:** Interface 100% limpa — cores + botoes de copia (experiencia do usuario)
- **Abaixo da dobra:** Conteudo gerado por IA para crawlers (descricao, aplicacoes, psicologia da cor)

### 3.2 Internacionalizacao (i18n)

- Rotas: `/en` (padrao), `/pt`, `/es`
- Tag `<link rel="alternate" hreflang="...">` para evitar penalidade de conteudo duplicado
- Traducoes geradas automaticamente via OpenAI API

### 3.3 Drip Publishing (Freshness)

- Cloudflare Cron Triggers + ISR do Next.js
- Liberacao gradual de paletas aprovadas (~5/dia)
- Google percebe o site como constantemente atualizado

## 4. Funcionalidades Core (MVP)

### 4.1 Paletas de Cores
- Visualizacao de paletas com interface minimalista
- Copia rapida de codigos (HEX, RGB, HSL)
- Navegacao por teclado (espaco para gerar/rolar, atalhos de copia)
- Verificador de contraste WCAG integrado
- Mini-preview/mockup de interface que muda em tempo real com a paleta

### 4.2 Sistema de Usuarios
- Login social (Google/GitHub) via Auth.js
- Criar paletas (enviadas como "pending")
- Curtir e salvar paletas em colecoes privadas (dashboard na nuvem)

### 4.3 Painel Admin (Integrado)
- Aprovar/rejeitar paletas submetidas
- Ao aprovar: IA gera textos automaticamente (descricao, aplicacoes, traducoes)
- Paleta entra na fila de publicacao do Cron Job

### 4.4 SEO Programatico
- Paginas individuais por paleta com conteudo rico gerado por IA
- Descricao, aplicacoes praticas, psicologia da cor
- Conteudo em 3 idiomas (en/pt/es)
- Sitemap dinamico

## 5. Diferenciais Competitivos

| Feature | Inspiracao | Diferencial Color |
|---------|------------|-------------------|
| Navegacao por teclado + velocidade | Coolors | + SEO programatico + UGC |
| Contraste WCAG | Adobe Color | Interface mais limpa, sem bloat |
| Preview em contexto (mockup) | Huemint | Mockup interativo + i18n |
| UGC com moderacao | — | Escala conteudo sem perder qualidade |
| Drip Publishing | — | Freshness constante para Google |

## 6. Fluxos Principais

### Fluxo do Visitante
```
Acessa paleta via Google → Ve cores (clean UI) → Copia codigos → Scroll → Ve conteudo SEO
```

### Fluxo do Usuario Logado
```
Login social → Cria paleta → Status "pending" → Salva favoritos em colecoes
```

### Fluxo de Publicacao
```
Paleta criada → Pending → Admin aprova → IA gera textos + traducoes → Fila Cron → Publicada
```

## 7. Monetizacao

- **Fase 1 (MVP):** Sem monetizacao — foco em tracao e conteudo
- **Fase 2:** Google AdSense integrado nas paginas de paleta (abaixo da dobra, junto ao conteudo SEO)

## 8. Metricas de Sucesso

- Paginas indexadas no Google
- Trafego organico mensal
- Paletas criadas por usuarios (UGC)
- Taxa de aprovacao de paletas
- Usuarios registrados e retencao (colecoes salvas)

## 9. Referencia Visual — Color Hunt (colorhunt.co)

O design do Color segue a mesma filosofia visual do Color Hunt:

### Principios de Design
- **Minimalismo extremo** — a interface desaparece, as cores sao o protagonista
- **Fundo branco** limpo, sem distracao
- **Sem sidebar** — conteudo centralizado
- **Espacamento generoso** entre elementos

### Header
- Logo a esquerda (texto simples)
- Navegacao por tags/categorias (Trending, Popular, Random, New)
- Login discreto a direita
- Header fixo, fino, clean

### Cards de Paleta
- **4 faixas de cor empilhadas verticalmente** (cada cor = faixa horizontal)
- Cantos arredondados
- Sombra sutil (sem bordas visiveis)
- Grid responsivo de cards
- Tamanho uniforme

### Interacoes
- **Hover no card:** revela codigos HEX + acoes (copiar, salvar)
- **Clique na cor:** copia HEX automaticamente
- **Like (coracao):** com contador e animacao sutil
- Transicoes suaves em tudo

### Tipografia e Cores da UI
- Sans-serif limpa (Inter ou similar)
- Texto em cinza escuro (#333), nunca preto puro
- Cinza claro para bordas/separadores
- Zero cores de destaque na UI — as paletas sao o destaque

## 10. Riscos e Mitigacoes

| Risco | Mitigacao |
|-------|----------|
| Limites do Cloudflare D1 | Monitorar uso; D1 suporta ate 10GB por banco |
| Custo OpenAI API | Cache agressivo; gerar texto apenas 1x por paleta |
| Qualidade do UGC | Moderacao manual via painel admin |
| SEO penalizado por conteudo IA | Conteudo de alta qualidade + revisao humana opcional |

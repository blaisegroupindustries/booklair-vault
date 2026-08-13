# Booklair Hub

Quero que construas uma plataforma completa de venda e distribuição 

de ebooks chamada BOOKLAIR. É um produto sério, profissional, 

e escalável — não um projeto simples.



## VISÃO GERAL

Booklair é uma plataforma digital lusófona (com suporte a inglês) 

para venda e distribuição de ebooks nas categorias: Marketing & 

Negócios, Educação & Estudo, e Desenvolvimento Pessoal. O mercado 

alvo é global — Brasil, Portugal, Angola, Moçambique, e qualquer 

utilizador de língua portuguesa ou inglesa no mundo.



## STACK TÉCNICA

- Frontend: React + Next.js (App Router)

- Backend: Next.js API Routes

- Base de dados: Supabase (PostgreSQL + Auth + Storage)

- Pagamentos: Stripe (suporte a USD e MZN)

- Hosting/Deploy: Vercel

- Estilo: Tailwind CSS



## SISTEMA DE UTILIZADORES

Dois tipos de conta:

1. FREE — pode navegar, ler ebooks gratuitos no browser 

   (sem download), e ver produtos premium na loja

2. COMPRADOR — utilizador que comprou um ebook específico, 

   tem acesso a download desse ebook em PDF



Não há subscrição mensal. Cada ebook premium é comprado 

individualmente (modelo pay-per-book).



## FUNCIONALIDADES OBRIGATÓRIAS



### Autenticação

- Registo e login com email/password via Supabase Auth

- Login social com Google

- Página de perfil do utilizador com histórico de compras



### Biblioteca Gratuita

- Listagem de ebooks gratuitos com capa, título, descrição 

  e categoria

- Leitura no browser (PDF viewer embutido) — sem download

- Filtro por categoria



### Loja Premium

- Listagem de ebooks pagos com capa, título, descrição, 

  preço em USD e MZN, e categoria

- Página individual de cada ebook com preview das primeiras 

  páginas

- Botão de compra que abre checkout Stripe

- Após pagamento confirmado: download desbloqueado 

  permanentemente para aquele utilizador



### Pagamentos

- Integração completa com Stripe Checkout

- Suporte a cartão de crédito/débito internacional

- Webhook Stripe para confirmar pagamento e libertar acesso

- Histórico de transações no painel do utilizador



### Painel de Administração (rota protegida /admin)

- Upload de novos ebooks (capa + PDF)

- Definir ebook como gratuito ou premium + preço

- Ver lista de utilizadores e compras

- Ver receita total



### Design & UX

- Design moderno, premium, e profissional

- Paleta escura com acentos dourados/âmbar 

  (transmite exclusividade e conhecimento)

- Totalmente responsivo — funciona perfeitamente em mobile

- Português como língua principal, com opção de alternar 

  para inglês (i18n básico)

- Animações suaves, tipografia elegante



### SEO & Marketing

- Meta tags dinâmicas por página

- Open Graph para partilha em redes sociais

- Sitemap automático

- Estrutura preparada para Meta Pixel (Facebook/Instagram Ads)



## ESTRUTURA DE PÁGINAS

- / — Homepage com hero, categorias, destaques

- /biblioteca — ebooks gratuitos

- /loja — ebooks premium

- /ebook/[slug] — página individual do ebook

- /perfil — área do utilizador (compras, downloads)

- /admin — painel de administração

- /sobre — sobre a plataforma

- /termos — termos e condições

- /privacidade — política de privacidade



## BASE DE DADOS (Supabase)

Tabelas necessárias:

- users (gerida pelo Supabase Auth)

- ebooks (id, titulo, descricao, categoria, tipo: 

  free|premium, preco_usd, preco_mzn, capa_url, 

  pdf_url, slug, destaque: boolean, criado_em)

- compras (id, user_id, ebook_id, stripe_session_id, 

  valor_pago, moeda, criado_em)

- downloads (id, user_id, ebook_id, data_download)



## SEGURANÇA

- PDFs premium nunca expostos publicamente — 

  acesso via URL assinada temporária (Supabase signed URLs)

- Rotas de admin protegidas por role no Supabase

- Variáveis sensíveis sempre em .env



## OBJETIVO FINAL

Uma plataforma que eu possa lançar, publicitar nas redes sociais, 

e gerar receita real. Deve estar pronta para escalar. 

Começa pela estrutura base do projeto e implementa 

funcionalidade por funcionalidade de forma organizada.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://booklair-vault.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f668e822-994c-4285-9b84-27f01c1a497b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

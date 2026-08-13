# Prompt gigante de reconstrução do Booklair Vault

Objetivo: produzir um documento único, muito extenso, que permita a outra IA recriar este site do zero — ficheiro a ficheiro, ecrã a ecrã, regra a regra.

## Onde fica

Um ficheiro markdown no projeto: `docs/REBUILD-PROMPT.md`, para poderes copiar/colar ou descarregar. (Opcionalmente também mostro um resumo no chat, mas o conteúdo completo fica no ficheiro — é grande demais para o chat.)

## Estrutura do documento

1. **Contexto e objetivo** — o que é o Booklair Vault: loja de ebooks premium (PT/EN + audiobooks), leitor protegido, painel de administração completo, e o produto separado Mentor 10K.
2. **Stack técnica exata** — TanStack Start v1 + React 19, Vite 7, Tailwind v4 via `src/styles.css`, shadcn/ui, TanStack Query, backend Supabase (auth, base de dados, storage), server functions, rotas de API públicas para webhooks.
3. **Design system** — tokens (Gold #D4AF37, Black #0A0A0A, Cream #FDFAF4), tipografia serif/sans, superfícies "liquid glass", classes utilitárias usadas (`surface-card`, `glass-card`, `gradient-text-gold`), estados hover/ativo, responsividade.
4. **Modelo de dados completo** — todas as tabelas com colunas, tipos, defaults, relações, políticas RLS, GRANTs, funções SQL (`has_role`, `has_ebook_access`, `has_mentor10k_access`, `claim_vault_access_for_email`), triggers (`handle_new_user`) e buckets de storage. Extraído da base de dados real.
5. **Mapa de rotas** — tabela com ficheiro → URL → o que faz → metadados SEO.
6. **Páginas públicas, uma a uma** — Home, Loja/catálogo unificado, Ebook `$slug` (leitor PDF/áudio protegido, contagem regressiva, badges, compra Lemon Squeezy), Biblioteca, Perfil, Auth (email + Google + redirect), landing do Mentor 10K, Sobre, Termos, Privacidade. Para cada uma: layout, secções, textos, estados vazios/erro, dados consumidos.
7. **PAINEL DE ADMINISTRAÇÃO — secção mais detalhada** (o foco). Para cada página admin: propósito, layout, cada campo, cada botão, o que acontece em cada ação, validações, permissões, e as tabelas que toca.
   - Layout `/admin` (guarda de acesso, sidebar, sino de notificações)
   - Dashboard executivo (métricas, gráficos Recharts, atividade recente)
   - Ebooks: lista + formulário multi-tab (metadados, PT/EN, PDF/áudio, capa por imagem ou por texto customizado, preços e promoções com datas, grátis por tempo limitado, rascunho/agendado/publicado, samples, bónus, capítulos, autosave em localStorage)
   - Biblioteca de média (uploads múltiplos, reutilização de ficheiros)
   - Coleções/bundles, Cupões, Reviews, Popups, Editor da Home (secções ordenáveis), Campanhas de email, Afiliados, Compras/Pedidos, Utilizadores (promover/despromover admin), Acessos Mentor 10K, Definições do site, Exportação de dados, Registo de atividade
8. **MENTOR 10K — segunda secção mais detalhada** — camada a camada:
   - Controlo de acesso (tabela de acessos por email/user, RPC, ecrã bloqueado)
   - Layout com separadores e visual dourado
   - Dashboard, Diagnóstico (formulário → geração de perfil), Plano (4 fases / 12 semanas, tarefas semanais, KPIs), Check-in semanal (feedback em 4 frases), Chat com o Mentor, Histórico
   - Camada IA: system prompt completo em português, chamada Gemini com cascata de modelos, modo JSON, tratamento de 429/chave inválida, server functions e como o cliente as invoca
9. **Componentes partilhados** — Header, Footer, Logo, EbookCard, EbookCover, Countdown, i18n (EN por defeito), hook de auth.
10. **Integrações** — Lemon Squeezy (checkout + webhook `order_created` que liberta acesso por email), Google OAuth, storage com URLs assinadas.
11. **Regras de segurança** — nunca servir PDF diretamente, URLs assinadas só após validação no servidor, roles em tabela separada, service role apenas no servidor.
12. **Ordem de construção recomendada** + checklist de aceitação.

## Notas técnicas

- O documento é escrito para ser colado inteiro como prompt; usa linguagem imperativa ("cria...", "implementa...") e inclui excertos de código-chave (system prompt do Mentor, SQL das tabelas e políticas, tipos TypeScript principais).
- Vou ler todos os ficheiros de rotas e componentes e consultar o esquema real da base de dados para que nada seja inventado.
- Estimativa: 2.000+ linhas de markdown. Se ficar demasiado grande para um só ficheiro, divido em `docs/REBUILD-PROMPT.md` (principal) + anexos numerados, mantendo o principal auto-suficiente.

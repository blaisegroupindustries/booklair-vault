# Corrigir a IA e o login com Google no site publicado

## O que se passa

**1. Entrar com Google**
O botão do Google envia a pessoa de volta para o endereço exato onde ela estava (por exemplo a página de um livro ou a área do Mentor 10K). O Google só aceita regressar a endereços simples e aprovados, por isso o regresso falha e sobra apenas o e-mail. Além disso é preciso confirmar que o Google está mesmo ligado nas definições de acesso do site — se não estiver, o botão nunca funciona fora do editor.

**2. A IA do Mentor**
A chave da IA (Gemini) existe no projeto, mas chaves deste tipo só chegam ao site publicado depois de uma nova publicação. Dentro do editor funciona porque a pré-visualização usa a chave logo. Também não existe hoje nenhuma mensagem clara quando a IA falha — a pessoa fica apenas a olhar para o vazio, sem perceber o motivo.

## O que vou fazer

1. Fazer o regresso do Google acontecer sempre pela página de entrada do site, guardando à parte a página onde a pessoa estava e levando-a lá assim que a sessão estiver pronta. Isto passa a funcionar tanto no editor como no site publicado.
2. Ligar/confirmar o Google nas definições de acesso do site.
3. Tratar as falhas da IA: quando a chave não chega ou o serviço recusa, mostrar uma mensagem clara em vez de silêncio, e registar o motivo para eu conseguir diagnosticar.
4. Testar o diagnóstico e a conversa do Mentor depois das correções.
5. No fim, é preciso publicar o site — só a publicação leva a chave da IA para a versão pública. Aviso-te quando estiver pronto para isso.

## Detalhes técnicos

- `src/routes/auth.tsx`: `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" })`; o destino pretendido vai em `sessionStorage`/query param saneado (apenas caminhos internos) e a navegação acontece após confirmação de sessão (`onAuthStateChange`/`getSession`).
- Chamar `supabase--configure_social_auth` com `providers: ["google"]` (mantendo email ativo).
- `src/lib/mentor10k.server.ts`: se `GEMINI_API_KEY` estiver ausente ou a API devolver 401/403/429, devolver erro tipado; UI de `/mentor10k/diagnostico` e `/mentor10k/chat` mostra a mensagem em vez de falhar em silêncio.
- Não há alterações de esquema de base de dados nem de checkout.

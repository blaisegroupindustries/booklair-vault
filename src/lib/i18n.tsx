import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "en" | "pt";

type Dict = Record<string, { pt: string; en: string }>;

const dict: Dict = {
  "nav.home": { pt: "Início", en: "Home" },
  "nav.library": { pt: "Biblioteca", en: "Library" },
  "nav.store": { pt: "Loja", en: "Store" },
  "nav.about": { pt: "Sobre", en: "About" },
  "nav.mentor": { pt: "CEO OS", en: "CEO OS" },
  "nav.profile": { pt: "Perfil", en: "Profile" },
  "nav.signin": { pt: "Entrar", en: "Sign In" },
  "nav.signup": { pt: "Criar conta", en: "Sign Up" },
  "nav.signout": { pt: "Sair", en: "Sign Out" },

  "hero.eyebrow": { pt: "Conhecimento que transforma", en: "Knowledge that transforms" },
  "hero.title": { pt: "Ebooks premium para mentes ambiciosas.", en: "Premium ebooks for ambitious minds." },
  "hero.subtitle": {
    pt: "Marketing, negócios, educação e desenvolvimento pessoal — curados para quem prefere resultados em vez de teoria.",
    en: "Marketing, business, education and personal development — curated for those who prefer results over theory.",
  },
  "hero.cta.primary": { pt: "Explorar a Loja", en: "Explore Store" },
  "hero.cta.secondary": { pt: "Ler Grátis", en: "Read Free" },

  "categories.title": { pt: "Categorias", en: "Categories" },
  "categories.subtitle": { pt: "Encontra o teu próximo passo.", en: "Find your next step." },
  "cat.marketing_negocios": { pt: "Marketing & Negócios", en: "Marketing & Business" },
  "cat.educacao_estudo": { pt: "Educação & Estudo", en: "Education & Study" },
  "cat.desenvolvimento_pessoal": { pt: "Desenvolvimento Pessoal", en: "Personal Development" },

  "featured.title": { pt: "Destaques", en: "Featured" },
  "featured.subtitle": { pt: "O que está a marcar agora.", en: "What's making waves." },

  "library.title": { pt: "Biblioteca Gratuita", en: "Free Library" },
  "library.subtitle": { pt: "Lê online, sem custos. Sem limites.", en: "Read online, no cost. No limits." },
  "library.empty": { pt: "Ainda não há ebooks gratuitos publicados.", en: "No free ebooks published yet." },

  "store.title": { pt: "Loja Premium", en: "Premium Store" },
  "store.subtitle": { pt: "Ebooks exclusivos. Pagas uma vez, ficam teus.", en: "Exclusive ebooks. Pay once, yours forever." },
  "store.empty": { pt: "Em breve novos lançamentos.", en: "New releases coming soon." },

  "ebook.free": { pt: "Grátis", en: "Free" },
  "ebook.premium": { pt: "Premium", en: "Premium" },
  "ebook.read": { pt: "Ler agora", en: "Read Now" },
  "ebook.buy": { pt: "Comprar", en: "Buy Now" },

  "filter.all": { pt: "Todos", en: "All" },
  "filter.free": { pt: "Grátis", en: "Free" },
  "filter.premium": { pt: "Premium", en: "Premium" },

  "home.mentor.banner": { pt: "cria hoje o teu plano personalizado de 90 dias", en: "build your personalized 90-day plan today" },
  "home.access": { pt: "acesso vitalício", en: "lifetime access" },
  "home.curated": { pt: "Cada título é lido, escolhido e curado à mão. Sem subscrições, sem catálogos intermináveis.", en: "Every title is read, chosen and curated by hand. No subscriptions, no endless catalogues." },
  "home.mentor.eyebrow": { pt: "Programa exclusivo", en: "Exclusive program" },
  "home.mentor.body": { pt: "Diagnóstico inteligente, plano de 90 dias construído para ti e um mentor de IA disponível a toda a hora — até aos teus primeiros 10.000€/mês.", en: "An intelligent assessment, a 90-day plan built for you and an AI mentor available around the clock — all the way to your first €10,000/month." },
  "home.mentor.free": { pt: "Começa grátis: cria o diagnóstico e o teu plano antes de decidires. O acesso completo inclui o Zero to CEO.", en: "Start free: complete the assessment and create your plan before deciding. Full access includes Zero to CEO." },
  "home.mentor.cta": { pt: "Ver o programa", en: "View the program" },
  "home.upcoming.title": { pt: "Em catalogação", en: "Coming soon" },
  "home.upcoming.label": { pt: "próximos lançamentos", en: "upcoming releases" },
  "home.upcoming.next": { pt: "A seguir", en: "Up next" },
  "home.category.body": { pt: "Leituras escolhidas para acelerar decisões reais — não teoria de prateleira.", en: "Selected reading to accelerate real decisions — not shelf-bound theory." },
  "home.quote": { pt: "“Comprei um título, li em duas noites e apliquei na semana seguinte. É isso que esperava de uma livraria — não uma subscrição que nunca uso.”", en: "“I bought one title, read it in two nights and applied it the following week. That is what I expect from a bookstore — not a subscription I never use.”" },
  "home.quote.by": { pt: "Marta C. — leitora, Maputo", en: "Marta C. — reader, Maputo" },
  "home.quote.since": { pt: "Cliente desde 2025", en: "Customer since 2025" },
  "home.start": { pt: "Começar", en: "Get started" },
  "home.account.title": { pt: "A tua conta é gratuita. A biblioteca fica contigo.", en: "Your account is free. Your library stays with you." },
  "home.account.body": { pt: "Sem subscrições. Sem letras pequenas. Compras uma vez, é teu para sempre.", en: "No subscriptions. No fine print. Buy once, keep it forever." },
  "home.account.cta": { pt: "Criar conta", en: "Create account" },

  "store.eyebrow": { pt: "Catálogo completo", en: "Complete catalogue" },
  "store.heading": { pt: "Toda a Booklair num só sítio", en: "All of Booklair in one place" },
  "store.body": { pt: "Ebooks gratuitos e premium juntos. Filtra por categoria ou acesso para encontrar o teu próximo livro.", en: "Free and premium ebooks together. Filter by category or access to find your next book." },
  "store.none": { pt: "Nenhum ebook encontrado.", en: "No ebooks found." },
  "library.eyebrow": { pt: "Biblioteca", en: "Library" },
  "library.heading": { pt: "Todos os ebooks", en: "All ebooks" },
  "library.body": { pt: "Um catálogo único com títulos gratuitos e premium claramente identificados.", en: "One catalogue with free and premium titles clearly identified." },

  "mentor.center": { pt: "A tua central de crescimento", en: "Your growth command center" },
  "mentor.tagline": { pt: "Decide melhor. Executa mais depressa. Mede o progresso até aos primeiros 10.000€/mês.", en: "Make better decisions. Execute faster. Track progress toward your first €10,000/month." },
  "mentor.triad": { pt: "Plano · Ação · Progresso", en: "Plan · Action · Progress" },
  "mentor.trial.title": { pt: "Estás na versão de experiência", en: "You are using the trial experience" },
  "mentor.trial.body": { pt: "Faz o diagnóstico, cria o teu plano e conversa com o mentor. O acesso completo inclui check-ins, mentoria ilimitada e o ebook Zero to CEO.", en: "Complete the assessment, create your plan and talk to the mentor. Full access includes check-ins, unlimited mentoring and the Zero to CEO ebook." },
  "mentor.unlock": { pt: "Desbloquear tudo", en: "Unlock everything" },
  "mentor.tab.dashboard": { pt: "Painel", en: "Dashboard" },
  "mentor.tab.diagnostic": { pt: "Diagnóstico", en: "Assessment" },
  "mentor.tab.plan": { pt: "Plano", en: "Plan" },
  "mentor.tab.chat": { pt: "Mentor IA", en: "AI Mentor" },
  "mentor.tab.checkin": { pt: "Check-in", en: "Check-in" },
  "mentor.tab.history": { pt: "Histórico", en: "History" },
  "mentor.loading": { pt: "A carregar…", en: "Loading…" },
  "mentor.lock.title": { pt: "Esta área é do acesso completo", en: "This area requires full access" },
  "mentor.lock.body": { pt: "Já podes usar o diagnóstico, o plano e o mentor. Os check-ins semanais e o histórico de progresso fazem parte do programa completo.", en: "You can already use the assessment, plan and mentor. Weekly check-ins and progress history are part of the full program." },
  "mentor.learn": { pt: "Saber mais", en: "Learn more" },

  "plan.badge": { pt: "Plano de 12 semanas", en: "12-week plan" },
  "plan.timeline": { pt: "O teu roteiro diário", en: "Your daily roadmap" },
  "plan.timeline.body": { pt: "Abre uma semana e executa uma ação por dia. Cada dia termina com um resultado verificável.", en: "Open a week and complete one action per day. Every day ends with a verifiable result." },
  "plan.week": { pt: "Semana", en: "Week" },
  "plan.day": { pt: "Dia", en: "Day" },
  "plan.outcome": { pt: "Resultado esperado", en: "Expected outcome" },
  "plan.minutes": { pt: "min", en: "min" },
  "plan.metrics": { pt: "Métricas a acompanhar", en: "Metrics to track" },
  "plan.checkin": { pt: "Fazer check-in semanal", en: "Complete weekly check-in" },
  "plan.redo": { pt: "Refazer diagnóstico", en: "Redo assessment" },
  "plan.generating": { pt: "O Mentor está a desenhar o teu plano diário…", en: "The Mentor is building your daily plan…" },
  "plan.empty": { pt: "Ainda sem plano", en: "No plan yet" },
  "plan.error": { pt: "Não deu para gerar o plano", en: "The plan could not be generated" },
  "plan.start": { pt: "Começa pelo diagnóstico — geramos um plano diário de 12 semanas à tua medida.", en: "Start with the assessment — we will create a tailored 12-week daily plan." },
  "plan.diagnostic": { pt: "Fazer diagnóstico", en: "Complete assessment" },

  "dashboard.step.diagnostic": { pt: "Diagnóstico inicial", en: "Initial assessment" },
  "dashboard.step.plan": { pt: "Plano de 12 semanas", en: "12-week plan" },
  "dashboard.step.checkin": { pt: "Primeiro check-in", en: "First check-in" },
  "dashboard.plans": { pt: "Planos ativos", en: "Active plans" },
  "dashboard.checkins": { pt: "Check-ins feitos", en: "Check-ins completed" },
  "dashboard.score": { pt: "Último resultado", en: "Latest score" },
  "dashboard.income": { pt: "Última receita", en: "Latest revenue" },
  "dashboard.next": { pt: "Próximos passos", en: "Next steps" },
  "dashboard.sequence": { pt: "Segue a sequência. Sem atalhos.", en: "Follow the sequence. No shortcuts." },
  "dashboard.chat.title": { pt: "Fala com o Mentor IA", en: "Talk to the AI Mentor" },
  "dashboard.chat.body": { pt: "Tira dúvidas, valida ideias e recebe feedback direto.", en: "Ask questions, validate ideas and receive direct feedback." },
  "dashboard.open": { pt: "Abrir", en: "Open" },

  "diagnostic.time": { pt: "5 minutos · plano gratuito", en: "5 minutes · free plan" },
  "diagnostic.title": { pt: "Vamos desenhar a tua rota até aos 10K", en: "Let's map your route to 10K" },
  "diagnostic.intro": { pt: "Escolhe o que mais se aproxima da tua realidade. Podes explicar os detalhes nos campos abertos.", en: "Choose what best reflects your reality. You can add details in the open fields." },
  "diagnostic.goal": { pt: "O teu objetivo (numa frase) *", en: "Your goal (in one sentence) *" },
  "diagnostic.goal.placeholder": { pt: "Ex.: Chegar a 10.000€/mês com consultoria de marketing em 6 meses.", en: "Example: Reach €10,000/month with marketing consulting in 6 months." },
  "diagnostic.now": { pt: "Onde estás agora? *", en: "Where are you now? *" },
  "diagnostic.now.placeholder": { pt: "O que fazes, há quanto tempo e o que já tentaste…", en: "What you do, for how long and what you have already tried…" },
  "diagnostic.revenue": { pt: "Qual é a tua receita mensal atual?", en: "What is your current monthly revenue?" },
  "diagnostic.revenue.options": { pt: "Ainda não faturo|Até 500€|500€–2.000€|2.000€–5.000€|Mais de 5.000€", en: "No revenue yet|Up to €500|€500–€2,000|€2,000–€5,000|Over €5,000" },
  "diagnostic.time.week": { pt: "Quanto tempo podes investir por semana?", en: "How much time can you invest each week?" },
  "diagnostic.time.options": { pt: "Até 5 horas|5–10 horas|10–20 horas|20–30 horas|Tempo inteiro", en: "Up to 5 hours|5–10 hours|10–20 hours|20–30 hours|Full time" },
  "diagnostic.skills": { pt: "As tuas competências principais", en: "Your main skills" },
  "diagnostic.skills.placeholder": { pt: "Ex.: copywriting, vídeo, vendas B2B…", en: "Example: copywriting, video, B2B sales…" },
  "diagnostic.resources": { pt: "Recursos de que dispões", en: "Resources available to you" },
  "diagnostic.resources.placeholder": { pt: "Audiência, capital, ferramentas, rede de contactos…", en: "Audience, capital, tools, network…" },
  "diagnostic.blocks": { pt: "O que te tem bloqueado?", en: "What has been holding you back?" },
  "diagnostic.specific": { pt: "Sê específico.", en: "Be specific." },
  "diagnostic.model": { pt: "Qual é o teu modelo atual?", en: "What is your current model?" },
  "diagnostic.model.options": { pt: "Solo / freelancer|Criador|Agência|E-commerce|Produto digital / SaaS|Outro", en: "Solo / freelancer|Creator|Agency|E-commerce|Digital product / SaaS|Other" },
  "diagnostic.deadline": { pt: "Em quanto tempo queres chegar à meta?", en: "How soon do you want to reach your goal?" },
  "diagnostic.deadline.options": { pt: "90 dias|6 meses|12 meses", en: "90 days|6 months|12 months" },
  "diagnostic.saving": { pt: "A guardar…", en: "Saving…" },
  "diagnostic.submit": { pt: "Gerar plano personalizado", en: "Generate personalized plan" },
  "diagnostic.required": { pt: "Preenche pelo menos o objetivo e a situação atual.", en: "Complete at least your goal and current situation." },
  "diagnostic.saved": { pt: "Diagnóstico guardado. A gerar o teu plano…", en: "Assessment saved. Generating your plan…" },

  "chat.start": { pt: "Começa por uma pergunta. Sê específico.", en: "Start with a question. Be specific." },
  "chat.example": { pt: "Ex.: “Como valido a minha oferta em 7 dias?”", en: "Example: “How do I validate my offer in 7 days?”" },
  "chat.limit": { pt: "Chegaste ao limite das 5 mensagens de experiência. Desbloqueia o programa para mentoria ilimitada, check-ins e histórico.", en: "You have reached the 5-message trial limit. Unlock the program for unlimited mentoring, check-ins and history." },
  "chat.unlock": { pt: "Desbloquear o CEO OS", en: "Unlock CEO OS" },
  "chat.trial": { pt: "Experiência gratuita", en: "Free trial" },
  "chat.remaining": { pt: "mensagens restantes", en: "messages remaining" },
  "chat.placeholder": { pt: "Escreve a tua pergunta…", en: "Write your question…" },

  "checkin.noPlan": { pt: "Sem plano ativo", en: "No active plan" },
  "checkin.noPlan.body": { pt: "O check-in é semanal — precisas primeiro de um plano.", en: "Check-ins are weekly — you need a plan first." },
  "checkin.create": { pt: "Criar plano", en: "Create plan" },
  "checkin.title": { pt: "Check-in semanal", en: "Weekly check-in" },
  "checkin.intro": { pt: "Cinco minutos. Direto ao ponto.", en: "Five minutes. Straight to the point." },
  "checkin.week": { pt: "Semana", en: "Week" },
  "checkin.revenue": { pt: "Receita semanal (€)", en: "Weekly revenue (€)" },
  "checkin.done": { pt: "O que fizeste esta semana? *", en: "What did you complete this week? *" },
  "checkin.done.placeholder": { pt: "Ações concretas. Sem generalidades.", en: "Concrete actions. No generalities." },
  "checkin.blocked": { pt: "O que te bloqueou? *", en: "What blocked you? *" },
  "checkin.focus": { pt: "Próximo foco", en: "Next focus" },
  "checkin.energy": { pt: "Energia", en: "Energy" },
  "checkin.high": { pt: "Alta", en: "High" },
  "checkin.low": { pt: "Baixa", en: "Low" },
  "checkin.analyzing": { pt: "Mentor a analisar…", en: "Mentor is analyzing…" },
  "checkin.submit": { pt: "Submeter check-in", en: "Submit check-in" },
  "checkin.feedback": { pt: "Feedback do Mentor IA", en: "AI Mentor feedback" },
  "checkin.feedback.empty": { pt: "Submete o check-in para receberes feedback direto do mentor.", en: "Submit your check-in to receive direct mentor feedback." },

  "history.empty": { pt: "Ainda não há check-ins registados.", en: "No check-ins recorded yet." },
  "history.total": { pt: "Total de check-ins", en: "Total check-ins" },
  "history.average": { pt: "Resultado médio", en: "Average score" },
  "history.revenue": { pt: "Receita acumulada", en: "Cumulative revenue" },
  "history.done": { pt: "Feito", en: "Completed" },
  "history.block": { pt: "Bloqueio", en: "Blocker" },

  "program.eyebrow": { pt: "O teu próximo nível começa aqui", en: "Your next level starts here" },
  "program.lead": { pt: "O caminho prático e personalizado até aos teus primeiros 10.000€/mês. Diagnóstico, plano diário de 12 semanas e mentor IA — sempre disponível.", en: "The practical, personalized path to your first €10,000/month. Assessment, 12-week daily plan and AI mentor — always available." },
  "program.try": { pt: "Experimentar / já tenho acesso", en: "Try it / I already have access" },
  "program.free": { pt: "Podes fazer o diagnóstico e criar o teu plano gratuitamente. O acesso completo desbloqueia check-ins, histórico e mentoria ilimitada.", en: "You can complete the assessment and create your plan for free. Full access unlocks check-ins, history and unlimited mentoring." },
  "program.chips": { pt: "5 min para começar|Plano diário de 90 dias|Mentor sempre disponível|Zero to CEO incluído", en: "Start in 5 minutes|90-day daily plan|Always-on mentor|Zero to CEO included" },
  "program.bonus": { pt: "Bónus incluído · valor $17,99", en: "Included bonus · $17.99 value" },
  "program.bonus.title": { pt: "Compra o CEO OS. Recebe também o Zero to CEO.", en: "Buy CEO OS. Get Zero to CEO too." },
  "program.bonus.body": { pt: "O livro que transforma a tua forma de pensar como fundador fica automaticamente na tua biblioteca quando o acesso ao programa é confirmado.", en: "The book that transforms how you think as a founder is automatically added to your library when program access is confirmed." },
  "program.receive": { pt: "O que recebes", en: "What you get" },
  "program.everything": { pt: "Tudo o que precisas. Nada do que não precisas.", en: "Everything you need. Nothing you don't." },
  "program.ready": { pt: "Pronto para começar?", en: "Ready to begin?" },
  "program.ready.body": { pt: "O primeiro check-in pode acontecer ainda esta semana.", en: "Your first check-in can happen this week." },
  "program.buy": { pt: "Quero o CEO OS", en: "I want CEO OS" },
  "program.lifetime": { pt: "Inclui acesso vitalício ao Zero to CEO", en: "Includes lifetime access to Zero to CEO" },

  "auth.welcome": { pt: "Bem-vindo de volta", en: "Welcome back" },
  "auth.create": { pt: "Cria a tua conta", en: "Create your account" },
  "auth.signin.body": { pt: "Entra para aceder à tua biblioteca.", en: "Sign in to access your library." },
  "auth.signup.body": { pt: "Acede a ebooks gratuitos e premium.", en: "Access free and premium ebooks." },
  "auth.google": { pt: "Continuar com Google", en: "Continue with Google" },
  "auth.or": { pt: "ou", en: "or" },
  "auth.name": { pt: "Nome", en: "Name" },
  "auth.password": { pt: "Palavra-passe", en: "Password" },
  "auth.noAccount": { pt: "Ainda não tens conta?", en: "Don't have an account?" },
  "auth.hasAccount": { pt: "Já tens conta?", en: "Already have an account?" },
  "auth.created": { pt: "Conta criada! Verifica o teu email.", en: "Account created! Check your email." },
  "auth.returned": { pt: "Bem-vindo de volta!", en: "Welcome back!" },

  "ebook.soon": { pt: "Em breve", en: "Coming soon" },
  "ebook.freeNow": { pt: "Grátis agora", en: "Free now" },

  "about.title": { pt: "Sobre a Booklair", en: "About Booklair" },
  "about.lead": {
    pt: "A Booklair é uma plataforma de conhecimento curada para empreendedores e mentes ambiciosas em todo o mundo.",
    en: "Booklair is a curated knowledge platform for entrepreneurs and ambitious minds worldwide.",
  },

  "footer.tagline": { pt: "A tua biblioteca pessoal de conhecimento.", en: "Your personal library of knowledge." },
  "footer.legal": { pt: "Legal", en: "Legal" },
  "footer.terms": { pt: "Termos & Condições", en: "Terms & Conditions" },
  "footer.privacy": { pt: "Privacidade", en: "Privacy" },
  "footer.about": { pt: "Sobre", en: "About" },
  "footer.rights": { pt: "Todos os direitos reservados.", en: "All rights reserved." },
  "footer.location": { pt: "Global · Est. 2025", en: "Global · Est. 2025" },

  "cta.title": { pt: "Constrói a tua biblioteca de elite.", en: "Build your elite library." },
  "cta.subtitle": {
    pt: "Cria a tua conta gratuita e começa hoje. Sem subscrições. Sem letras pequenas.",
    en: "Create your free account and start today. No subscriptions. No fine print.",
  },
  "cta.button": { pt: "Começar grátis", en: "Get started free" },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("booklair-lang") as Lang | null;
    if (saved === "pt" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("booklair-lang", l);
  };

  const t = (key: string) => dict[key]?.[lang] ?? key;

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({ meta: [{ title: "Termos & Condições — Booklair" }] }),
  component: () => (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-gold mb-3">Legal</p>
      <h1 className="font-serif text-5xl text-foreground">Termos & Condições</h1>
      <div className="mt-10 space-y-5 text-foreground/90 leading-relaxed">
        <p>Bem-vindo à Booklair. Ao usares a nossa plataforma aceitas estes termos.</p>
        <h2 className="font-serif text-2xl mt-8">1. Conta</h2>
        <p>És responsável pela segurança da tua conta e por toda a atividade que ocorre nela.</p>
        <h2 className="font-serif text-2xl mt-8">2. Compras</h2>
        <p>Cada ebook premium é vendido individualmente. O acesso é permanente para a tua conta após pagamento confirmado.</p>
        <h2 className="font-serif text-2xl mt-8">3. Uso permitido</h2>
        <p>Os ebooks são para uso pessoal. Não podes redistribuir, revender ou partilhar publicamente os ficheiros descarregados.</p>
        <h2 className="font-serif text-2xl mt-8">4. Reembolsos</h2>
        <p>Por se tratar de produto digital de entrega imediata, os reembolsos são avaliados caso a caso.</p>
        <p className="mt-10 text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  ),
});

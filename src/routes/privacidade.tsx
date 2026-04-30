import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [{ title: "Privacidade — Booklair" }] }),
  component: () => (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-gold mb-3">Legal</p>
      <h1 className="font-serif text-5xl text-foreground">Política de Privacidade</h1>
      <div className="mt-10 space-y-5 text-foreground/90 leading-relaxed">
        <p>A tua privacidade é importante para nós. Esta política explica que dados recolhemos e porquê.</p>
        <h2 className="font-serif text-2xl mt-8">Dados que recolhemos</h2>
        <p>Email, nome, e histórico de compras. Não partilhamos dados pessoais com terceiros para marketing.</p>
        <h2 className="font-serif text-2xl mt-8">Cookies</h2>
        <p>Usamos cookies essenciais para manter a tua sessão ativa e cookies analíticos para melhorar a plataforma.</p>
        <h2 className="font-serif text-2xl mt-8">Os teus direitos</h2>
        <p>Podes pedir acesso, retificação ou eliminação dos teus dados a qualquer momento.</p>
        <p className="mt-10 text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  ),
});

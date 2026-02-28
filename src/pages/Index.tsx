import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import MeasurementForm from "@/components/MeasurementForm";
import MeasurementList from "@/components/MeasurementList";
import logoTecgrup from "@/assets/logo-tecgrup.png";

const Index = () => {
  const { user, signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-primary text-primary-foreground shadow-md">
        <div className="container flex items-center justify-between h-14 max-w-3xl">
          <div className="flex items-center gap-3">
            <img src={logoTecgrup} alt="TecGrup" className="h-8 w-auto rounded" />
            <span className="font-display font-bold text-lg">Medidas</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs opacity-80 hidden sm:inline">{user?.email}</span>
            <Button size="sm" variant="ghost" onClick={signOut} className="text-primary-foreground hover:bg-primary-foreground/10">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl py-8 space-y-10">
        <section>
          <h1 className="text-3xl font-display font-bold mb-1">Nova Vistoria</h1>
          <p className="text-muted-foreground mb-6">
            Preencha os blocos, anexe fotos e marque as medidas diretamente na imagem.
          </p>
          <MeasurementForm onSaved={() => setRefreshKey((k) => k + 1)} />
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold mb-4">Vistorias Salvas</h2>
          <MeasurementList refreshKey={refreshKey} />
        </section>
      </main>
    </div>
  );
};

export default Index;

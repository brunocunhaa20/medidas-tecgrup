import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Ruler, LogOut } from "lucide-react";
import MeasurementForm from "@/components/MeasurementForm";
import MeasurementList from "@/components/MeasurementList";

const Index = () => {
  const { user, signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-14 max-w-3xl">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary">
              <Ruler className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">MedidaPro</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button size="sm" variant="ghost" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl py-8 space-y-10">
        <section>
          <h1 className="text-3xl font-display font-bold mb-1">Nova medição</h1>
          <p className="text-muted-foreground mb-6">
            Preencha os itens, anexe fotos e marque as medidas diretamente na imagem.
          </p>
          <MeasurementForm onSaved={() => setRefreshKey((k) => k + 1)} />
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold mb-4">Medições salvas</h2>
          <MeasurementList refreshKey={refreshKey} />
        </section>
      </main>
    </div>
  );
};

export default Index;

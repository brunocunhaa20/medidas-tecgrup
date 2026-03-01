import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, List, ChevronLeft } from "lucide-react";
import MeasurementForm from "@/components/MeasurementForm";
import MeasurementList from "@/components/MeasurementList";
import logoTecgrup from "@/assets/logo-tecgrup.png";
import type { MeasurementFormData } from "@/components/blocks/types";

type View = "list" | "new" | "edit" | "view";

const Index = () => {
  const { user, signOut } = useAuth();
  const [view, setView] = useState<View>("new");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editData, setEditData] = useState<{ id: string; formData: MeasurementFormData } | null>(null);

  const handleSaved = () => {
    setRefreshKey((k) => k + 1);
    setView("list");
    setEditData(null);
  };

  const handleEdit = (id: string, formData: MeasurementFormData) => {
    setEditData({ id, formData });
    setView("edit");
  };

  const handleView = (id: string, formData: MeasurementFormData) => {
    setEditData({ id, formData });
    setView("view");
  };

  const userName = user?.email?.split("@")[0] || "Vendedor";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center justify-between h-14 px-3 sm:px-6 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <img src={logoTecgrup} alt="TecGrup" className="h-8 w-auto rounded" />
            <span className="font-display font-bold text-base sm:text-lg">Medidas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-80 hidden sm:inline">Olá, {userName}</span>
            <Button size="sm" variant="ghost" onClick={signOut} className="text-primary-foreground hover:bg-primary-foreground/10">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Welcome bar (mobile) */}
      <div className="sm:hidden px-3 py-2 bg-primary/5 border-b text-sm">
        Olá, <span className="font-semibold">{userName}</span> 👋
      </div>

      {/* Nav tabs */}
      <div className="border-b bg-card sticky top-14 z-30">
        <div className="flex max-w-3xl mx-auto w-full">
          <button
            onClick={() => { setView("new"); setEditData(null); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${view === "new" || view === "edit" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{view === "edit" ? "Editando" : "Novo"}</span>
          </button>
          <button
            onClick={() => { setView("list"); setEditData(null); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${view === "list" || view === "view" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Levantamentos</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6">
        {view === "new" && (
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold mb-1">Novo Levantamento</h1>
            <p className="text-sm text-muted-foreground mb-4">Preencha os blocos de medição.</p>
            <MeasurementForm onSaved={handleSaved} />
          </div>
        )}

        {view === "edit" && editData && (
          <div>
            <button onClick={() => { setView("list"); setEditData(null); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
              <ChevronLeft className="h-4 w-4" /> Voltar à lista
            </button>
            <h1 className="text-xl sm:text-2xl font-display font-bold mb-1">Editar Levantamento</h1>
            <p className="text-sm text-muted-foreground mb-4">Atualize os dados e salve.</p>
            <MeasurementForm onSaved={handleSaved} initialData={{ id: editData.id, formData: editData.formData, title: "" }} />
          </div>
        )}

        {view === "view" && editData && (
          <div>
            <button onClick={() => { setView("list"); setEditData(null); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
              <ChevronLeft className="h-4 w-4" /> Voltar à lista
            </button>
            <h1 className="text-xl sm:text-2xl font-display font-bold mb-1">Visualizar Levantamento</h1>
            <p className="text-sm text-muted-foreground mb-4">Modo somente leitura.</p>
            <div className="pointer-events-none opacity-90">
              <MeasurementForm onSaved={() => {}} initialData={{ id: editData.id, formData: editData.formData, title: "" }} />
            </div>
          </div>
        )}

        {view === "list" && (
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold mb-1">Levantamentos</h1>
            <p className="text-sm text-muted-foreground mb-4">Todos os levantamentos realizados.</p>
            <MeasurementList refreshKey={refreshKey} onEdit={handleEdit} onView={handleView} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

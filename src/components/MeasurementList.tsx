import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Trash2, Eye, Pencil, Calendar, Search, Building2, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";
import type { MeasurementFormData } from "./blocks/types";

interface MeasurementRow {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  rede: string | null;
  bandeira: string | null;
  cnpj: string | null;
  nome_fantasia: string | null;
  gerente_nome: string | null;
}

interface MeasurementListProps {
  refreshKey: number;
  onEdit: (id: string, formData: MeasurementFormData) => void;
  onView: (id: string, formData: MeasurementFormData) => void;
}

const MeasurementList = ({ refreshKey, onEdit, onView }: MeasurementListProps) => {
  const [measurements, setMeasurements] = useState<MeasurementRow[]>([]);
  const [filter, setFilter] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMeasurements = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("measurements")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setMeasurements(data as MeasurementRow[]);
  };

  useEffect(() => { fetchMeasurements(); }, [user, refreshKey]);

  const loadFormData = async (id: string): Promise<MeasurementFormData | null> => {
    const { data } = await supabase.from("measurement_items").select("annotations").eq("measurement_id", id).maybeSingle();
    if (data?.annotations) return data.annotations as unknown as MeasurementFormData;
    return null;
  };

  const handleEdit = async (id: string) => {
    const fd = await loadFormData(id);
    if (fd) onEdit(id, fd);
  };

  const handleView = async (id: string) => {
    const fd = await loadFormData(id);
    if (fd) onView(id, fd);
  };

  const deleteMeasurement = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este levantamento?")) return;
    await supabase.from("measurement_items").delete().eq("measurement_id", id);
    const { error } = await supabase.from("measurements").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      setMeasurements((prev) => prev.filter((m) => m.id !== id));
      toast({ title: "Levantamento excluído" });
    }
  };

  const filtered = measurements.filter(m => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      m.title?.toLowerCase().includes(q) ||
      m.rede?.toLowerCase().includes(q) ||
      m.bandeira?.toLowerCase().includes(q) ||
      m.nome_fantasia?.toLowerCase().includes(q) ||
      m.cnpj?.includes(q)
    );
  });

  if (measurements.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-base">Nenhum levantamento salvo ainda.</p>
        <p className="text-sm mt-1">Crie o primeiro levantamento acima.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrar por rede, bandeira, nome..."
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{m.nome_fantasia || m.title}</h4>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(m.created_at).toLocaleDateString("pt-BR")}
                </span>
                {m.rede && <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium">{m.rede}</span>}
                {m.bandeira && <span>{m.bandeira}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleView(m.id)} title="Visualizar">
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(m.id)} title="Editar">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMeasurement(m.id)} title="Excluir">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Filter className="h-6 w-6 mx-auto mb-2 opacity-30" />
            Nenhum resultado para "{filter}"
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasurementList;

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Trash2, ChevronDown, ChevronUp, Calendar, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Annotation } from "./ImageAnnotator";
import type { Json } from "@/integrations/supabase/types";

interface MeasurementRow {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface ItemRow {
  id: string;
  name: string;
  value: number | null;
  unit: string | null;
  notes: string | null;
  image_url: string | null;
  annotations: Json | null;
}

interface MeasurementListProps {
  refreshKey: number;
}

const MeasurementList = ({ refreshKey }: MeasurementListProps) => {
  const [measurements, setMeasurements] = useState<MeasurementRow[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, ItemRow[]>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMeasurements = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("measurements")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setMeasurements(data);
  };

  useEffect(() => {
    fetchMeasurements();
  }, [user, refreshKey]);

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!items[id]) {
      const { data } = await supabase
        .from("measurement_items")
        .select("*")
        .eq("measurement_id", id);
      if (data) setItems((prev) => ({ ...prev, [id]: data }));
    }
  };

  const deleteMeasurement = async (id: string) => {
    const { error } = await supabase.from("measurements").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      setMeasurements((prev) => prev.filter((m) => m.id !== id));
      toast({ title: "Medição excluída" });
    }
  };

  if (measurements.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Nenhuma medição salva ainda.</p>
        <p className="text-sm mt-1">Crie sua primeira medição acima.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {measurements.map((m) => (
        <Card key={m.id} className="overflow-hidden">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleExpand(m.id)}
          >
            <div className="space-y-1">
              <h4 className="font-display font-semibold">{m.title}</h4>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(m.created_at).toLocaleDateString("pt-BR")}
                </span>
                {m.description && <span>{m.description}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); deleteMeasurement(m.id); }}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {expandedId === m.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>

          {expandedId === m.id && items[m.id] && (
            <CardContent className="border-t bg-muted/20 p-4 space-y-3">
              {items[m.id].map((item, i) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                  <span className="flex items-center justify-center h-6 w-6 rounded bg-primary/10 text-primary text-xs font-mono font-semibold shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      {item.value !== null && (
                        <span className="font-mono text-sm text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {item.value} {item.unit}
                        </span>
                      )}
                    </div>
                    {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
                    {item.image_url && (
                      <div className="relative">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full max-w-sm h-32 object-contain rounded border bg-muted/30"
                        />
                        {item.annotations && Array.isArray(item.annotations) && (item.annotations as unknown as Annotation[]).length > 0 && (
                          <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-mono">
                            {(item.annotations as unknown as Annotation[]).length} marcações
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default MeasurementList;

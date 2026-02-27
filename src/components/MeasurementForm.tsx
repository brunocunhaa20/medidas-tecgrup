import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, Loader2 } from "lucide-react";
import MeasurementItemCard from "./MeasurementItemCard";
import { Annotation } from "./ImageAnnotator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

interface MeasurementItem {
  id: string;
  name: string;
  value: number | null;
  unit: string;
  notes: string;
  image_url: string | null;
  annotations: Annotation[];
}

interface MeasurementFormProps {
  onSaved: () => void;
}

const createEmptyItem = (): MeasurementItem => ({
  id: crypto.randomUUID(),
  name: "",
  value: null,
  unit: "cm",
  notes: "",
  image_url: null,
  annotations: [],
});

const MeasurementForm = ({ onSaved }: MeasurementFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<MeasurementItem[]>([createEmptyItem()]);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const addItem = () => setItems((prev) => [...prev, createEmptyItem()]);

  const updateItem = (index: number, updated: MeasurementItem) => {
    setItems((prev) => prev.map((item, i) => (i === index ? updated : item)));
  };

  const deleteItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!title.trim()) {
      toast({ title: "Preencha o título", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: measurement, error: mError } = await supabase
        .from("measurements")
        .insert({ title, description, user_id: user.id })
        .select()
        .single();

      if (mError) throw mError;

      const itemsToInsert = items.map((item) => ({
        measurement_id: measurement.id,
        user_id: user.id,
        name: item.name || "Sem nome",
        value: item.value,
        unit: item.unit,
        notes: item.notes || null,
        image_url: item.image_url,
        annotations: item.annotations as unknown as Json,
      }));

      const { error: iError } = await supabase
        .from("measurement_items")
        .insert(itemsToInsert);

      if (iError) throw iError;

      toast({ title: "Medidas salvas com sucesso!" });
      setTitle("");
      setDescription("");
      setItems([createEmptyItem()]);
      onSaved();
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Informações gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Título da medição</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Medidas do quarto principal"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição (opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes adicionais..."
              rows={2}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-semibold">Itens de medida</h3>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar item
          </Button>
        </div>

        {items.map((item, i) => (
          <MeasurementItemCard
            key={item.id}
            item={item}
            index={i}
            onUpdate={(updated) => updateItem(i, updated)}
            onDelete={() => deleteItem(i)}
          />
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
        {saving ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...</>
        ) : (
          <><Save className="h-4 w-4 mr-2" /> Salvar medidas</>
        )}
      </Button>
    </div>
  );
};

export default MeasurementForm;

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import ImageAnnotator, { Annotation } from "./ImageAnnotator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface MeasurementItem {
  id: string;
  name: string;
  value: number | null;
  unit: string;
  notes: string;
  image_url: string | null;
  annotations: Annotation[];
}

interface MeasurementItemCardProps {
  item: MeasurementItem;
  index: number;
  onUpdate: (item: MeasurementItem) => void;
  onDelete: () => void;
}

const UNITS = ["cm", "mm", "m", "pol", "pés"];

const MeasurementItemCard = ({ item, index, onUpdate, onDelete }: MeasurementItemCardProps) => {
  const [showAnnotator, setShowAnnotator] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("measurement-images")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("measurement-images")
        .getPublicUrl(path);

      onUpdate({ ...item, image_url: publicUrl });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Card className="animate-fade-in border-border/60 hover:border-primary/30 transition-colors">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start justify-between">
            <span className="flex items-center justify-center h-7 w-7 rounded-md bg-primary/10 text-primary text-sm font-mono font-semibold">
              {index + 1}
            </span>
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nome</Label>
              <Input
                value={item.name}
                onChange={(e) => onUpdate({ ...item, name: e.target.value })}
                placeholder="Ex: Largura"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Valor</Label>
              <Input
                type="number"
                value={item.value ?? ""}
                onChange={(e) => onUpdate({ ...item, value: e.target.value ? Number(e.target.value) : null })}
                placeholder="0"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Unidade</Label>
              <Select value={item.unit} onValueChange={(v) => onUpdate({ ...item, unit: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Observações</Label>
            <Textarea
              value={item.notes}
              onChange={(e) => onUpdate({ ...item, notes: e.target.value })}
              placeholder="Notas adicionais..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Image section */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Imagem</Label>
            {item.image_url ? (
              <div className="relative group rounded-lg overflow-hidden border bg-muted/30">
                <img
                  src={item.image_url}
                  alt={`Medida ${item.name}`}
                  className="w-full h-48 object-contain"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button size="sm" onClick={() => setShowAnnotator(true)}>
                    <Pencil className="h-4 w-4 mr-1" /> Anotar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-1" /> Trocar
                  </Button>
                </div>
                {item.annotations.length > 0 && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-mono">
                    {item.annotations.length} marcações
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                {uploading ? (
                  <span className="text-sm">Enviando...</span>
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm">Clique para adicionar imagem</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {showAnnotator && item.image_url && (
        <ImageAnnotator
          imageUrl={item.image_url}
          annotations={item.annotations}
          onAnnotationsChange={(anns) => onUpdate({ ...item, annotations: anns })}
          onClose={() => setShowAnnotator(false)}
        />
      )}
    </>
  );
};

export default MeasurementItemCard;

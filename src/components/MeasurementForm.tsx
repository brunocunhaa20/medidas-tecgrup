import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Save, Loader2, FormInput } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

import { MeasurementFormData } from "./blocks/types";
import { BlockTesteira } from "./blocks/BlockTesteira";
import { BlockLogoTesteira } from "./blocks/BlockLogoTesteira";

interface MeasurementFormProps {
  onSaved: () => void;
}

const getInitialData = (): MeasurementFormData => ({
  testeira: {
    perimetro: { fotos: [] },
    altura: { fotos: [] },
    observacoes: { materialAtual: "", condicaoGeral: "", iluminacao: "", acabamentos: "", estruturaInterna: "" },
    oQueSeraFeito: { padraoProjeto3D: false, manualMarcaCliente: false, servicoEspecifico: "" },
    aproveitamentoMaterial: { reaproveita: false, observacao: "" }
  },
  logoTesteira: {
    quantidadeLogos: 0,
    posicaoFotos: [],
    comoSeraFornecida: { material: "", iluminacao: "", aproveitamentoMaterial: false, aproveitamentoObservacao: "" }
  },
});

const MeasurementForm = ({ onSaved }: MeasurementFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formData, setFormData] = useState<MeasurementFormData>(getInitialData());
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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

      // Salvamos toda a estrutura do formulário em um único bloco JSON para não quebrar o banco atual
      const itemsToInsert = [{
        measurement_id: measurement.id,
        user_id: user.id,
        name: "Formulário Completo MedidaPro",
        value: null,
        unit: null,
        notes: "Formulário estruturado completo",
        image_url: null,
        annotations: formData as unknown as Json,
      }];

      const { error: iError } = await supabase
        .from("measurement_items")
        .insert(itemsToInsert);

      if (iError) throw iError;

      toast({ title: "Formulário salvo com sucesso!" });
      setTitle("");
      setDescription("");
      setFormData(getInitialData());
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
          <CardTitle className="text-lg font-display">Identificação do Posto/Local</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome do Posto ou Referência</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Auto Posto Bandeirantes"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Detalhes (opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Endereço, contato no local, etc..."
              rows={2}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-display font-semibold flex items-center gap-2">
          <FormInput className="w-5 h-5 text-primary" />
          Blocos de Marcação
        </h3>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {/* Bloco 1 - Testeira */}
          <AccordionItem value="testeira" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline font-display font-semibold text-base py-4">
              Bloco 1 - Testeira
            </AccordionTrigger>
            <AccordionContent>
              <BlockTesteira
                data={formData.testeira}
                onChange={(d) => setFormData(prev => ({ ...prev, testeira: d }))}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Bloco 2 - Logo de Testeira */}
          <AccordionItem value="logo-testeira" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline font-display font-semibold text-base py-4">
              Bloco 2 - Logo de Testeira
            </AccordionTrigger>
            <AccordionContent>
              <BlockLogoTesteira
                data={formData.logoTesteira}
                onChange={(d) => setFormData(prev => ({ ...prev, logoTesteira: d }))}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Blocos futuros (em desenvolvimento) */}
          <AccordionItem value="forro" className="border rounded-lg bg-card px-4 opacity-60">
            <AccordionTrigger className="hover:no-underline font-display font-semibold text-base py-4">
              Bloco 3 - Forro de PVC (Em breve)
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground pt-2">Este bloco está em fase de desenvolvimento.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="colunas" className="border rounded-lg bg-card px-4 opacity-60">
            <AccordionTrigger className="hover:no-underline font-display font-semibold text-base py-4">
              Bloco 4 - Colunas (Em breve)
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground pt-2">Este bloco está em fase de desenvolvimento.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
        {saving ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando Formulario...</>
        ) : (
          <><Save className="h-4 w-4 mr-2" /> Salvar Vistoria</>
        )}
      </Button>
    </div>
  );
};

export default MeasurementForm;

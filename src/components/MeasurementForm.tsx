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
import { BlockForroPVC } from "./blocks/BlockForroPVC";
import { BlockColunas } from "./blocks/BlockColunas";
import { BlockSinalizadores } from "./blocks/BlockSinalizadores";
import { BlockCapasBomba } from "./blocks/BlockCapasBomba";
import { BlockIlha } from "./blocks/BlockIlhas";
import { BlockTotem } from "./blocks/BlockTotem";

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
  forroPVC: { fotos: [], observacoes: "" },
  colunas: { quantidade: 0, colunas: [], condicaoAtualDescricao: "", oQueSeraFeito: { revestimento: false, pintura: false, adesivacao: false } },
  sinalizadores: { quantidade: 0, sinalizadores: [], oQueSeraFeito: { reforma: false, adesivacao: false, novo: false } },
  capasBomba: { quantidadeBombas: 0, capas: [] },
  ilha: { ilhas: [] },
  totemCorp: { possui: false, condicaoAtual: { eletrica: "", pintura: "", baseSolo: "" }, fotosMedidas: [], oQueSeraFeito: "" },
  totemANP: { possui: false, condicaoAtual: { eletrica: "", pintura: "", baseSolo: "" }, fotosMedidas: [], oQueSeraFeito: "" },
  galhardete: { possui: false, condicaoAtual: { eletrica: "", pintura: "", baseSolo: "" }, fotosMedidas: [], oQueSeraFeito: "" }
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
          <CardTitle className="text-lg font-display">Identificação do Posto / Local</CardTitle>
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

          {/* Bloco 3 - Forro PVC */}
          <AccordionItem value="forro" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline font-display font-semibold text-base py-4">
              Bloco 3 - Forro de PVC
            </AccordionTrigger>
            <AccordionContent>
              <BlockForroPVC
                data={formData.forroPVC}
                onChange={(d) => setFormData(prev => ({ ...prev, forroPVC: d }))}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Bloco 4 - Colunas */}
          <AccordionItem value="colunas" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline font-display font-semibold text-base py-4">
              Bloco 4 - Colunas
            </AccordionTrigger>
            <AccordionContent>
              <BlockColunas
                data={formData.colunas}
                onChange={(d) => setFormData(prev => ({ ...prev, colunas: d }))}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Bloco 5 - Sinalizadores de Bomba */}
          <AccordionItem value="sinalizadores" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline font-display font-semibold text-base py-4">
              Bloco 5 - Sinalizadores de Bomba
            </AccordionTrigger>
            <AccordionContent>
              <BlockSinalizadores
                data={formData.sinalizadores}
                onChange={(d) => setFormData(prev => ({ ...prev, sinalizadores: d }))}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Bloco 6 - Capas de Bomba */}
          <AccordionItem value="capas" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline font-display font-semibold text-base py-4">
              Bloco 6 - Capas e Adesivagem de Bomba
            </AccordionTrigger>
            <AccordionContent>
              <BlockCapasBomba
                data={formData.capasBomba}
                onChange={(d) => setFormData(prev => ({ ...prev, capasBomba: d }))}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Bloco 7 - Ilhas de Abastecimento */}
          <AccordionItem value="ilha" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline font-display font-semibold text-base py-4">
              Bloco 7 - Ilhas de Abastecimento
            </AccordionTrigger>
            <AccordionContent>
              <BlockIlha
                data={formData.ilha}
                onChange={(d) => setFormData(prev => ({ ...prev, ilha: d }))}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Blocos 8, 9, 10 - Totens e Galhardetes */}
          <AccordionItem value="totens" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline font-display font-semibold text-base py-4">
              Blocos 8, 9 e 10 - Totens e Identidade Visual (Vertical)
            </AccordionTrigger>
            <AccordionContent className="space-y-8 divide-y divide-border/50">
              <div className="pt-4">
                <BlockTotem
                  tipo="corporativo"
                  data={formData.totemCorp}
                  onChange={(d) => setFormData(prev => ({ ...prev, totemCorp: d }))}
                />
              </div>
              <div className="pt-8 mt-4">
                <BlockTotem
                  tipo="anp"
                  data={formData.totemANP}
                  onChange={(d) => setFormData(prev => ({ ...prev, totemANP: d }))}
                />
              </div>
              <div className="pt-8 mt-4">
                <BlockTotem
                  tipo="galhardete"
                  data={formData.galhardete}
                  onChange={(d) => setFormData(prev => ({ ...prev, galhardete: d }))}
                />
              </div>
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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Save, Loader2, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

import { MeasurementFormData, isBlockFilled } from "./blocks/types";
import { BlockDadosBasicos } from "./blocks/BlockDadosBasicos";
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
  initialData?: { id: string; formData: MeasurementFormData; title: string };
}

const getInitialData = (): MeasurementFormData => ({
  dadosBasicos: { rede: "", bandeira: "", nomeFantasia: "", cnpj: "", gerenteNome: "", gerenteTelefone: "", fotoPosto: [] },
  testeira: {
    perimetro: { fotos: [] }, altura: { fotos: [] },
    observacoes: { materialAtual: "", condicaoGeral: "", iluminacao: "", acabamentos: "", estruturaInterna: "" },
    oQueSeraFeito: { padraoProjeto3D: false, manualMarcaCliente: false, servicoEspecifico: "" },
    aproveitamentoMaterial: { reaproveita: false, observacao: "" }
  },
  logoTesteira: { quantidadeLogos: 0, posicaoFotos: [], comoSeraFornecida: { material: "", iluminacao: "", aproveitamentoMaterial: false, aproveitamentoObservacao: "" } },
  forroPVC: { fotos: [], observacoes: "" },
  colunas: { quantidade: 0, colunas: [], condicaoAtualDescricao: "", oQueSeraFeito: { revestimento: false, pintura: false, adesivacao: false } },
  sinalizadores: { quantidade: 0, sinalizadores: [], oQueSeraFeito: { reforma: false, adesivacao: false, novo: false } },
  capasBomba: { quantidadeBombas: 0, capas: [] },
  ilha: { ilhas: [] },
  totemCorp: { possui: false, condicaoAtual: { eletrica: "", pintura: "", baseSolo: "" }, fotosMedidas: [], oQueSeraFeito: "" },
  totemANP: { possui: false, condicaoAtual: { eletrica: "", pintura: "", baseSolo: "" }, fotosMedidas: [], oQueSeraFeito: "" },
  galhardete: { possui: false, condicaoAtual: { eletrica: "", pintura: "", baseSolo: "" }, fotosMedidas: [], oQueSeraFeito: "" }
});

const MeasurementForm = ({ onSaved, initialData }: MeasurementFormProps) => {
  const [formData, setFormData] = useState<MeasurementFormData>(initialData?.formData || getInitialData());
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const isEditing = !!initialData;

  const handleSave = async () => {
    if (!user) return;
    const db = formData.dadosBasicos;
    if (!db.nomeFantasia.trim()) { toast({ title: "Preencha o Nome Fantasia", variant: "destructive" }); return; }
    if (!db.cnpj.trim()) { toast({ title: "Preencha o CNPJ", variant: "destructive" }); return; }
    if (!db.gerenteNome.trim()) { toast({ title: "Preencha o nome do Gerente", variant: "destructive" }); return; }
    if (!db.gerenteTelefone.trim()) { toast({ title: "Preencha o telefone do Gerente", variant: "destructive" }); return; }

    setSaving(true);
    try {
      if (isEditing && initialData) {
        // Update existing
        const { error: mError } = await supabase.from("measurements").update({
          title: db.nomeFantasia,
          description: db.bandeira || null,
          rede: db.rede,
          bandeira: db.bandeira,
          cnpj: db.cnpj,
          nome_fantasia: db.nomeFantasia,
          gerente_nome: db.gerenteNome,
          gerente_telefone: db.gerenteTelefone,
        }).eq("id", initialData.id);
        if (mError) throw mError;

        const { error: iError } = await supabase.from("measurement_items").update({
          annotations: formData as unknown as Json,
        }).eq("measurement_id", initialData.id);
        if (iError) throw iError;

        toast({ title: "Levantamento atualizado!" });
      } else {
        // Create new
        const { data: measurement, error: mError } = await supabase.from("measurements").insert({
          title: db.nomeFantasia,
          description: db.bandeira || null,
          user_id: user.id,
          rede: db.rede,
          bandeira: db.bandeira,
          cnpj: db.cnpj,
          nome_fantasia: db.nomeFantasia,
          gerente_nome: db.gerenteNome,
          gerente_telefone: db.gerenteTelefone,
        }).select().single();
        if (mError) throw mError;

        const { error: iError } = await supabase.from("measurement_items").insert({
          measurement_id: measurement.id,
          user_id: user.id,
          name: "Formulário Completo",
          annotations: formData as unknown as Json,
        });
        if (iError) throw iError;

        toast({ title: "Levantamento salvo com sucesso!" });
        setFormData(getInitialData());
      }
      onSaved();
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const StatusIcon = ({ filled }: { filled: boolean }) => filled
    ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
    : <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />;

  const blocks: { key: string; label: string; filled: boolean; content: React.ReactNode }[] = [
    { key: "dados", label: "Dados Básicos", filled: isBlockFilled(formData.dadosBasicos), content: <BlockDadosBasicos data={formData.dadosBasicos} onChange={(d) => setFormData(prev => ({ ...prev, dadosBasicos: d }))} /> },
    { key: "testeira", label: "Testeira", filled: isBlockFilled(formData.testeira), content: <BlockTesteira data={formData.testeira} onChange={(d) => setFormData(prev => ({ ...prev, testeira: d }))} /> },
    { key: "logo", label: "Logo de Testeira", filled: isBlockFilled(formData.logoTesteira), content: <BlockLogoTesteira data={formData.logoTesteira} onChange={(d) => setFormData(prev => ({ ...prev, logoTesteira: d }))} /> },
    { key: "forro", label: "Forro de PVC", filled: isBlockFilled(formData.forroPVC), content: <BlockForroPVC data={formData.forroPVC} onChange={(d) => setFormData(prev => ({ ...prev, forroPVC: d }))} /> },
    { key: "colunas", label: "Colunas", filled: isBlockFilled(formData.colunas), content: <BlockColunas data={formData.colunas} onChange={(d) => setFormData(prev => ({ ...prev, colunas: d }))} /> },
    { key: "sinalizadores", label: "Sinalizadores de Bomba", filled: isBlockFilled(formData.sinalizadores), content: <BlockSinalizadores data={formData.sinalizadores} onChange={(d) => setFormData(prev => ({ ...prev, sinalizadores: d }))} /> },
    { key: "capas", label: "Capas de Bomba", filled: isBlockFilled(formData.capasBomba), content: <BlockCapasBomba data={formData.capasBomba} onChange={(d) => setFormData(prev => ({ ...prev, capasBomba: d }))} /> },
    { key: "ilha", label: "Ilhas de Abastecimento", filled: isBlockFilled(formData.ilha), content: <BlockIlha data={formData.ilha} onChange={(d) => setFormData(prev => ({ ...prev, ilha: d }))} /> },
    { key: "totemCorp", label: "Totem Corporativo", filled: isBlockFilled(formData.totemCorp), content: <BlockTotem tipo="corporativo" data={formData.totemCorp} onChange={(d) => setFormData(prev => ({ ...prev, totemCorp: d }))} /> },
    { key: "totemANP", label: "Totem ANP", filled: isBlockFilled(formData.totemANP), content: <BlockTotem tipo="anp" data={formData.totemANP} onChange={(d) => setFormData(prev => ({ ...prev, totemANP: d }))} /> },
    { key: "galhardete", label: "Galhardete", filled: isBlockFilled(formData.galhardete), content: <BlockTotem tipo="galhardete" data={formData.galhardete} onChange={(d) => setFormData(prev => ({ ...prev, galhardete: d }))} /> },
  ];

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full space-y-2">
        {blocks.map((block, i) => (
          <AccordionItem key={block.key} value={block.key} className="border rounded-lg bg-card px-3 sm:px-4">
            <AccordionTrigger className="hover:no-underline font-display font-semibold text-sm sm:text-base py-3 gap-2">
              <div className="flex items-center gap-2 text-left flex-1 min-w-0">
                <StatusIcon filled={block.filled} />
                <span className="truncate">{i > 0 ? `Bloco ${i} – ` : ""}{block.label}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {block.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
        {saving ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...</>
        ) : (
          <><Save className="h-4 w-4 mr-2" /> {isEditing ? "Atualizar Levantamento" : "Salvar Levantamento"}</>
        )}
      </Button>
    </div>
  );
};

export default MeasurementForm;

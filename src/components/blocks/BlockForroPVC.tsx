import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadList } from "./ImageUploadList";
import { BlocoForroPVCData } from "./types";
import { AlertCircle } from "lucide-react";

interface BlockForroPVCProps {
    data: BlocoForroPVCData;
    onChange: (data: BlocoForroPVCData) => void;
}

export const BlockForroPVC = ({ data, onChange }: BlockForroPVCProps) => {
    return (
        <div className="space-y-6 pt-2">
            <div className="bg-amber-100 dark:bg-amber-900/30 border-l-4 border-amber-500 p-4 rounded-r-md flex gap-3 text-amber-900 dark:text-amber-200">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">
                    Observação Fixa: Tudo que envolver parte elétrica, verificar com o gerente o estado de funcionamento.
                </p>
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-primary">Fotos e Medidas do Forro</h4>
                <div className="border rounded-lg p-3 bg-muted/20">
                    <ImageUploadList
                        label="Anexar Fotos (Forro e Iluminação de pista)"
                        images={data.fotos}
                        onChange={(fotos) => onChange({ ...data, fotos })}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-primary">Detalhes e Condições</h4>
                <div className="space-y-1.5 p-4 border rounded-lg bg-muted/10">
                    <Label>Observações sobre forro e iluminação da pista</Label>
                    <Textarea
                        value={data.observacoes}
                        onChange={(e) => onChange({ ...data, observacoes: e.target.value })}
                        placeholder="Descreva o estado das placas de PVC, funcionamento das lâmpadas e estrutura visível..."
                        rows={4}
                    />
                </div>
            </div>
        </div>
    );
};

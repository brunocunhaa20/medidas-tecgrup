import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { ImageUploadList } from "./ImageUploadList";
import { BlocoIlhaData, IlhaEspecficaData } from "./types";

interface BlockIlhaProps {
    data: BlocoIlhaData;
    onChange: (data: BlocoIlhaData) => void;
}

const createEmptyIlha = (index: number): IlhaEspecficaData => ({
    id: crypto.randomUUID(),
    nome: `Ilha ${index + 1}`,
    fotosMedidas: [],
    observacoes: ""
});

export const BlockIlha = ({ data, onChange }: BlockIlhaProps) => {
    const handleAddIlha = () => {
        const novasIlhas = [...(data.ilhas || []), createEmptyIlha((data.ilhas || []).length)];
        onChange({ ilhas: novasIlhas });
    };

    const handleRemoveIlha = (idToRemove: string) => {
        const novasIlhas = (data.ilhas || []).filter(i => i.id !== idToRemove);
        onChange({ ilhas: novasIlhas });
    };

    const updateIlha = (index: number, ilhaData: Partial<IlhaEspecficaData>) => {
        const novasIlhas = [...(data.ilhas || [])];
        novasIlhas[index] = { ...novasIlhas[index], ...ilhaData };
        onChange({ ilhas: novasIlhas });
    };

    return (
        <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1.5 flex-1 max-w-[200px]">
                    <Label className="font-semibold text-lg">Ilhas de Abastecimento</Label>
                    <p className="text-xs text-muted-foreground">Registre cada ilha separadamente</p>
                </div>
                <Button onClick={handleAddIlha} size="sm" variant="default" className="mt-2">
                    <Plus className="w-4 h-4 mr-1" /> Adicionar Ilha
                </Button>
            </div>

            {(data.ilhas || []).map((ilha, index) => (
                <div key={ilha.id} className="p-4 border border-primary/20 bg-card rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold font-display text-primary">{ilha.nome}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveIlha(ilha.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4 mr-1" /> Remover
                        </Button>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <ImageUploadList
                                label="Fotos da Ilha COM MEDIDAS"
                                images={ilha.fotosMedidas}
                                onChange={(fotos) => updateIlha(index, { fotosMedidas: fotos })}
                            />
                        </div>

                        <div className="space-y-1.5 pt-7">
                            <Label>Observações sobre a {ilha.nome}</Label>
                            <Textarea
                                value={ilha.observacoes}
                                onChange={(e) => updateIlha(index, { observacoes: e.target.value })}
                                placeholder="Detalhes ou problemas encontrados..."
                                rows={4}
                            />
                        </div>
                    </div>
                </div>
            ))}

            {(!data.ilhas || data.ilhas.length === 0) && (
                <div className="text-center py-6 border-2 border-dashed rounded bg-muted/5 text-muted-foreground text-sm">
                    Nenhuma ilha cadastrada. Adicione a primeira clicando no botão acima.
                </div>
            )}
        </div>
    );
};

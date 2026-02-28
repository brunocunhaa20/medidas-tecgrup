import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { ImageUploadList } from "./ImageUploadList";
import { BlocoCapasBombaData, CapaBombaEspecficaData } from "./types";

interface BlockCapasBombaProps {
    data: BlocoCapasBombaData;
    onChange: (data: BlocoCapasBombaData) => void;
}

const createEmptyCapa = (index: number): CapaBombaEspecficaData => ({
    id: crypto.randomUUID(),
    nome: `Capa / Bomba ${index + 1}`,
    fotosMedidas: [],
    fotosAdesivos: [],
    observacoes: ""
});

export const BlockCapasBomba = ({ data, onChange }: BlockCapasBombaProps) => {
    const handleAddCapa = () => {
        const novasCapas = [...data.capas, createEmptyCapa(data.capas.length)];
        onChange({ ...data, capas: novasCapas, quantidadeBombas: novasCapas.length });
    };

    const handleRemoveCapa = (idToRemove: string) => {
        const novasCapas = data.capas.filter(c => c.id !== idToRemove);
        onChange({ ...data, capas: novasCapas, quantidadeBombas: novasCapas.length });
    };

    const updateCapa = (index: number, capData: Partial<CapaBombaEspecficaData>) => {
        const novasCapas = [...data.capas];
        novasCapas[index] = { ...novasCapas[index], ...capData };
        onChange({ ...data, capas: novasCapas });
    };

    return (
        <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1.5 flex-1 max-w-[200px]">
                    <Label>Qtd. Bombas Cadastradas</Label>
                    <Input type="number" value={data.quantidadeBombas} readOnly className="bg-muted cursor-not-allowed" />
                    <p className="text-[10px] text-muted-foreground mt-1 text-primary animate-pulse">
                        * Lembre-se: Geralmente são 2 capas por bomba
                    </p>
                </div>
                <Button onClick={handleAddCapa} size="sm" variant="outline" className="mt-6 border-primary/50 hover:bg-primary/10">
                    <Plus className="w-4 h-4 mr-1" /> Adicionar Bomba
                </Button>
            </div>

            {data.capas.map((capa, index) => (
                <div key={capa.id} className="p-4 border border-border rounded-xl bg-card shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 mb-2">
                        <span className="font-semibold font-display text-primary text-lg">{capa.nome}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveCapa(capa.id)} className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4 mr-1" /> Remover
                        </Button>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2 p-3 bg-muted/20 rounded-lg border">
                            <ImageUploadList
                                label="Fotos da Bomba COM MEDIDAS"
                                images={capa.fotosMedidas}
                                onChange={(fotos) => updateCapa(index, { fotosMedidas: fotos })}
                            />
                        </div>
                        <div className="space-y-2 p-3 bg-muted/20 rounded-lg border">
                            <ImageUploadList
                                label="Fotos dos adesivos de produtos"
                                images={capa.fotosAdesivos}
                                onChange={(fotos) => updateCapa(index, { fotosAdesivos: fotos })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Observações adicionais da {capa.nome}</Label>
                        <Textarea
                            value={capa.observacoes}
                            onChange={(e) => updateCapa(index, { observacoes: e.target.value })}
                            placeholder="Estado da capa de inox, defeitos na pintura..."
                            rows={2}
                        />
                    </div>
                </div>
            ))}

            {data.quantidadeBombas === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground">
                    Nenhuma bomba cadastrada no momento. Clique no botão acima para adicionar.
                </div>
            )}
        </div>
    );
};

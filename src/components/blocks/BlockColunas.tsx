import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { ImageUploadList } from "./ImageUploadList";
import { BlocoColunasData, ColunaEspecficaData } from "./types";

interface BlockColunasProps {
    data: BlocoColunasData;
    onChange: (data: BlocoColunasData) => void;
}

const createEmptyColuna = (index: number): ColunaEspecficaData => ({
    id: crypto.randomUUID(),
    nome: `Coluna ${index + 1}`,
    medidasFotos: [],
    itensExistentes: { dutosEletricos: false, dutosEscoamento: false, torneiras: false, itensSobressalentes: false },
    observacao: "",
    fotosAdicionais: []
});

export const BlockColunas = ({ data, onChange }: BlockColunasProps) => {
    const handleAddColuna = () => {
        const novasColunas = [...data.colunas, createEmptyColuna(data.colunas.length)];
        onChange({ ...data, colunas: novasColunas, quantidade: novasColunas.length });
    };

    const handleRemoveColuna = (idToRemove: string) => {
        const novasColunas = data.colunas.filter(c => c.id !== idToRemove);
        onChange({ ...data, colunas: novasColunas, quantidade: novasColunas.length });
    };

    const updateColuna = (index: number, colData: Partial<ColunaEspecficaData>) => {
        const novasColunas = [...data.colunas];
        novasColunas[index] = { ...novasColunas[index], ...colData };
        onChange({ ...data, colunas: novasColunas });
    };

    return (
        <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
                <div className="space-y-1.5 flex-1 max-w-[200px]">
                    <Label>Qtd. de Colunas</Label>
                    <Input type="number" value={data.quantidade} readOnly className="bg-muted cursor-not-allowed" />
                </div>
                <Button onClick={handleAddColuna} size="sm" variant="outline" className="mt-6">
                    <Plus className="w-4 h-4 mr-1" /> Adicionar Coluna
                </Button>
            </div>

            {data.colunas.map((coluna, index) => (
                <div key={coluna.id} className="p-4 border border-primary/20 bg-primary/5 rounded-lg space-y-4 animate-fade-in relative pt-10">
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between bg-primary/10 px-4 py-2 rounded-t-lg">
                        <span className="font-semibold font-display text-primary">{coluna.nome}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveColuna(coluna.id)} className="h-6 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 pt-2">
                        <div className="space-y-4">
                            <h5 className="font-medium text-sm">Fotos de Medidas</h5>
                            <p className="text-xs text-muted-foreground">Marque na foto: altura, largura e espessura</p>
                            <ImageUploadList
                                label=""
                                images={coluna.medidasFotos}
                                onChange={(fotos) => updateColuna(index, { medidasFotos: fotos })}
                            />
                        </div>

                        <div className="space-y-4">
                            <h5 className="font-medium text-sm">Itens Existentes na Coluna</h5>
                            <div className="space-y-3 p-3 border opacity-90 rounded-md bg-background">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`eletricos-${coluna.id}`}
                                        checked={coluna.itensExistentes.dutosEletricos}
                                        onCheckedChange={(c) => updateColuna(index, { itensExistentes: { ...coluna.itensExistentes, dutosEletricos: !!c } })}
                                    />
                                    <Label htmlFor={`eletricos-${coluna.id}`}>Dutos elétricos</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`escoamento-${coluna.id}`}
                                        checked={coluna.itensExistentes.dutosEscoamento}
                                        onCheckedChange={(c) => updateColuna(index, { itensExistentes: { ...coluna.itensExistentes, dutosEscoamento: !!c } })}
                                    />
                                    <Label htmlFor={`escoamento-${coluna.id}`}>Dutos de escoamento</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`torneiras-${coluna.id}`}
                                        checked={coluna.itensExistentes.torneiras}
                                        onCheckedChange={(c) => updateColuna(index, { itensExistentes: { ...coluna.itensExistentes, torneiras: !!c } })}
                                    />
                                    <Label htmlFor={`torneiras-${coluna.id}`}>Torneiras</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`sobra-${coluna.id}`}
                                        checked={coluna.itensExistentes.itensSobressalentes}
                                        onCheckedChange={(c) => updateColuna(index, { itensExistentes: { ...coluna.itensExistentes, itensSobressalentes: !!c } })}
                                    />
                                    <Label htmlFor={`sobra-${coluna.id}`}>Itens sobressalentes</Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 border-t border-primary/10 pt-4">
                        <Label>Observações sobre a {coluna.nome}</Label>
                        <Textarea
                            value={coluna.observacao}
                            onChange={(e) => updateColuna(index, { observacao: e.target.value })}
                            placeholder="Descreva detalhes ou anomalias encontradas..."
                            rows={2}
                        />
                        <div className="pt-2">
                            <ImageUploadList
                                label="Fotos Adicionais (Opcional)"
                                images={coluna.fotosAdicionais}
                                onChange={(fotos) => updateColuna(index, { fotosAdicionais: fotos })}
                            />
                        </div>
                    </div>
                </div>
            ))}

            {data.quantidade > 0 && (
                <div className="space-y-6 pt-4 border-t-2">
                    <div className="space-y-2">
                        <h4 className="font-medium text-primary">Resumo das Colunas</h4>
                        <Label>Descreva a condição atual geral</Label>
                        <Textarea
                            value={data.condicaoAtualDescricao}
                            onChange={(e) => onChange({ ...data, condicaoAtualDescricao: e.target.value })}
                            placeholder="Ex: No geral, as colunas apresentam ferrugem na base e..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="font-medium text-primary">O que será feito em TODAS as colunas?</Label>
                        <div className="flex gap-4 flex-wrap bg-muted/20 p-4 border rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="revestimento"
                                    checked={data.oQueSeraFeito.revestimento}
                                    onCheckedChange={(c) => onChange({ ...data, oQueSeraFeito: { ...data.oQueSeraFeito, revestimento: !!c } })}
                                />
                                <Label htmlFor="revestimento">Revestimento</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="pintura"
                                    checked={data.oQueSeraFeito.pintura}
                                    onCheckedChange={(c) => onChange({ ...data, oQueSeraFeito: { ...data.oQueSeraFeito, pintura: !!c } })}
                                />
                                <Label htmlFor="pintura">Pintura</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="adesivacao"
                                    checked={data.oQueSeraFeito.adesivacao}
                                    onCheckedChange={(c) => onChange({ ...data, oQueSeraFeito: { ...data.oQueSeraFeito, adesivacao: !!c } })}
                                />
                                <Label htmlFor="adesivacao">Adesivação</Label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

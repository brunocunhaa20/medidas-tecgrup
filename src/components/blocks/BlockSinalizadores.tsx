import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowDownUp } from "lucide-react";
import { ImageUploadList } from "./ImageUploadList";
import { BlocoSinalizadoresData, SinalizadorEspecficoData, SinalizadorProduto } from "./types";

interface BlockSinalizadoresProps {
    data: BlocoSinalizadoresData;
    onChange: (data: BlocoSinalizadoresData) => void;
}

const NOME_COMBUSTIVEIS: SinalizadorProduto[] = [
    { id: "gas-comum", nome: "Gasolina Comum" },
    { id: "gas-aditi", nome: "Gasolina Aditivada" },
    { id: "etanol", nome: "Etanol" },
    { id: "diesel-s10", nome: "Diesel S10" },
    { id: "diesel-s500", nome: "Diesel S500" },
];

const createEmptySinalizador = (index: number): SinalizadorEspecficoData => ({
    id: crypto.randomUUID(),
    nome: `Sinalizador ${index + 1}`,
    condicaoAtual: "",
    fotosCondicao: [],
    observacaoCondicao: "",
    dimensoes: { altura: "", largura: "", profundidade: "", fotosMarcadas: [] },
    tipoBomba: "simples",
    blocoSuperior: [],
    blocoInferior: []
});

export const BlockSinalizadores = ({ data, onChange }: BlockSinalizadoresProps) => {
    const handleAddSinalizador = () => {
        const novosSinalizadores = [...data.sinalizadores, createEmptySinalizador(data.sinalizadores.length)];
        onChange({ ...data, sinalizadores: novosSinalizadores, quantidade: novosSinalizadores.length });
    };

    const handleRemoveSinalizador = (idToRemove: string) => {
        const novosSinalizadores = data.sinalizadores.filter(s => s.id !== idToRemove);
        onChange({ ...data, sinalizadores: novosSinalizadores, quantidade: novosSinalizadores.length });
    };

    const updateSinalizador = (index: number, sinData: Partial<SinalizadorEspecficoData>) => {
        const novosSinalizadores = [...data.sinalizadores];
        novosSinalizadores[index] = { ...novosSinalizadores[index], ...sinData };
        onChange({ ...data, sinalizadores: novosSinalizadores });
    };

    const addCombustivel = (sinIndex: number, bloco: "superior" | "inferior", max: number = 5) => {
        const sinalizador = data.sinalizadores[sinIndex];
        if (bloco === "superior" && sinalizador.blocoSuperior.length < max) {
            const novos = [...sinalizador.blocoSuperior, { id: crypto.randomUUID(), nome: "" }];
            if (sinalizador.tipoBomba === "simples") {
                updateSinalizador(sinIndex, { blocoSuperior: novos, blocoInferior: [...novos] });
            } else {
                updateSinalizador(sinIndex, { blocoSuperior: novos });
            }
        } else if (bloco === "inferior" && sinalizador.blocoInferior.length < max) {
            updateSinalizador(sinIndex, { blocoInferior: [...sinalizador.blocoInferior, { id: crypto.randomUUID(), nome: "" }] });
        }
    };

    const updateCombustivel = (sinIndex: number, bloco: "superior" | "inferior", prodIndex: number, novoId: string) => {
        const sinalizador = data.sinalizadores[sinIndex];
        const itemNome = NOME_COMBUSTIVEIS.find(c => c.id === novoId)?.nome || "Outro";

        if (bloco === "superior") {
            const novosSup = [...sinalizador.blocoSuperior];
            novosSup[prodIndex] = { id: novoId, nome: itemNome };

            if (sinalizador.tipoBomba === "simples") {
                updateSinalizador(sinIndex, { blocoSuperior: novosSup, blocoInferior: [...novosSup] });
            } else {
                updateSinalizador(sinIndex, { blocoSuperior: novosSup });
            }
        } else {
            const novosInf = [...sinalizador.blocoInferior];
            novosInf[prodIndex] = { id: novoId, nome: itemNome };
            updateSinalizador(sinIndex, { blocoInferior: novosInf });
        }
    };

    const removeCombustivel = (sinIndex: number, bloco: "superior" | "inferior", prodIndex: number) => {
        const sinalizador = data.sinalizadores[sinIndex];
        if (bloco === "superior") {
            const novosSup = sinalizador.blocoSuperior.filter((_, i) => i !== prodIndex);
            if (sinalizador.tipoBomba === "simples") {
                updateSinalizador(sinIndex, { blocoSuperior: novosSup, blocoInferior: [...novosSup] });
            } else {
                updateSinalizador(sinIndex, { blocoSuperior: novosSup });
            }
        } else {
            const novosInf = sinalizador.blocoInferior.filter((_, i) => i !== prodIndex);
            updateSinalizador(sinIndex, { blocoInferior: novosInf });
        }
    };

    return (
        <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1.5 flex-1 max-w-[200px]">
                    <Label>Qtd. Sinalizadores</Label>
                    <Input type="number" value={data.quantidade} readOnly className="bg-muted cursor-not-allowed" />
                </div>
                <Button onClick={handleAddSinalizador} size="sm" variant="default" className="mt-6">
                    <Plus className="w-4 h-4 mr-1" /> Adicionar Sinalizador
                </Button>
            </div>

            {data.sinalizadores.map((sinalizador, index) => (
                <div key={sinalizador.id} className="border border-border rounded-xl shadow-sm bg-card overflow-hidden">
                    <div className="flex items-center justify-between bg-muted/40 px-4 py-3 border-b">
                        <h4 className="font-semibold text-lg font-display text-primary">{sinalizador.nome}</h4>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveSinalizador(sinalizador.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" /> Remover
                        </Button>
                    </div>

                    <div className="p-4 space-y-6">
                        {/* Secao Dimensões */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 bg-muted/10 p-4 border rounded-lg">
                            <div className="space-y-1.5">
                                <Label>Altura</Label>
                                <Input value={sinalizador.dimensoes.altura} onChange={(e) => updateSinalizador(index, { dimensoes: { ...sinalizador.dimensoes, altura: e.target.value } })} placeholder="cm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Largura</Label>
                                <Input value={sinalizador.dimensoes.largura} onChange={(e) => updateSinalizador(index, { dimensoes: { ...sinalizador.dimensoes, largura: e.target.value } })} placeholder="cm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Profundidade</Label>
                                <Input value={sinalizador.dimensoes.profundidade} onChange={(e) => updateSinalizador(index, { dimensoes: { ...sinalizador.dimensoes, profundidade: e.target.value } })} placeholder="cm" />
                            </div>
                            <div className="col-span-full">
                                <ImageUploadList label="Fotos com dimensões" images={sinalizador.dimensoes.fotosMarcadas} onChange={(fotos) => updateSinalizador(index, { dimensoes: { ...sinalizador.dimensoes, fotosMarcadas: fotos } })} />
                            </div>
                        </div>

                        {/* Secao Condição */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label>Condição Atual</Label>
                                    <Select value={sinalizador.condicaoAtual} onValueChange={(v) => updateSinalizador(index, { condicaoAtual: v })}>
                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bom">Bom Estado</SelectItem>
                                            <SelectItem value="amassado">Amassado / Danificado</SelectItem>
                                            <SelectItem value="ferrugem">Com Ferrugem</SelectItem>
                                            <SelectItem value="trocar">Necessita Troca</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Observação Condição</Label>
                                    <Textarea value={sinalizador.observacaoCondicao} onChange={(e) => updateSinalizador(index, { observacaoCondicao: e.target.value })} rows={3} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <ImageUploadList label="Fotos da Condição Atual" images={sinalizador.fotosCondicao} onChange={(fotos) => updateSinalizador(index, { fotosCondicao: fotos })} />
                            </div>
                        </div>

                        {/* Secao Organização Bomba */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-primary">Organização dos Produtos</h4>
                                    <p className="text-sm text-muted-foreground">Adicione até 5 combustíveis por lado</p>
                                </div>
                                <div className="flex items-center space-x-2 bg-muted p-1.5 rounded-lg border">
                                    <Button
                                        size="sm"
                                        variant={sinalizador.tipoBomba === "simples" ? "default" : "ghost"}
                                        onClick={() => updateSinalizador(index, { tipoBomba: "simples", blocoInferior: [...sinalizador.blocoSuperior] })}
                                    >
                                        Bomba Simples
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={sinalizador.tipoBomba === "invertida" ? "default" : "ghost"}
                                        onClick={() => updateSinalizador(index, { tipoBomba: "invertida" })}
                                    >
                                        <ArrowDownUp className="w-4 h-4 mr-1" />
                                        Invertida
                                    </Button>
                                </div>
                            </div>

                            {/* Lado Superior */}
                            <div className="space-y-2 p-3 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="font-bold">Lado Frontal (Superior)</Label>
                                    <Button size="sm" variant="outline" onClick={() => addCombustivel(index, "superior")} disabled={sinalizador.blocoSuperior.length >= 5} className="h-7 text-xs">
                                        + Produto
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {sinalizador.blocoSuperior.length === 0 && <span className="text-xs text-muted-foreground italic">Nenhum produto adicionado</span>}
                                    {sinalizador.blocoSuperior.map((prod, pIdx) => (
                                        <div key={pIdx} className="flex flex-col gap-1 p-2 bg-card border rounded-md min-w-[140px]">
                                            <span className="text-[10px] font-mono text-muted-foreground">Slot {pIdx + 1}</span>
                                            <Select value={prod.id} onValueChange={(val) => updateCombustivel(index, "superior", pIdx, val)}>
                                                <SelectTrigger className="h-8"><SelectValue placeholder="Produto" /></SelectTrigger>
                                                <SelectContent>
                                                    {NOME_COMBUSTIVEIS.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <Button variant="ghost" size="sm" onClick={() => removeCombustivel(index, "superior", pIdx)} className="h-6 text-xs text-destructive mt-1">Remover</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Lado Inferior */}
                            <div className="space-y-2 p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="font-bold flex items-center gap-2">
                                        Lado Traseiro (Inferior)
                                        {sinalizador.tipoBomba === "simples" && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase font-semibold">Espelhado Automático</span>}
                                    </Label>
                                    <Button size="sm" variant="outline" onClick={() => addCombustivel(index, "inferior")} disabled={sinalizador.tipoBomba === "simples" || sinalizador.blocoInferior.length >= 5} className="h-7 text-xs">
                                        + Produto
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 opacity-80">
                                    {sinalizador.blocoInferior.length === 0 && <span className="text-xs text-muted-foreground italic">Nenhum produto adicionado</span>}
                                    {sinalizador.blocoInferior.map((prod, pIdx) => (
                                        <div key={pIdx} className="flex flex-col gap-1 p-2 bg-card border rounded-md min-w-[140px]">
                                            <span className="text-[10px] font-mono text-muted-foreground">Slot {pIdx + 1}</span>
                                            <Select value={prod.id} onValueChange={(val) => updateCombustivel(index, "inferior", pIdx, val)} disabled={sinalizador.tipoBomba === "simples"}>
                                                <SelectTrigger className="h-8"><SelectValue placeholder="Produto" /></SelectTrigger>
                                                <SelectContent>
                                                    {NOME_COMBUSTIVEIS.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            {!sinalizador.tipoBomba.includes("simples") && (
                                                <Button variant="ghost" size="sm" onClick={() => removeCombustivel(index, "inferior", pIdx)} className="h-6 text-xs text-destructive mt-1">Remover</Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            ))}

            {data.quantidade > 0 && (
                <div className="space-y-3 pt-4 border-t-2">
                    <Label className="font-medium text-primary text-base">O que será feito com OS SINALIZADORES de forma geral?</Label>
                    <div className="flex gap-4 flex-wrap bg-primary/5 p-4 border-l-4 border-primary rounded-r-lg">
                        <div className="flex items-center space-x-2 bg-background p-2 px-3 border rounded-md">
                            <Checkbox
                                id="sinReforma"
                                checked={data.oQueSeraFeito.reforma}
                                onCheckedChange={(c) => onChange({ ...data, oQueSeraFeito: { ...data.oQueSeraFeito, reforma: !!c } })}
                            />
                            <Label htmlFor="sinReforma">Reforma</Label>
                        </div>
                        <div className="flex items-center space-x-2 bg-background p-2 px-3 border rounded-md">
                            <Checkbox
                                id="sinAdesivo"
                                checked={data.oQueSeraFeito.adesivacao}
                                onCheckedChange={(c) => onChange({ ...data, oQueSeraFeito: { ...data.oQueSeraFeito, adesivacao: !!c } })}
                            />
                            <Label htmlFor="sinAdesivo">Adesivação</Label>
                        </div>
                        <div className="flex items-center space-x-2 bg-background p-2 px-3 border rounded-md">
                            <Checkbox
                                id="sinNovo"
                                checked={data.oQueSeraFeito.novo}
                                onCheckedChange={(c) => onChange({ ...data, oQueSeraFeito: { ...data.oQueSeraFeito, novo: !!c } })}
                            />
                            <Label htmlFor="sinNovo">Fabricar Novo</Label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

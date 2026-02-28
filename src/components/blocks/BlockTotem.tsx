import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploadList } from "./ImageUploadList";
import { BlocoTotemData } from "./types";

interface BlockTotemProps {
    data: BlocoTotemData;
    onChange: (data: BlocoTotemData) => void;
    tipo: "corporativo" | "anp" | "galhardete";
}

export const BlockTotem = ({ data, onChange, tipo }: BlockTotemProps) => {
    const updateData = (field: keyof BlocoTotemData, subdata: any) => {
        onChange({ ...data, [field]: subdata });
    };

    const tipoLabel = {
        corporativo: "Totem Corporativo (Logo/Preços)",
        anp: "Totem ANP (Obrigatório)",
        galhardete: "Galhardete (Totem Menor/Secundário)"
    }[tipo];

    return (
        <div className="space-y-6 pt-2">
            <div className="flex items-center space-x-2 border-b pb-4">
                <Checkbox
                    id={`possui-${tipo}`}
                    checked={data.possui}
                    onCheckedChange={(c) => updateData("possui", !!c)}
                    className="w-5 h-5 rounded-md"
                />
                <Label htmlFor={`possui-${tipo}`} className="text-lg font-semibold cursor-pointer">
                    O posto POSSUI {tipoLabel}?
                </Label>
            </div>

            {data.possui && (
                <div className="space-y-6 animate-fade-in">

                    {/* Sessao Condição */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-primary">Condição Atual do Totem</h4>
                        <div className="grid gap-4 sm:grid-cols-3 p-4 border rounded-lg bg-muted/10">
                            <div className="space-y-1.5">
                                <Label>Estrutura Eletrônica</Label>
                                <Select
                                    value={data.condicaoAtual.eletrica}
                                    onValueChange={(val) => updateData("condicaoAtual", { ...data.condicaoAtual, eletrica: val })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="funcionando">Funcionando</SelectItem>
                                        <SelectItem value="parcial">Parcial / Defeito</SelectItem>
                                        <SelectItem value="desligada">Desligada / Queimada</SelectItem>
                                        <SelectItem value="nao_possui">Não possui LED/Painel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Pintura / Chaparia</Label>
                                <Select
                                    value={data.condicaoAtual.pintura}
                                    onValueChange={(val) => updateData("condicaoAtual", { ...data.condicaoAtual, pintura: val })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="boa">Boa / Conservada</SelectItem>
                                        <SelectItem value="desgastada">Desgastada / Faded</SelectItem>
                                        <SelectItem value="ferrugem">Com Ferrugem</SelectItem>
                                        <SelectItem value="amassada">Amassada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Base no Solo</Label>
                                <Select
                                    value={data.condicaoAtual.baseSolo}
                                    onValueChange={(val) => updateData("condicaoAtual", { ...data.condicaoAtual, baseSolo: val })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="concreto_bom">Base de Concreto Boa</SelectItem>
                                        <SelectItem value="concreto_ruim">Base Trincada/Ruim</SelectItem>
                                        <SelectItem value="chumbado">Chumbado direto no chão</SelectItem>
                                        <SelectItem value="solto">Instável / Solto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Secao Fotos */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-primary">Fotos e Medidas</h4>
                        <div className="space-y-2 p-3 bg-muted/20 rounded-lg border">
                            <ImageUploadList
                                label={`Fotos do ${tipoLabel} (Marque as medidas)`}
                                images={data.fotosMedidas}
                                onChange={(fotos) => updateData("fotosMedidas", fotos)}
                            />
                        </div>
                    </div>

                    {/* Secao O que sera feito */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-primary">O que será feito neste totem?</h4>
                        <div className="space-y-1.5 p-4 border rounded-lg bg-primary/5">
                            <Label>Aprofundar Ações (Reforma, Lonas Novas, Adesivos...)</Label>
                            <Textarea
                                value={data.oQueSeraFeito}
                                onChange={(e) => updateData("oQueSeraFeito", e.target.value)}
                                placeholder="Exemplo: Vamos trocar o display de preço em LED e reformar a base solta..."
                                rows={3}
                                className="bg-background"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

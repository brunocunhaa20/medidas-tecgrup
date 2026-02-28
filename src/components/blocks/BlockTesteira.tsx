import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploadList } from "./ImageUploadList";
import { BlocoTesteiraData } from "./types";

interface BlockTesteiraProps {
    data: BlocoTesteiraData;
    onChange: (data: BlocoTesteiraData) => void;
}

export const BlockTesteira = ({ data, onChange }: BlockTesteiraProps) => {
    const updateData = (field: keyof BlocoTesteiraData, subdata: any) => {
        onChange({ ...data, [field]: subdata });
    };

    return (
        <div className="space-y-6 pt-2">
            <div className="space-y-4">
                <h4 className="font-medium text-primary">Medidas e Anexos</h4>
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
                        <ImageUploadList
                            label="Perímetro"
                            images={data.perimetro.fotos}
                            onChange={(fotos) => updateData("perimetro", { ...data.perimetro, fotos })}
                        />
                    </div>
                    <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
                        <ImageUploadList
                            label="Altura"
                            images={data.altura.fotos}
                            onChange={(fotos) => updateData("altura", { ...data.altura, fotos })}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-primary">Observações da Testeira</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label>Material Atual</Label>
                        <Input
                            value={data.observacoes.materialAtual}
                            onChange={(e) => updateData("observacoes", { ...data.observacoes, materialAtual: e.target.value })}
                            placeholder="Ex: ACM, Lona..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Condição Geral</Label>
                        <Input
                            value={data.observacoes.condicaoGeral}
                            onChange={(e) => updateData("observacoes", { ...data.observacoes, condicaoGeral: e.target.value })}
                            placeholder="Ex: Bom estado, Enferrujado..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Iluminação</Label>
                        <Select
                            value={data.observacoes.iluminacao}
                            onValueChange={(val) => updateData("observacoes", { ...data.observacoes, iluminacao: val })}
                        >
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="led">LED</SelectItem>
                                <SelectItem value="fluorescente">Refletor Fluorescente</SelectItem>
                                <SelectItem value="sem_iluminacao">Sem Iluminação</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Acabamentos</Label>
                        <Input
                            value={data.observacoes.acabamentos}
                            onChange={(e) => updateData("observacoes", { ...data.observacoes, acabamentos: e.target.value })}
                            placeholder="Ex: Cantoneira alumínio"
                        />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label>Estrutura Interna</Label>
                        <Textarea
                            value={data.observacoes.estruturaInterna}
                            onChange={(e) => updateData("observacoes", { ...data.observacoes, estruturaInterna: e.target.value })}
                            placeholder="Condição da estrutura por trás do revestimento..."
                            rows={2}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-primary">O que será feito?</h4>
                <div className="space-y-3 p-4 border rounded-lg bg-muted/10">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="padraoProjeto"
                            checked={data.oQueSeraFeito.padraoProjeto3D}
                            onCheckedChange={(c) => updateData("oQueSeraFeito", { ...data.oQueSeraFeito, padraoProjeto3D: !!c })}
                        />
                        <Label htmlFor="padraoProjeto">Padrão do projeto 3D</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="manualMarca"
                            checked={data.oQueSeraFeito.manualMarcaCliente}
                            onCheckedChange={(c) => updateData("oQueSeraFeito", { ...data.oQueSeraFeito, manualMarcaCliente: !!c })}
                        />
                        <Label htmlFor="manualMarca">Manual de marca do cliente</Label>
                    </div>
                    <div className="space-y-1.5 pt-2">
                        <Label>Serviço Específico</Label>
                        <Textarea
                            value={data.oQueSeraFeito.servicoEspecifico}
                            onChange={(e) => updateData("oQueSeraFeito", { ...data.oQueSeraFeito, servicoEspecifico: e.target.value })}
                            placeholder="Descreva se o seviço for customizado..."
                            rows={2}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-primary">Aproveitamento de Material</h4>
                <div className="space-y-3 p-4 border rounded-lg bg-muted/10">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="reaproveita"
                            checked={data.aproveitamentoMaterial.reaproveita}
                            onCheckedChange={(c) => updateData("aproveitamentoMaterial", { ...data.aproveitamentoMaterial, reaproveita: !!c })}
                        />
                        <Label htmlFor="reaproveita">Haverá reaproveitamento de material (Sim/Não)</Label>
                    </div>
                    {data.aproveitamentoMaterial.reaproveita && (
                        <div className="space-y-1.5 pt-2 animate-fade-in">
                            <Label>Observação sobre o reaproveitamento</Label>
                            <Textarea
                                value={data.aproveitamentoMaterial.observacao}
                                onChange={(e) => updateData("aproveitamentoMaterial", { ...data.aproveitamentoMaterial, observacao: e.target.value })}
                                placeholder="Exemplo: Vamos reaproveitar a lona lateral..."
                                rows={2}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

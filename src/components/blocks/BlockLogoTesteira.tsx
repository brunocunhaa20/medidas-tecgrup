import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploadList } from "./ImageUploadList";
import { BlocoLogoTesteiraData } from "./types";

interface BlockLogoTesteiraProps {
    data: BlocoLogoTesteiraData;
    onChange: (data: BlocoLogoTesteiraData) => void;
}

export const BlockLogoTesteira = ({ data, onChange }: BlockLogoTesteiraProps) => {
    const updateData = (field: keyof BlocoLogoTesteiraData, subdata: any) => {
        onChange({ ...data, [field]: subdata });
    };

    return (
        <div className="space-y-6 pt-2">
            <div className="space-y-4">
                <h4 className="font-medium text-primary">Informações Básicas</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label>Quantidade de Logos</Label>
                        <Input
                            type="number"
                            value={data.quantidadeLogos || ""}
                            onChange={(e) => updateData("quantidadeLogos", parseInt(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-primary">Posição das Logos (Anexar e Editar)</h4>
                <div className="border rounded-lg p-3 bg-muted/20">
                    <ImageUploadList
                        label="Fotos da Posição na Testeira"
                        images={data.posicaoFotos}
                        onChange={(fotos) => updateData("posicaoFotos", fotos)}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-primary">Como a Logo será fornecida</h4>
                <div className="grid gap-4 sm:grid-cols-2 p-4 border rounded-lg bg-muted/10">
                    <div className="space-y-1.5">
                        <Label>Material</Label>
                        <Select
                            value={data.comoSeraFornecida.material}
                            onValueChange={(val) => updateData("comoSeraFornecida", { ...data.comoSeraFornecida, material: val })}
                        >
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="acrilico">Acrílico</SelectItem>
                                <SelectItem value="acm">ACM Recortado</SelectItem>
                                <SelectItem value="lona">Lona Impressa</SelectItem>
                                <SelectItem value="aluminio">Alumínio</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Iluminação da Logo</Label>
                        <Select
                            value={data.comoSeraFornecida.iluminacao}
                            onValueChange={(val) => updateData("comoSeraFornecida", { ...data.comoSeraFornecida, iluminacao: val })}
                        >
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="led_interno">LED Interno (backlight)</SelectItem>
                                <SelectItem value="led_externo">Refletor Externo (frontlight)</SelectItem>
                                <SelectItem value="sem_iluminacao">Sem Iluminação</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2 border-t pt-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="aproveitaLogo"
                                checked={data.comoSeraFornecida.aproveitamentoMaterial}
                                onCheckedChange={(c) => updateData("comoSeraFornecida", { ...data.comoSeraFornecida, aproveitamentoMaterial: !!c })}
                            />
                            <Label htmlFor="aproveitaLogo">Logo será reaproveitada? (Sim/Não)</Label>
                        </div>
                    </div>

                    {data.comoSeraFornecida.aproveitamentoMaterial && (
                        <div className="space-y-1.5 sm:col-span-2 animate-fade-in">
                            <Label>Observação sobre o reaproveitamento</Label>
                            <Textarea
                                value={data.comoSeraFornecida.aproveitamentoObservacao}
                                onChange={(e) => updateData("comoSeraFornecida", { ...data.comoSeraFornecida, aproveitamentoObservacao: e.target.value })}
                                placeholder="Exemplo: Os leds antigos estão queimados, aproveitar apenas a caixa acrílica..."
                                rows={2}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

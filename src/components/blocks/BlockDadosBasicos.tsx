import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageUploadList } from "./ImageUploadList";
import { DadosBasicosData } from "./types";

interface Props {
  data: DadosBasicosData;
  onChange: (data: DadosBasicosData) => void;
}

const formatCNPJ = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  }
  return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
};

export const BlockDadosBasicos = ({ data, onChange }: Props) => {
  const update = (field: keyof DadosBasicosData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Rede <span className="text-muted-foreground text-xs">(opcional)</span></Label>
          <Input value={data.rede} onChange={(e) => update("rede", e.target.value)} placeholder="Ex: Rede Sim, Ipiranga..." />
        </div>
        <div className="space-y-1.5">
          <Label>Bandeira <span className="text-muted-foreground text-xs">(opcional)</span></Label>
          <Input value={data.bandeira} onChange={(e) => update("bandeira", e.target.value)} placeholder="Ex: Shell, BR, Ipiranga..." />
        </div>
        <div className="space-y-1.5">
          <Label>Nome Fantasia <span className="text-destructive">*</span></Label>
          <Input value={data.nomeFantasia} onChange={(e) => update("nomeFantasia", e.target.value)} placeholder="Ex: Auto Posto Bandeirantes" />
        </div>
        <div className="space-y-1.5">
          <Label>CNPJ <span className="text-destructive">*</span></Label>
          <Input
            value={data.cnpj}
            onChange={(e) => update("cnpj", formatCNPJ(e.target.value))}
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Nome do Gerente Responsável <span className="text-destructive">*</span></Label>
          <Input value={data.gerenteNome} onChange={(e) => update("gerenteNome", e.target.value)} placeholder="Nome completo" />
        </div>
        <div className="space-y-1.5">
          <Label>Telefone do Gerente <span className="text-destructive">*</span></Label>
          <Input
            value={data.gerenteTelefone}
            onChange={(e) => update("gerenteTelefone", formatPhone(e.target.value))}
            placeholder="(00) 00000-0000"
            inputMode="tel"
          />
        </div>
      </div>

      <div className="pt-2">
        <ImageUploadList
          label="Foto do Posto"
          images={data.fotoPosto}
          onChange={(fotos) => update("fotoPosto", fotos)}
          maxImages={5}
        />
      </div>
    </div>
  );
};

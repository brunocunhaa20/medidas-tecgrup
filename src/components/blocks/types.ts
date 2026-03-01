export interface FotoAnotada {
    id: string;
    url: string;
    annotations: any[];
}

export interface DadosBasicosData {
    rede: string;
    bandeira: string;
    nomeFantasia: string;
    cnpj: string;
    gerenteNome: string;
    gerenteTelefone: string;
    fotoPosto: FotoAnotada[];
}

export interface BlocoTesteiraData {
    perimetro: { fotos: FotoAnotada[] };
    altura: { fotos: FotoAnotada[] };
    observacoes: {
        materialAtual: string;
        condicaoGeral: string;
        iluminacao: string;
        acabamentos: string;
        estruturaInterna: string;
    };
    oQueSeraFeito: {
        padraoProjeto3D: boolean;
        manualMarcaCliente: boolean;
        servicoEspecifico: string;
    };
    aproveitamentoMaterial: {
        reaproveita: boolean;
        observacao: string;
    };
}

export interface BlocoLogoTesteiraData {
    quantidadeLogos: number;
    posicaoFotos: FotoAnotada[];
    comoSeraFornecida: {
        material: string;
        iluminacao: string;
        aproveitamentoMaterial: boolean;
        aproveitamentoObservacao: string;
    };
}

export interface BlocoForroPVCData {
    fotos: FotoAnotada[];
    observacoes: string;
}

export interface ItemDutoColuna {
    dutosEletricos: boolean;
    dutosEscoamento: boolean;
    torneiras: boolean;
    itensSobressalentes: boolean;
}

export interface ColunaEspecficaData {
    id: string;
    nome: string;
    medidasFotos: FotoAnotada[];
    itensExistentes: ItemDutoColuna;
    observacao: string;
    fotosAdicionais: FotoAnotada[];
}

export interface BlocoColunasData {
    quantidade: number;
    colunas: ColunaEspecficaData[];
    condicaoAtualDescricao: string;
    oQueSeraFeito: {
        revestimento: boolean;
        pintura: boolean;
        adesivacao: boolean;
    };
}

export interface SinalizadorProduto {
    id: string;
    nome: string;
}

export interface SinalizadorEspecficoData {
    id: string;
    nome: string;
    condicaoAtual: string;
    fotosCondicao: FotoAnotada[];
    observacaoCondicao: string;
    dimensoes: {
        altura: string;
        largura: string;
        profundidade: string;
        fotosMarcadas: FotoAnotada[];
    };
    tipoBomba: "simples" | "invertida";
    blocoSuperior: SinalizadorProduto[];
    blocoInferior: SinalizadorProduto[];
}

export interface BlocoSinalizadoresData {
    quantidade: number;
    sinalizadores: SinalizadorEspecficoData[];
    oQueSeraFeito: {
        reforma: boolean;
        adesivacao: boolean;
        novo: boolean;
    };
}

export interface CapaBombaEspecficaData {
    id: string;
    nome: string;
    fotosMedidas: FotoAnotada[];
    fotosAdesivos: FotoAnotada[];
    observacoes: string;
}

export interface BlocoCapasBombaData {
    quantidadeBombas: number;
    capas: CapaBombaEspecficaData[];
}

export interface IlhaEspecficaData {
    id: string;
    nome: string;
    fotosMedidas: FotoAnotada[];
    observacoes: string;
}

export interface BlocoIlhaData {
    ilhas: IlhaEspecficaData[];
}

export interface BlocoTotemData {
    possui: boolean;
    condicaoAtual: {
        eletrica: string;
        pintura: string;
        baseSolo: string;
    };
    fotosMedidas: FotoAnotada[];
    oQueSeraFeito: string;
}

export interface MeasurementFormData {
    dadosBasicos: DadosBasicosData;
    testeira: BlocoTesteiraData;
    logoTesteira: BlocoLogoTesteiraData;
    forroPVC: BlocoForroPVCData;
    colunas: BlocoColunasData;
    sinalizadores: BlocoSinalizadoresData;
    capasBomba: BlocoCapasBombaData;
    ilha: BlocoIlhaData;
    totemCorp: BlocoTotemData;
    totemANP: BlocoTotemData;
    galhardete: BlocoTotemData;
}

// Helper to check if a block has any data filled
export function isBlockFilled(block: any): boolean {
    if (!block) return false;
    if (typeof block === "string") return block.trim().length > 0;
    if (typeof block === "number") return block > 0;
    if (typeof block === "boolean") return block;
    if (Array.isArray(block)) return block.length > 0;
    if (typeof block === "object") {
        return Object.values(block).some((v) => isBlockFilled(v));
    }
    return false;
}

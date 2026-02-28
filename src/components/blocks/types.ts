export interface FotoAnotada {
    id: string;
    url: string;
    annotations: any[];
}

export interface BlocoTesteiraData {
    perimetro: {
        fotos: FotoAnotada[];
    };
    altura: {
        fotos: FotoAnotada[];
    };
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
    posicaoFotos: FotoAnotada[]; // foto editável
    comoSeraFornecida: {
        material: string;
        iluminacao: string;
        aproveitamentoMaterial: boolean;
        aproveitamentoObservacao: string;
    };
}

// O estado global do formulário que salva no JSON JSON 'annotations'
export interface MeasurementFormData {
    testeira: BlocoTesteiraData;
    logoTesteira: BlocoLogoTesteiraData;
    forroPVC?: any;
    colunas?: any;
    sinalizadores?: any;
    capasBomba?: any;
    ilha?: any;
    totemCorp?: any;
    totemANP?: any;
    galhardete?: any;
}

// GHW · interpretar-nota-fiscal v2.2 · Dono: Equipe Fiscal
// Lê o XML da NF-e de verdade e devolve a estrutura única que os apps consomem.
// Sem dependências: extrai os campos do layout oficial da SEFAZ (infNFe, emit,
// dest, det/prod, ICMSTot). Escopo honesto: um XML fora do padrão lança erro.
function campo(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return m ? m[1].trim() : null;
}

function bloco(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[\\s>]([\\s\\S]*?)</${tag}>`));
  return m ? m[1] : "";
}

function numero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function lerXmlNFe(xml) {
  const chaveM = xml.match(/<infNFe[^>]*Id="NFe(\d{44})"/);
  if (!chaveM) throw new Error("XML sem chave de NF-e (infNFe Id).");
  const emit = bloco(xml, "emit");
  const dest = bloco(xml, "dest");
  const ide = bloco(xml, "ide");
  const totais = bloco(xml, "ICMSTot");
  const itens = [...xml.matchAll(/<det[^>]*nItem="(\d+)"[^>]*>([\s\S]*?)<\/det>/g)].map((m) => {
    const prod = bloco(m[2], "prod");
    return {
      numero: Number(m[1]),
      codigo: campo(prod, "cProd"),
      descricao: campo(prod, "xProd"),
      quantidade: numero(campo(prod, "qCom")),
      valorUnitario: numero(campo(prod, "vUnCom")),
      valorTotal: numero(campo(prod, "vProd")),
    };
  });
  return {
    chave: chaveM[1],
    emitente: {
      documento: campo(emit, "CNPJ") ?? campo(emit, "CPF"),
      nome: campo(emit, "xNome"),
    },
    destinatario: {
      documento: campo(dest, "CNPJ") ?? campo(dest, "CPF"),
      nome: campo(dest, "xNome"),
    },
    dataEmissao: campo(ide, "dhEmi") ?? campo(ide, "dEmi"),
    itens,
    totais: {
      valorNota: numero(campo(totais, "vNF")),
      valorIcms: numero(campo(totais, "vICMS")),
    },
  };
}

function interpretarNotaFiscal(entrada) {
  if (!entrada) throw new Error("XML da NF-e é obrigatório.");
  const xml = typeof entrada === "string" ? entrada : entrada.conteudo ?? entrada.xml ?? entrada.texto;
  if (typeof xml !== "string" || !xml.includes("<")) {
    throw new Error("Esperava o texto do XML da NF-e (string) ou { conteudo }.");
  }
  const nota = lerXmlNFe(xml);
  return {
    empresa: nota.destinatario.nome,
    tipo: "NF-e",
    estado: "normalizado",
    ...nota,
    origem: "ghw.interpretarNotaFiscal()",
  };
}

module.exports = { interpretarNotaFiscal };

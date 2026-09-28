// GHW · interpretar-nota-fiscal v2.1 · Dono: Equipe Fiscal
// Recebe o arquivo bruto da NF-e e devolve a estrutura única que todos os apps consomem.
function interpretarNotaFiscal(arquivoBruto) {
  if (!arquivoBruto) throw new Error("arquivo_bruto é obrigatório (NF-e).");
  return {
    empresa: arquivoBruto.empresa,
    tipo: "NF-e",
    estado: "normalizado",
    itens: arquivoBruto.itens ?? [],
    origem: "ghw.importar()",
  };
}

module.exports = { interpretarNotaFiscal };

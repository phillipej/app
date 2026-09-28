// GHW · identificar-tipo-arquivo v1.4 · Dono: Equipe Entrada
// Rótulo único para NF-e, extrato e folha antes de qualquer normalização.
function identificarTipoArquivo(arquivoBruto) {
  const nome = String(arquivoBruto?.nome ?? "").toLowerCase();
  if (nome.endsWith(".xml") || nome.includes("nfe")) return { tipo: "NF-e" };
  if (nome.endsWith(".ofx") || nome.endsWith(".csv") || nome.includes("extrato")) return { tipo: "extrato" };
  if (nome.includes("folha")) return { tipo: "folha" };
  return { tipo: "desconhecido" };
}

module.exports = { identificarTipoArquivo };

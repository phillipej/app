// GHW — ponto único de chamada das funções prontas.
// Reexporta SÓ as funções que têm index.js (as previstas não entram aqui,
// então nenhum app copia rascunho). Uso a partir da raiz do repositório:
//
//   const { interpretarNotaFiscal } = require("./ghw");
const { interpretarNotaFiscal } = require("./functions/interpretar-nota-fiscal/index.js");
const { identificarTipoArquivo } = require("./functions/identificar-tipo-arquivo/index.js");

module.exports = { interpretarNotaFiscal, identificarTipoArquivo };

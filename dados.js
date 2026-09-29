// GHW — Normalização de dados. Importar o bruto + visão por empresa e tipo.
// O envio identifica o tipo de verdade e, se for NF-e, interpreta a nota.
// Extrato e folha são recusados enquanto não tiverem código.
const overlayImportar = document.getElementById("overlayImportar");
const impFile = document.getElementById("impFile");
const impOk = document.getElementById("impOk");
const drop = document.querySelector(".drop");
let nomeArquivo = "";

async function carregarDados() {
  const res = await fetch("/api/dados");
  const dados = await res.json();
  document.getElementById("dados").innerHTML = dados.empresas
    .map(
      (e) => `<div class="empresa"><h3>${e.nome}</h3>
        <table class="tabela"><tr><th>Tipo</th><th>Quantidade</th><th>Estado</th></tr>
        ${e.arquivos.map((a) => `<tr><td>${a.tipo}</td><td>${a.quantidade}</td><td>${a.estado}</td></tr>`).join("")}
        </table></div>`
    )
    .join("");
}

function dizer(texto, ok) {
  impOk.hidden = false;
  impOk.textContent = texto;
  impOk.className = ok ? "copiado" : "aviso";
}

const abrirImportar = () => {
  impOk.hidden = true;
  overlayImportar.hidden = false;
};
const fecharImportar = () => (overlayImportar.hidden = true);

document.getElementById("btnImportar").addEventListener("click", abrirImportar);
document.getElementById("impFechar").addEventListener("click", fecharImportar);
document.getElementById("impFechar2").addEventListener("click", fecharImportar);
overlayImportar.addEventListener("click", (e) => {
  if (e.target === overlayImportar) fecharImportar();
});
impFile.addEventListener("change", () => {
  nomeArquivo = impFile.files[0]?.name ?? "";
  if (nomeArquivo) dizer(`Selecionado: ${nomeArquivo}. Clique em Enviar para normalizar.`, true);
});
document.getElementById("impEnviar").addEventListener("click", () => {
  const arquivo = impFile.files[0];
  if (!arquivo) {
    dizer("Escolha um arquivo primeiro.", false);
    return;
  }
  dizer("Lendo e identificando…", true);
  const leitor = new FileReader();
  leitor.onload = async () => {
    try {
      const res = await fetch("/api/normalizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: arquivo.name, conteudo: String(leitor.result ?? "") }),
      });
      const corpo = await res.json();
      if (!res.ok) {
        dizer(`Recusado (${corpo.tipo ?? "?"}): ${corpo.erro}. Nada foi gravado.`, false);
        return;
      }
      const nf = corpo.resultado;
      dizer(
        `NF-e normalizada · chave ${nf.chave} · ${nf.emitente.nome} → ${nf.destinatario.nome} · ${nf.itens.length} itens · total R$ ${nf.totais.valorNota}. Demonstração: nada foi gravado.`,
        true
      );
    } catch {
      dizer("Falha ao falar com o servidor. Tente de novo.", false);
    }
  };
  leitor.readAsText(arquivo);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharImportar();
});

carregarDados();

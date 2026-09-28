// GHW — Normalização de dados. Importar o bruto + visão por empresa e tipo.
const overlayImportar = document.getElementById("overlayImportar");

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

const abrirImportar = () => {
  document.getElementById("impOk").hidden = true;
  overlayImportar.hidden = false;
};
const fecharImportar = () => (overlayImportar.hidden = true);

document.getElementById("btnImportar").addEventListener("click", abrirImportar);
document.getElementById("impFechar").addEventListener("click", fecharImportar);
document.getElementById("impFechar2").addEventListener("click", fecharImportar);
overlayImportar.addEventListener("click", (e) => {
  if (e.target === overlayImportar) fecharImportar();
});
document.getElementById("impEnviar").addEventListener("click", () => {
  document.getElementById("impOk").hidden = false;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharImportar();
});

carregarDados();

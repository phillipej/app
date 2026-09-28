// GHW — Funções prontas. Catálogo lido dos manifests em functions/*/manifest.json.
const lista = document.getElementById("lista");
const busca = document.getElementById("busca");
const overlay = document.getElementById("overlay");
let funcoes = [];
let filtro = "todas";
let atual = null;

async function carregar() {
  const res = await fetch("/api/functions");
  funcoes = await res.json();
  contar();
  render();
}

function contar() {
  const prontas = funcoes.filter((f) => f.estado === "pronta").length;
  const previstas = funcoes.filter((f) => f.estado === "prevista").length;
  document.getElementById("cTodas").textContent = funcoes.length;
  document.getElementById("cProntas").textContent = prontas;
  document.getElementById("cPrevistas").textContent = previstas;
  document.getElementById("navCount").textContent = `${funcoes.length} funções`;
}

function filtradas() {
  const q = busca.value.trim().toLowerCase();
  return funcoes.filter((f) => {
    const okFiltro = filtro === "todas" || f.estado === filtro;
    const hay = `${f.nome} ${f.descricao} ${f.dono} ${f.versao}`.toLowerCase();
    return okFiltro && (!q || hay.includes(q));
  });
}

function render() {
  const itens = filtradas();
  if (!itens.length) {
    lista.innerHTML = `<li class="vazio">Nada por aqui — ajuste a busca ou fale com o dono da função.</li>`;
    return;
  }
  lista.innerHTML = itens
    .map((f) => {
      const pronta = f.estado === "pronta";
      return `<li class="linha">
        <span class="ponto ${f.estado}" aria-hidden="true"></span>
        <div><strong>${f.nome}</strong><p>${f.descricao}</p></div>
        <div class="meta">
          <span class="versao">${f.versao}</span>
          <span>${f.uso}</span>
          <span class="selo ${f.estado}">● ${f.estado}</span>
          ${pronta
            ? `<button class="btn-detalhe" data-i="${funcoes.indexOf(f)}" type="button">Detalhes →</button>`
            : `<button class="btn-detalhe" disabled type="button">Em breve</button>`}
        </div>
      </li>`;
    })
    .join("");
  lista.querySelectorAll(".btn-detalhe[data-i]").forEach((b) =>
    b.addEventListener("click", () => abrirDetalhe(funcoes[Number(b.dataset.i)]))
  );
}

function abrirDetalhe(f) {
  atual = f;
  document.getElementById("popNome").textContent = f.nome;
  document.getElementById("popDesc").textContent = f.descricao + " — app novo chama, não copia.";
  const selo = document.getElementById("popEstado");
  selo.textContent = `● ${f.estado}`;
  selo.className = `selo ${f.estado}`;
  document.getElementById("popVersao").textContent = `${f.versao} · ${f.versao_estado}`;
  document.getElementById("popVersaoNota").textContent = f.versao_nota;
  document.getElementById("popDono").textContent = f.dono;
  document.getElementById("popDonoNota").textContent = f.dono_nota;
  document.getElementById("popEntrada").textContent = f.entrada;
  document.getElementById("popSaida").textContent = f.saida;
  document.getElementById("popQuemLbl").textContent = `Quem chama · ${f.quem_chama.length} apps`;
  document.getElementById("popQuem").innerHTML = f.quem_chama.map((a) => `<span>${a}</span>`).join("");
  document.getElementById("popOk").hidden = true;
  overlay.hidden = false;
}

function fecharDetalhe() {
  overlay.hidden = true;
  atual = null;
}

async function copiarChamada() {
  if (!atual) return;
  try {
    await navigator.clipboard.writeText(atual.chamada);
  } catch {
    const t = document.createElement("textarea");
    t.value = atual.chamada;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
  document.getElementById("popOk").hidden = false;
}

document.querySelectorAll(".filtro").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".filtro").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    filtro = b.dataset.filtro;
    render();
  })
);

busca.addEventListener("input", render);
document.getElementById("popFechar").addEventListener("click", fecharDetalhe);
document.getElementById("popFechar2").addEventListener("click", fecharDetalhe);
document.getElementById("popCopiar").addEventListener("click", copiarChamada);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) fecharDetalhe();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharDetalhe();
});

carregar();

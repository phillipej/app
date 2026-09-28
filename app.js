// GHW — Funções. Grade lida dos manifests em functions/*/manifest.json.
const grade = document.getElementById("grade");
const busca = document.getElementById("busca");
const overlay = document.getElementById("overlay");
const popup = document.getElementById("popup");
const contagem = document.getElementById("contagem");
const limparBtn = document.getElementById("limpar");
const donosBox = document.getElementById("donos");
let funcoes = [];
let estado = "todas";
let donos = new Set();
let ultimaCapa = null;
let atual = null;

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

function iniciais(nome) {
  const palavras = String(nome).split(/\s+/).filter(Boolean);
  return ((palavras[0]?.[0] ?? "") + (palavras[1]?.[0] ?? "")).toUpperCase() || "?";
}

// Ordem padrão: pronta antes de prevista; entre prontas, mais chamadores;
// empate e previstas por nome A–Z sem acento.
function ordemPadrao(a, b) {
  const ea = a.estado === "pronta" ? 0 : 1;
  const eb = b.estado === "pronta" ? 0 : 1;
  if (ea !== eb) return ea - eb;
  if (ea === 0) {
    const ca = a.quem_chama?.length ?? 0;
    const cb = b.quem_chama?.length ?? 0;
    if (ca !== cb) return cb - ca;
  }
  return norm(a.nome).localeCompare(norm(b.nome), "pt-BR");
}

function pontos(f, termo) {
  if (!termo) return 0;
  const nome = norm(f.nome);
  const dono = norm(f.dono);
  const frase = norm(f.descricao);
  if (nome.startsWith(termo)) return 100;
  if (nome.includes(termo)) return 60;
  if (dono.includes(termo)) return 30;
  if (frase.includes(termo)) return 10;
  return 0;
}

function visiveis() {
  const termo = norm(busca.value.trim());
  const lista = funcoes.filter((f) => {
    if (estado !== "todas" && f.estado !== estado) return false;
    if (donos.size && !donos.has(f.dono)) return false;
    return true;
  });
  if (!termo) return lista.sort(ordemPadrao);
  return lista
    .map((f) => ({ f, p: pontos(f, termo) }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p || ordemPadrao(a.f, b.f))
    .map((x) => x.f);
}

// Realce sem acento: cada letra do termo casa com suas variantes.
const VARIANTES = {
  a: "[aàáâãä]", e: "[eèéêë]", i: "[iìíîï]", o: "[oòóôõö]",
  u: "[uùúûü]", c: "[cç]", n: "[nñ]",
};
function realcar(nome, termoBruto) {
  const termo = norm(termoBruto.trim());
  if (!termo) return nome;
  const rx = termo
    .split("")
    .map((ch) => VARIANTES[ch] ?? ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("");
  const m = new RegExp(rx, "i").exec(nome);
  if (!m) return nome;
  return nome.slice(0, m.index) + "<mark>" + m[0] + "</mark>" + nome.slice(m.index + m[0].length);
}

function render() {
  const itens = visiveis();
  contagem.textContent = `${itens.length} de ${funcoes.length}`;
  const sujo = busca.value.trim() !== "" || estado !== "todas" || donos.size > 0;
  limparBtn.hidden = !sujo;
  if (!itens.length) {
    grade.innerHTML = `<div class="vazio">Nenhuma função com esse texto.<br><button class="btn-detalhe" id="vazioLimpar" type="button">Limpar busca e filtros</button></div>`;
    document.getElementById("vazioLimpar").addEventListener("click", limparTudo);
    return;
  }
  grade.innerHTML = itens
    .map((f) => {
      const i = funcoes.indexOf(f);
      return `<button class="capa ${f.estado}" data-i="${i}" type="button" aria-label="${f.nome} — ${f.estado}">
        <span class="capa-top"><span class="sigla">${iniciais(f.nome)}</span><span class="selo ${f.estado}">${f.estado}</span></span>
        <span class="capa-nome">${realcar(f.nome, busca.value)}</span>
        <span class="capa-meta">${f.versao} · ${f.dono}</span>
      </button>`;
    })
    .join("");
  grade.querySelectorAll(".capa").forEach((c) =>
    c.addEventListener("click", () => abrirDetalhe(funcoes[Number(c.dataset.i)], c))
  );
}

function renderDonos() {
  const lista = [...new Set(funoesDono())].sort((a, b) => norm(a).localeCompare(norm(b), "pt-BR"));
  donosBox.innerHTML = lista
    .map((d) => `<button class="dono${donos.has(d) ? " on" : ""}" data-dono="${d}" type="button" aria-pressed="${donos.has(d)}">${d.replace("Equipe ", "")}</button>`)
    .join("");
  donosBox.querySelectorAll(".dono").forEach((b) =>
    b.addEventListener("click", () => {
      const d = b.dataset.dono;
      if (donos.has(d)) donos.delete(d);
      else donos.add(d);
      renderDonos();
      render();
    })
  );
}
function funoesDono() {
  return funcoes.map((f) => f.dono);
}

function limparTudo() {
  busca.value = "";
  estado = "todas";
  donos.clear();
  document.querySelectorAll(".seg-btn").forEach((x) => x.classList.toggle("active", x.dataset.estado === "todas"));
  renderDonos();
  render();
  busca.focus();
}

function abrirDetalhe(f, capa) {
  atual = f;
  ultimaCapa = capa ?? null;
  const pronta = f.estado === "pronta";
  document.getElementById("popNome").textContent = f.nome;
  document.getElementById("popDesc").textContent = f.descricao + ".";
  const selo = document.getElementById("popEstado");
  selo.textContent = f.estado;
  selo.className = `selo ${f.estado}`;
  document.getElementById("popVersao").textContent = `${f.versao} · ${f.versao_estado}`;
  document.getElementById("popVersaoNota").textContent = f.versao_nota;
  document.getElementById("popDono").textContent = f.dono;
  document.getElementById("popDonoNota").textContent = f.dono_nota;
  document.getElementById("popEntrada").textContent = f.entrada;
  document.getElementById("popSaida").textContent = f.saida;
  document.getElementById("popQuemLbl").textContent = `Quem chama · ${f.quem_chama.length} app${f.quem_chama.length === 1 ? "" : "s"}`;
  document.getElementById("popQuem").innerHTML = f.quem_chama.map((a) => `<span>${a}</span>`).join("");
  const copiar = document.getElementById("popCopiar");
  copiar.disabled = !pronta;
  copiar.textContent = pronta ? "Copiar chamada" : "Ainda não disponível";
  document.getElementById("popAviso").hidden = pronta;
  document.getElementById("popOk").hidden = true;
  overlay.hidden = false;
  popup.focus();
}

function fecharDetalhe() {
  overlay.hidden = true;
  if (ultimaCapa) ultimaCapa.focus();
  ultimaCapa = null;
}

async function copiarChamada(f) {
  try {
    await navigator.clipboard.writeText(f.chamada);
  } catch {
    const t = document.createElement("textarea");
    t.value = f.chamada;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
  document.getElementById("popOk").hidden = false;
}

async function carregar() {
  const res = await fetch("/api/functions");
  funcoes = await res.json();
  document.getElementById("navCount").textContent = `${funcoes.length} funções`;
  renderDonos();
  render();
}

carregar();

document.querySelectorAll(".seg-btn").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    estado = b.dataset.estado;
    render();
  })
);

let debounce = null;
busca.addEventListener("input", () => {
  clearTimeout(debounce);
  debounce = setTimeout(render, 100);
});
limparBtn.addEventListener("click", limparTudo);
document.getElementById("popFechar").addEventListener("click", fecharDetalhe);
document.getElementById("popFechar2").addEventListener("click", fecharDetalhe);
document.getElementById("popCopiar").addEventListener("click", () => {
  if (atual) copiarChamada(atual);
});
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) fecharDetalhe();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!overlay.hidden) fecharDetalhe();
    else if (document.activeElement !== busca && busca.value) {
      busca.value = "";
      render();
    }
    return;
  }
  if (e.key === "/" && document.activeElement !== busca && overlay.hidden) {
    e.preventDefault();
    busca.focus();
  }
  if (e.key === "Enter" && document.activeElement?.classList?.contains("capa")) {
    document.activeElement.click();
  }
});

carregar();

/***********************
 * STORAGE
 ***********************/
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let kits = JSON.parse(localStorage.getItem("kits")) || [];
let separacao = [];
let editandoSeparacaoIndex = null;
let historico = JSON.parse(localStorage.getItem("historico")) || [];

/***********************
 * ELEMENTOS
 ***********************/
const productTableBody = document.getElementById("productTableBody");
const kitTableBody = document.getElementById("kitTableBody");
const separacaoTableBody = document.getElementById("separacaoTableBody");
const csvInput = document.getElementById("csvFileInput");
const arquivoSelecionado = document.getElementById("arquivoSelecionado");

const popupCadastroItem = document.getElementById("popupCadastroItem");
const popupCadastroKit = document.getElementById("popupCadastroKit");
const newKitForm = document.getElementById("newKitForm");

const datalistProdutosKit = document.getElementById("datalistProdutosKit");
const datalistSeparacao = document.getElementById("datalistSeparacao");

/***********************
 * POPUPS
 ***********************/
function openPopUp() {
    popupCadastroItem.style.display = "block";
}
function closePopup() {
    popupCadastroItem.style.display = "none";
    document.getElementById("newItemForm").reset();
}

function openKitPopUp() {
    popupCadastroKit.style.display = "block";
    atualizarDatalistProdutosKit();
}
function closeKitPopUp() {
    popupCadastroKit.style.display = "none";
    newKitForm.reset();
    itensKit = [];
    editandoKit = null;
    renderItensKit();
}

/***********************
 * CSV – BOTÃO REMOVER
 ***********************/
const btnRemoverArquivo = document.createElement("button");
btnRemoverArquivo.textContent = "Remover arquivo";
btnRemoverArquivo.className = "btnImportar";
btnRemoverArquivo.style.marginLeft = "10px";
btnRemoverArquivo.style.display = "none";
arquivoSelecionado.after(btnRemoverArquivo);

btnRemoverArquivo.onclick = () => {
    csvInput.value = "";
    arquivoSelecionado.textContent = "Nenhum arquivo selecionado";
    btnRemoverArquivo.style.display = "none";
};

/***********************
 * ABAS
 ***********************/
function showTab(id, btn) {
    document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
    document.getElementById(id).style.display = "block";

    document.querySelectorAll(".tab-link").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");

    if (id === "separacao") preencherDatalistSeparacao();
}

/***********************
 * PRODUTOS
 ***********************/
function salvarProdutos() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
}

function renderProdutos() {
    productTableBody.innerHTML = "";
    produtos.forEach((p, i) => {
        productTableBody.innerHTML += `
        <tr>
            <td>${p.sku}</td>
            <td>${p.nome}</td>
            <td>${p.codigoFull || ""}</td>
            <td>${p.localizacao}</td>
            <td>${p.estoque}</td>
            <td>
                <button onclick="editarProduto(${i})">Editar</button>
                <button onclick="excluirProduto(${i})">Excluir</button>
            </td>
        </tr>`;
    });
}

document.getElementById("newItemForm").addEventListener("submit", e => {
    e.preventDefault();

    produtos.push({
        sku: sku.value.trim(),
        nome: nomeProduto.value.trim(),
        codigoFull: codigoFull.value.trim(),
        localizacao: localizacao.value.trim(),
        estoque: Number(estoque.value)
    });

    salvarProdutos();
    renderProdutos();
    closePopup();
});

function editarProduto(i) {
    const p = produtos[i];
    sku.value = p.sku;
    nomeProduto.value = p.nome;
    codigoFull.value = p.codigoFull;
    localizacao.value = p.localizacao;
    estoque.value = p.estoque;
    produtos.splice(i, 1);
    openPopUp();
}

function excluirProduto(i) {
    if (confirm("Excluir produto?")) {
        produtos.splice(i, 1);
        salvarProdutos();
        renderProdutos();
    }
}

/***********************
 * KITS
 ***********************/
let itensKit = [];
let editandoKit = null;

function atualizarDatalistProdutosKit() {
    datalistProdutosKit.innerHTML = "";
    produtos.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.sku;
        opt.label = `${p.sku} - ${p.nome}`;
        datalistProdutosKit.appendChild(opt);
    });
}

function adicionarProdutoKit() {
    const prod = produtos.find(p => p.sku === inputProdutoKit.value);
    if (!prod) return alert("Produto não encontrado");

    itensKit.push({ sku: prod.sku, qtd: Number(qtdProdutoKit.value) });
    renderItensKit();
    inputProdutoKit.value = "";
}

function renderItensKit() {
    itensSelecionadosKit.innerHTML = "";
    itensKit.forEach((i, idx) => {
        const p = produtos.find(pr => pr.sku === i.sku);
        itensSelecionadosKit.innerHTML += `
        <div class="kit-item">
            <div>${p ? p.nome : "Produto não cadastrado"} (x${i.qtd})</div>
            <button onclick="removerItemKit(${idx})">×</button>
        </div>`;
    });
}

function removerItemKit(i) {
    itensKit.splice(i, 1);
    renderItensKit();
}

newKitForm.addEventListener("submit", e => {
    e.preventDefault();

    const kit = {
        sku: kitSku.value.trim(),
        nome: nomeKit.value.trim(),
        codigoFull: kitCodigoFull.value.trim(),
        itens: [...itensKit]
    };

    editandoKit !== null ? kits[editandoKit] = kit : kits.push(kit);
    localStorage.setItem("kits", JSON.stringify(kits));
    renderKits();
    closeKitPopUp();
});

function renderKits() {
    kitTableBody.innerHTML = "";
    kits.forEach((k, i) => {
        kitTableBody.innerHTML += `
        <tr>
            <td>${k.sku}</td>
            <td>${k.nome}</td>
            <td>${k.codigoFull || ""}</td>
            <td>
                <button onclick="editarKit(${i})">Editar</button>
                <button onclick="excluirKit(${i})">Excluir</button>
            </td>
        </tr>`;
    });
}

function excluirKit(index) {
    const kit = kits[index];

    if (!confirm(`Excluir o kit "${kit.nome}"?`)) return;

    // Remove da separação se estiver sendo usado
    separacao = separacao.filter(s => s.valor !== `KIT:${kit.sku}`);

    kits.splice(index, 1);
    localStorage.setItem("kits", JSON.stringify(kits));

    renderKits();
    renderSeparacao();
    
    if (separacao.some(s => s.valor === `KIT:${kit.sku}`)) {
    alert("Este kit está em uso na separação.");
    return;
}

}

function editarKit(i) {
    const k = kits[i];
    kitSku.value = k.sku;
    nomeKit.value = k.nome;
    kitCodigoFull.value = k.codigoFull;
    itensKit = [...k.itens];
    editandoKit = i;
    renderItensKit();
    openKitPopUp();
}

/***********************
 * SEPARAÇÃO (CORRIGIDA SEM REMOVER NADA)
 ***********************/
function preencherDatalistSeparacao() {
    datalistSeparacao.innerHTML = "";
    produtos.forEach(p => datalistSeparacao.append(new Option(p.sku, p.sku)));
    kits.forEach(k => datalistSeparacao.append(new Option(`KIT:${k.sku}`, `KIT:${k.sku}`)));
}

function adicionarSeparacao() {
    const valor = inputSeparacao.value.trim();
    const qtd = Number(qtdSeparacao.value);
    if (!valor || qtd <= 0) return alert("Dados inválidos");

    if (editandoSeparacaoIndex !== null) {
        separacao[editandoSeparacaoIndex] = { valor, qtd };
        editandoSeparacaoIndex = null;
    } else {
        separacao.push({ valor, qtd });
    }

    inputSeparacao.value = "";
    qtdSeparacao.value = 1;
    renderSeparacao();
}

function renderSeparacao() {
    separacaoTableBody.innerHTML = "";

    const kitsSep = separacao
        .map((item, index) => ({ ...item, index }))
        .filter(i => i.valor.startsWith("KIT:"));

    const avulsosSep = separacao
        .map((item, index) => ({ ...item, index }))
        .filter(i => !i.valor.startsWith("KIT:"));

    if (kitsSep.length) {
        separacaoTableBody.innerHTML += `<tr><th colspan="5">KITS</th></tr>`;
    }

    kitsSep.forEach(item => {
        const kit = kits.find(k => k.sku === item.valor.replace("KIT:", ""));

        separacaoTableBody.innerHTML += `
        <tr class="kit-row ${item.index === editandoSeparacaoIndex ? 'editando' : ''}">
            <td>${kit?.sku || "KIT REMOVIDO"}</td>
            <td>${kit?.nome || ""}</td>
            <td>${item.qtd}</td>
            <td>${kit?.codigoFull || ""}</td>
            <td>
                <button onclick="editarSeparacao(${item.index})">Editar</button>
                <button onclick="removerSeparacao(${item.index})">X</button>
            </td>
        </tr>`;

        kit?.itens.forEach(it => {
            const p = produtos.find(pr => pr.sku === it.sku);
            separacaoTableBody.innerHTML += `
            <tr class="product-row">
                <td>${it.sku}</td>
                <td>${p?.nome || "NÃO CADASTRADO"}</td>
                <td>${it.qtd * item.qtd}</td>
                <td>${p?.codigoFull || ""}</td>
                <td></td>
            </tr>`;
        });
    });

    if (avulsosSep.length) {
        separacaoTableBody.innerHTML += `<tr><th colspan="5">PRODUTOS AVULSOS</th></tr>`;
    }

    avulsosSep.forEach(item => {
        const p = produtos.find(pr => pr.sku === item.valor);
        separacaoTableBody.innerHTML += `
        <tr class="${item.index === editandoSeparacaoIndex ? 'editando' : ''}">
            <td>${item.valor}</td>
            <td>${p?.nome || ""}</td>
            <td>${item.qtd}</td>
            <td>${p?.codigoFull || ""}</td>
            <td>
                <button onclick="editarSeparacao(${item.index})">Editar</button>
                <button onclick="removerSeparacao(${item.index})">X</button>
            </td>
        </tr>`;
    });
}

function removerSeparacao(i) {
    separacao.splice(i, 1);
    renderSeparacao();
}

function editarSeparacao(index) {
    const item = separacao[index];

    inputSeparacao.value = item.valor;
    qtdSeparacao.value = item.qtd;

    editandoSeparacaoIndex = index;
    renderSeparacao();
}

/***********************
 * RELATÓRIO + HISTÓRICO
 ***********************/
function gerarRelatorioProdutos() {
    if (!separacao.length) {
        alert("Nenhum item separado");
        return;
    }

    const mapa = {};

    separacao.forEach(item => {
        if (item.valor.startsWith("KIT:")) {
            const kit = kits.find(k => k.sku === item.valor.replace("KIT:", ""));
            if (!kit) return;

            kit.itens.forEach(it => {
                mapa[it.sku] = (mapa[it.sku] || 0) + (it.qtd * item.qtd);
            });
        } else {
            mapa[item.valor] = (mapa[item.valor] || 0) + item.qtd;
        }
    });
showTab("relatorios");

renderRelatorioProdutos(mapa);

historico.push({
    data: new Date().toLocaleString(),
    itens: mapa
});

localStorage.setItem("historico", JSON.stringify(historico));

}

function renderRelatorioProdutos(dados) {
    const tbody = document.getElementById("relatorioTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    Object.entries(dados).forEach(([sku, qtd]) => {
        const p = produtos.find(pr => pr.sku === sku);

        tbody.innerHTML += `
        <tr>
            <td>${sku}</td>
            <td>${p?.nome || "NÃO CADASTRADO"}</td>
            <td>${p?.localizacao || ""}</td>
            <td>${qtd}</td>
            <td></td>
        </tr>`;
    });
}

/***********************
 * CSV
 ***********************/
csvInput.addEventListener("change", () => {
    if (csvInput.files.length) {
        arquivoSelecionado.textContent = csvInput.files[0].name;
        btnRemoverArquivo.style.display = "inline-block";
    }
});

document.getElementById("uploadButton").onclick = () => {
    const file = csvInput.files[0];
    if (!file) return alert("Selecione um CSV");

    const reader = new FileReader();
    reader.onload = e => {
        const linhas = e.target.result.replace(/\r/g, "").split("\n").slice(1);
        linhas.forEach(l => {
            const [sku, nome, codigoFull = "", localizacao, estoque] = l.split(",");
            if (!sku || !nome || !localizacao || isNaN(estoque)) return;
            produtos.push({ sku, nome, codigoFull, localizacao, estoque: Number(estoque) });
        });
        salvarProdutos();
        renderProdutos();
        btnRemoverArquivo.onclick();
    };
    reader.readAsText(file, "UTF-8");
};

/***********************
 * INIT
 ***********************/
renderProdutos();
renderKits();

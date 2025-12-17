/* ===================== DADOS ===================== */

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let kits = JSON.parse(localStorage.getItem("kits")) || [];
let editingRow = null;

/* ===================== ABAS ===================== */

function showTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.style.display = "none";
    });
    document.getElementById(tabId).style.display = "block";
}

/* ===================== POPUP PRODUTO ===================== */

function openPopUp() {
    document.getElementById("popupCadastroItem").style.display = "block";
}

function closePopup() {
    document.getElementById("popupCadastroItem").style.display = "none";
    document.getElementById("newItemForm").reset();
    editingRow = null;
}

/* ===================== POPUP KIT ===================== */

function openKitPopUp() {
    document.getElementById("popupCadastroKit").style.display = "block";
    carregarProdutosNoKit();
}

function closeKitPopUp() {
    document.getElementById("popupCadastroKit").style.display = "none";
    document.getElementById("newKitForm").reset();
    document.getElementById("listaProdutosKit").innerHTML = "";
}

/* ===================== INIT ===================== */

document.addEventListener("DOMContentLoaded", () => {
    showTab("itens");
    renderProdutos();
    renderKits();

    document
        .getElementById("newItemForm")
        .addEventListener("submit", salvarProduto);

    document
        .getElementById("newKitForm")
        .addEventListener("submit", salvarKit);
});

/* ===================== PRODUTOS ===================== */

function salvarProduto(e) {
    e.preventDefault();

    const produto = {
        sku: sku.value.trim(),
        nome: nomeProduto.value.trim(),
        codigo: codigoFull.value.trim(),
        local: localizacao.value.trim(),
        estoque: Number(estoque.value)
    };

    if (!produto.sku || !produto.nome) return;

    produtos.push(produto);
    localStorage.setItem("produtos", JSON.stringify(produtos));

    renderProdutos();
    closePopup();
}

function renderProdutos() {
    const tbody = document.getElementById("productTableBody");
    tbody.innerHTML = "";

    produtos.forEach((p, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${p.sku}</td>
            <td>${p.nome}</td>
            <td>${p.codigo}</td>
            <td>${p.local}</td>
            <td>${p.estoque}</td>
            <td>
                <button onclick="excluirProduto(${index})">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function excluirProduto(index) {
    produtos.splice(index, 1);
    localStorage.setItem("produtos", JSON.stringify(produtos));
    renderProdutos();
}

/* ===================== KITS ===================== */

function carregarProdutosNoKit() {
    const container = document.getElementById("listaProdutosKit");
    container.innerHTML = "";

    produtos.forEach(prod => {
        if (prod.estoque <= 0) return;

        const linha = document.createElement("div");
        linha.className = "linha-kit";

        linha.innerHTML = `
            <select class="produto-kit">
                <option value="">Selecione um item</option>
                <option value="${prod.sku}">
                    ${prod.sku} - ${prod.nome} (Estoque: ${prod.estoque})
                </option>
            </select>

            <input type="number" class="qtd-kit" min="1" value="1">
        `;

        container.appendChild(linha);
    });
}

function salvarKit(e) {
    e.preventDefault();

    const itens = [];
    const linhas = document.querySelectorAll(".linha-kit");

    linhas.forEach(linha => {
        const sku = linha.querySelector(".produto-kit").value;
        const qtd = Number(linha.querySelector(".qtd-kit").value);

        if (sku && qtd > 0) {
            itens.push({ sku, qtd });
        }
    });

    if (!itens.length) {
        alert("Selecione ao menos um produto");
        return;
    }

    // valida estoque
    for (let item of itens) {
        const prod = produtos.find(p => p.sku === item.sku);
        if (!prod || prod.estoque < item.qtd) {
            alert(`Estoque insuficiente para o produto ${item.sku}`);
            return;
        }
    }

    // baixa estoque
    itens.forEach(item => {
        const prod = produtos.find(p => p.sku === item.sku);
        prod.estoque -= item.qtd;
    });

    const kit = {
        sku: kitSku.value.trim(),
        nome: nomeKit.value.trim(),
        codigo: kitCodigoFull.value.trim(),
        itens
    };

    kits.push(kit);

    localStorage.setItem("kits", JSON.stringify(kits));
    localStorage.setItem("produtos", JSON.stringify(produtos));

    renderProdutos();
    renderKits();
    closeKitPopUp();
}

function renderKits() {
    const tbody = document.getElementById("kitTableBody");
    tbody.innerHTML = "";

    kits.forEach(kit => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${kit.sku}</td>
            <td>${kit.nome}</td>
            <td>${kit.codigo || "-"}</td>
            <td>-</td>
            <td>-</td>
        `;

        tbody.appendChild(tr);
    });
}

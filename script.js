/* ===================== DADOS ===================== */

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let kits = JSON.parse(localStorage.getItem("kits")) || [];
let editingRow = null;
let itensKit = [];
let editingKitRow = null;
let kitsSeparacao = [];
let produtosSeparacao = [];

/* ===================== ABAS ===================== */

function showTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.style.display = "none";
    });
    document.getElementById(tabId).style.display = "block";

    if (tabId === 'separacao') {
        populateDatalistSeparacao();
    }
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
    itensKit = [];
    renderItensSelecionados();

    const select = document.getElementById("selectProduto");
    select.innerHTML = '<option value="">Selecione um item</option>';
    produtos.forEach(prod => {
        if (prod.estoque > 0) {
            const option = document.createElement("option");
            option.value = prod.sku;
            option.textContent = `${prod.sku} - ${prod.nome} (Estoque: ${prod.estoque})`;
            select.appendChild(option);
        }
    });
}

function closeKitPopUp() {
    document.getElementById("popupCadastroKit").style.display = "none";
    document.getElementById("newKitForm").reset();
    document.getElementById("listaProdutosKit").innerHTML = "";
    itensKit = [];
    renderItensSelecionados();
    editingKitRow = null;
}

function adicionarProdutoKit() {
    const sku = document.getElementById("inputProdutoKit").value;
    const qtd = Number(document.getElementById("qtdProdutoKit").value);
    if (!sku || qtd <= 0) return;

    itensKit.push({ sku, qtd });
    renderItensSelecionados();
    
    // Clear the search input and repopulate datalist with all products
    document.getElementById("inputProdutoKit").value = "";
    populateDatalistProdutosKit();
}

function renderItensSelecionados() {
    const container = document.getElementById("itensSelecionadosKit");
    container.innerHTML = "";
    if (itensKit.length === 0) {
        container.innerHTML = "<p style='color: #666; font-style: italic;'>Nenhum produto adicionado ainda.</p>";
        return;
    }
    itensKit.forEach((item, index) => {
        const prod = produtos.find(p => p.sku === item.sku);
        const itemDiv = document.createElement("div");
        itemDiv.className = "kit-item";
        
        itemDiv.innerHTML = `
            <div class="kit-item-info">
                <strong>${prod.nome}</strong><br>
                <span>SKU: ${prod.sku} | Quantidade: ${item.qtd}</span>
            </div>
            <button class="kit-item-remove" onclick="removerItemKit(${index})">×</button>
        `;
        
        container.appendChild(itemDiv);
    });
}

function removerItemKit(index) {
    itensKit.splice(index, 1);
    renderItensSelecionados();
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

    if (editingRow !== null) {
        produtos[editingRow] = produto;
    } else {
        produtos.push(produto);
    }

    localStorage.setItem("produtos", JSON.stringify(produtos));

    renderProdutos();
    closePopup();
}

function renderProdutos(filter = '') {
    const tbody = document.getElementById("productTableBody");
    tbody.innerHTML = "";

    const filteredProdutos = filter ? produtos.filter(p => 
        p.sku.toLowerCase().includes(filter) || 
        p.nome.toLowerCase().includes(filter) || 
        p.codigo.toLowerCase().includes(filter) || 
        p.local.toLowerCase().includes(filter)
    ) : produtos;

    filteredProdutos.forEach((p, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${p.sku}</td>
            <td>${p.nome}</td>
            <td>${p.codigo}</td>
            <td>${p.local}</td>
            <td>${p.estoque}</td>
            <td>
                <button onclick="excluirProduto(${index})">Excluir</button>
                <button onclick="editarProduto(${index})">Editar</button>
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

function editarProduto(index) {
    const produto = produtos[index];
    sku.value = produto.sku;
    nomeProduto.value = produto.nome;
    codigoFull.value = produto.codigo;
    localizacao.value = produto.local;
    estoque.value = produto.estoque;
    editingRow = index;
    openPopUp();
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

    const itens = itensKit;

    if (!itens.length) {
        alert("Selecione ao menos um produto");
        return;
    }

    const kit = {
        sku: kitSku.value.trim(),
        nome: nomeKit.value.trim(),
        codigo: kitCodigoFull.value.trim(),
        quantidade: Number(quantidadeKit.value) || 1,
        itens
    };

    if (editingKitRow !== null) {
        kits[editingKitRow] = kit;
    } else {
        kits.push(kit);
    }

    localStorage.setItem("kits", JSON.stringify(kits));

    renderProdutos();
    renderKits();
    closeKitPopUp();
}

function renderKits(filter = '') {
    const tbody = document.getElementById("kitTableBody");
    tbody.innerHTML = "";

    const filteredKits = filter ? kits.filter(kit => 
        kit.sku.toLowerCase().includes(filter) || 
        kit.nome.toLowerCase().includes(filter) || 
        (kit.codigo && kit.codigo.toLowerCase().includes(filter))
    ) : kits;

    filteredKits.forEach(kit => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${kit.sku}</td>
            <td>${kit.nome}</td>
            <td>${kit.codigo || "-"}</td>
            <td>${kit.quantidade || 1}</td>
            <td>
                <button onclick="excluirKit(${kits.indexOf(kit)})">Excluir</button>
                <button onclick="editarKit(${kits.indexOf(kit)})">Editar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function populateDatalistProdutosKit(filter = '') {
    const datalist = document.getElementById("datalistProdutosKit");
    datalist.innerHTML = "";
    
    const filteredProdutos = filter ? produtos.filter(prod => 
        prod.sku.toLowerCase().includes(filter) || 
        prod.nome.toLowerCase().includes(filter)
    ) : produtos;
    
    filteredProdutos.forEach(prod => {
        const option = document.createElement("option");
        option.value = prod.sku;
        option.label = `${prod.sku} - ${prod.nome} (Estoque: ${prod.estoque})`;
        datalist.appendChild(option);
    });
}

function populateDatalistSeparacao(filter = '') {
    const datalist = document.getElementById("datalistSeparacao");
    datalist.innerHTML = "";
    
    const filteredKits = filter ? kits.filter(kit => 
        kit.sku.toLowerCase().includes(filter) || 
        kit.nome.toLowerCase().includes(filter)
    ) : kits;
    
    const filteredProdutos = filter ? produtos.filter(prod => 
        prod.sku.toLowerCase().includes(filter) || 
        prod.nome.toLowerCase().includes(filter)
    ) : produtos;
    
    filteredKits.forEach((kit, index) => {
        const option = document.createElement("option");
        option.value = `kit-${index}`;
        option.label = `${kit.sku} - ${kit.nome} (Kit)`;
        datalist.appendChild(option);
    });
    
    filteredProdutos.forEach(prod => {
        const option = document.createElement("option");
        option.value = `produto-${prod.sku}`;
        option.label = `${prod.sku} - ${prod.nome} (Produto)`;
        datalist.appendChild(option);
    });
}

function adicionarSeparacao() {
    const value = document.getElementById("inputSeparacao").value;
    const qtd = Number(document.getElementById("qtdSeparacao").value);
    if (!value || qtd <= 0) return;
    const parts = value.split('-');
    if (parts[0] === 'kit') {
        const index = Number(parts[1]);
        kitsSeparacao.push({ index, qtd });
    } else if (parts[0] === 'produto') {
        const sku = parts[1];
        produtosSeparacao.push({ sku, qtd });
    }
    gerarSeparacao();
    // clear and repopulate
    document.getElementById("inputSeparacao").value = "";
    document.getElementById("qtdSeparacao").value = "1";
    populateDatalistSeparacao();
}

function gerarSeparacao() {
    const tbody = document.getElementById("separacaoTableBody");
    tbody.innerHTML = "";
    // Add report header
    const headerTr = document.createElement("tr");
    headerTr.innerHTML = `
        <td colspan="5" style="text-align: center; font-size: 18px; font-weight: bold; padding: 10px;">
            Relatório de Produtos - ${new Date().toLocaleDateString('pt-BR')}
        </td>
    `;
    tbody.appendChild(headerTr);
    kitsSeparacao.forEach((sep, idx) => {
        const kit = kits[sep.index];
        // Kit row with actions
        const kitTr = document.createElement("tr");
        kitTr.className = "kit-row";
        kitTr.innerHTML = `
            <td>${kit.sku}</td>
            <td>${kit.nome}</td>
            <td>${sep.qtd}</td>
            <td>${kit.codigo || "-"}</td>
            <td>
                <button onclick="editarSeparacao('kit', ${idx})">Editar</button>
                <button onclick="removerSeparacao('kit', ${idx})">Remover</button>
            </td>
        `;
        tbody.appendChild(kitTr);
        // Product rows
        kit.itens.forEach(item => {
            const prod = produtos.find(p => p.sku === item.sku);
            if (prod) {
                const prodTr = document.createElement("tr");
                prodTr.className = "product-row";
                prodTr.innerHTML = `
                    <td>${item.sku}</td>
                    <td>${prod.nome}</td>
                    <td>${item.qtd * sep.qtd}</td>
                    <td>-</td>
                    <td>-</td>
                `;
                tbody.appendChild(prodTr);
            }
        });
    });
    if (produtosSeparacao.length > 0) {
        // Separator row
        const separatorTr = document.createElement("tr");
        separatorTr.className = "separator-row";
        separatorTr.innerHTML = `
            <td colspan="5" style="text-align: center; font-weight: bold; background-color: #ddd;">Itens Isolados</td>
        `;
        tbody.appendChild(separatorTr);
        // Standalone products
        produtosSeparacao.forEach((sep, idx) => {
            const prod = produtos.find(p => p.sku === sep.sku);
            if (prod) {
                const prodTr = document.createElement("tr");
                prodTr.className = "product-row";
                prodTr.innerHTML = `
                    <td>${prod.sku}</td>
                    <td>${prod.nome}</td>
                    <td>${sep.qtd}</td>
                    <td>${prod.codigo || "-"}</td>
                    <td>
                        <button onclick="editarSeparacao('produto', ${idx})">Editar</button>
                        <button onclick="removerSeparacao('produto', ${idx})">Remover</button>
                    </td>
                `;
                tbody.appendChild(prodTr);
            }
        });
    }
}

function editarSeparacao(type, idx) {
    let currentQtd;
    if (type === 'kit') {
        currentQtd = kitsSeparacao[idx].qtd;
    } else {
        currentQtd = produtosSeparacao[idx].qtd;
    }
    const newQtd = prompt("Nova quantidade:", currentQtd);
    if (newQtd && Number(newQtd) > 0) {
        if (type === 'kit') {
            kitsSeparacao[idx].qtd = Number(newQtd);
        } else {
            produtosSeparacao[idx].qtd = Number(newQtd);
        }
        gerarSeparacao();
    }
}

function removerSeparacao(type, idx) {
    if (type === 'kit') {
        kitsSeparacao.splice(idx, 1);
    } else {
        produtosSeparacao.splice(idx, 1);
    }
    gerarSeparacao();
}

function gerarRelatorioProdutos() {
    const tbody = document.getElementById("relatorioTableBody");
    tbody.innerHTML = "";
    // Set title
    const titleDiv = document.getElementById("relatorioTitle");
    titleDiv.textContent = `Relatório Consolidado de Produtos - 02/01/2026`;
    titleDiv.style.display = "block";
    // Aggregate quantities
    const productTotals = new Map();
    // From kits
    kitsSeparacao.forEach(sep => {
        const kit = kits[sep.index];
        kit.itens.forEach(item => {
            const prod = produtos.find(p => p.sku === item.sku);
            if (prod) {
                const sku = item.sku;
                const qty = item.qtd * sep.qtd;
                if (productTotals.has(sku)) {
                    productTotals.set(sku, productTotals.get(sku) + qty);
                } else {
                    productTotals.set(sku, qty);
                }
            }
        });
    });
    // From isolated products
    produtosSeparacao.forEach(sep => {
        const prod = produtos.find(p => p.sku === sep.sku);
        if (prod) {
            const sku = sep.sku;
            const qty = sep.qtd;
            if (productTotals.has(sku)) {
                productTotals.set(sku, productTotals.get(sku) + qty);
            } else {
                productTotals.set(sku, qty);
            }
        }
    });
    // Display
    productTotals.forEach((totalQty, sku) => {
        const prod = produtos.find(p => p.sku === sku);
        if (prod) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${sku}</td>
                <td>${prod.nome}</td>
                <td>${prod.local}</td>
                <td>${totalQty}</td>
                <td><input type="checkbox"></td>
            `;
            tbody.appendChild(tr);
        }
    });
}

function importarDados() {
    const csvText = document.getElementById("csvInput").value;
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('SKU,'));
    const statusDiv = document.getElementById("importStatus");
    statusDiv.innerHTML = "";
    let importedProdutos = 0;
    lines.forEach(line => {
        const cols = line.split(',').map(col => col.trim());
        if (cols.length >= 5) {
            const sku = cols[0];
            const nome = cols[1];
            const codigo = cols[2];
            const local = cols[3];
            const estoque = parseInt(cols[4]) || 0;
            if (sku && nome) {
                const existing = produtos.find(p => p.sku === sku);
                if (!existing) {
                    produtos.push({ sku, nome, codigo, local, estoque });
                    importedProdutos++;
                }
            }
        }
    });
    localStorage.setItem("produtos", JSON.stringify(produtos));
    statusDiv.innerHTML = `Importado: ${importedProdutos} produtos.`;
    // Refresh tables if needed
    if (document.getElementById("itens").style.display !== "none") {
        renderProdutos();
    }
}

function excluirKit(index) {
    kits.splice(index, 1);
    localStorage.setItem("kits", JSON.stringify(kits));
    renderKits();
}

function editarKit(index) {
    editingKitRow = index;
    const kit = kits[index];
    // set form
    kitSku.value = kit.sku;
    nomeKit.value = kit.nome;
    kitCodigoFull.value = kit.codigo || '';
    quantidadeKit.value = kit.quantidade || 1;
    itensKit = kit.itens.map(item => ({...item}));
    renderItensSelecionados();
    // populate select
    const select = document.getElementById("selectProduto");
    select.innerHTML = '<option value="">Selecione um item</option>';
    produtos.forEach(prod => {
        const option = document.createElement("option");
        option.value = prod.sku;
        option.textContent = `${prod.sku} - ${prod.nome} (Estoque: ${prod.estoque})`;
        select.appendChild(option);
    });
    document.getElementById("popupCadastroKit").style.display = "block";
}

// Event listeners
document.getElementById("uploadButton").addEventListener("click", importarDados);
document.getElementById("downloadTemplateButton").addEventListener("click", baixarModeloCSV);

function baixarModeloCSV() {
    const csvContent = `"SKU","Nome","Codigo Full","Localizacao","Estoque"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_produtos.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importarDados() {
    const fileInput = document.getElementById("csvFileInput");
    const file = fileInput.files[0];
    if (!file) {
        document.getElementById("importStatus").innerHTML = "Selecione um arquivo CSV primeiro.";
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const csvText = e.target.result;
        const lines = csvText.split('\n').map(line => line.trim()).filter(line => line && !line.includes('A: SKU'));
        const statusDiv = document.getElementById("importStatus");
        statusDiv.innerHTML = "";
        let importedProdutos = 0;
        lines.forEach(line => {
            const cols = line.split(/[,;]/).map(col => col.trim().replace(/^["']|["']$/g, '')); // remove quotes or single quotes
            if (cols.length >= 5) {
                const sku = cols[0];
                const nome = cols[1];
                const codigo = cols[2];
                const local = cols[3];
                const estoque = parseInt(cols[4]) || 0;
                if (sku && nome && sku !== 'A: SKU') {
                    const existing = produtos.find(p => p.sku === sku);
                    if (!existing) {
                        produtos.push({ sku, nome, codigo, local, estoque });
                        importedProdutos++;
                    }
                }
            }
        });
        localStorage.setItem("produtos", JSON.stringify(produtos));
        statusDiv.innerHTML = `Importado: ${importedProdutos} produtos.`;
        // Refresh tables if needed
        if (document.getElementById("itens").style.display !== "none") {
            renderProdutos();
        }
    };
    reader.onerror = function() {
        document.getElementById("importStatus").innerHTML = "Erro ao ler o arquivo.";
    };
    reader.readAsText(file);
}

function openKitPopup() {
    // Populate datalist with products
    populateDatalistProdutosKit();
    // Reset form
    document.getElementById("newKitForm").reset();
    itensKit = [];
    renderItensSelecionados();
    // Open popup
    document.getElementById("popupCadastroKit").style.display = "block";
}

// Search functionality
document.getElementById("searchProdutos").addEventListener("input", function() {
    renderProdutos(this.value.toLowerCase());
});

document.getElementById("searchKits").addEventListener("input", function() {
    renderKits(this.value.toLowerCase());
});

document.getElementById("inputSeparacao").addEventListener("input", function() {
    populateDatalistSeparacao(this.value.toLowerCase());
});

document.getElementById("inputProdutoKit").addEventListener("input", function() {
    populateDatalistProdutosKit(this.value.toLowerCase());
});

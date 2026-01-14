/***********************
 * FIREBASE
 ***********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCMOOpIoaurHT2CyhHEN4vZxGmzedhaIwM",
  authDomain: "separacaofull.firebaseapp.com",
  databaseURL: "https://separacaofull-default-rtdb.firebaseio.com",
  projectId: "separacaofull",
  storageBucket: "separacaofull.firebasestorage.app",
  messagingSenderId: "137169730444",
  appId: "1:137169730444:web:0ed636854db0fe6f4734a9",
  measurementId: "G-LVQ56WFB5G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const produtosCol = collection(db, "produtos");
const kitsCol = collection(db, "kits");
const historicoCol = collection(db, "historico");

/***********************
 * STORAGE
 ***********************/
let produtos = [];
let kits = [];
let separacao = [];
let editandoSeparacaoIndex = null;
let historico = [];
let currentPageProdutos = 1;
let currentPageKits = 1;
let produtoEditandoId = null;

// ===============================
// PESQUISA DE PRODUTOS
// ===============================
const inputPesquisaProdutos = document.getElementById("searchProdutos");

if (inputPesquisaProdutos) {
    inputPesquisaProdutos.addEventListener("input", () => {
        const termo = inputPesquisaProdutos.value.toLowerCase();

        const filtrados = produtos.filter(p =>
            p.sku.toLowerCase().includes(termo) ||
            p.nome.toLowerCase().includes(termo) ||
            (p.codigoFull || "").toLowerCase().includes(termo)
        );

        currentPageProdutos = 1;
        renderProdutos(filtrados, currentPageProdutos);
    });
}

// ===============================
// PESQUISA DE KITS
// ===============================
const inputPesquisaKits = document.getElementById("searchKits");

if (inputPesquisaKits) {
    inputPesquisaKits.addEventListener("input", () => {
        const termo = inputPesquisaKits.value.toLowerCase();

        const filtrados = kits.filter(k =>
            k.sku.toLowerCase().includes(termo) ||
            k.nome.toLowerCase().includes(termo) ||
            (k.codigoFull || "").toLowerCase().includes(termo)
        );

        currentPageKits = 1;
        renderKits(filtrados, currentPageKits);
    });
}

// ===============================
// PESQUISA MODAL SELEÇÃO
// ===============================
const searchSelecao = document.getElementById("searchSelecao");

if (searchSelecao) {
    searchSelecao.addEventListener("input", popularListaSelecao);
}

async function carregarProdutos() {
    const snapshot = await getDocs(produtosCol);
    produtos = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    renderProdutos(produtos, currentPageProdutos);
}

async function carregarKits() {
    const snapshot = await getDocs(kitsCol);
    kits = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    renderKits(kits, currentPageKits);
}

async function carregarHistorico() {
    const snapshot = await getDocs(historicoCol);
    historico = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
}

/***********************
 * ELEMENTOS
 ***********************/
const separacaoKitsBody = document.getElementById("separacaoKitsBody");
const separacaoAvulsosBody = document.getElementById("separacaoAvulsosBody");

// === INPUTS PRODUTO ===
const sku = document.getElementById("sku");
const nomeProduto = document.getElementById("nomeProduto");
const codigoFull = document.getElementById("codigoFull");
const localizacao = document.getElementById("localizacao");
const estoque = document.getElementById("estoque");
// === INPUTS KIT ===
const kitSku = document.getElementById("kitSku");
const nomeKit = document.getElementById("nomeKit");
const kitCodigoFull = document.getElementById("kitCodigoFull");
const inputProdutoKit = document.getElementById("inputProdutoKit");
const qtdProdutoKit = document.getElementById("qtdProdutoKit");
const itensSelecionadosKit = document.getElementById("itensSelecionadosKit");
// === INPUTS SEPARAÇÃO ===
const qtdSeparacao = document.getElementById("qtdSeparacao");
// === TABELAS ===
const productTableBody = document.getElementById("productTableBody");
const kitTableBody = document.getElementById("kitTableBody");
const separacaoTableBody = document.getElementById("separacaoTableBody");
const csvInput = document.getElementById("csvFileInput");
const arquivoSelecionado = document.getElementById("arquivoSelecionado");

const popupCadastroItem = document.getElementById("popupCadastroItem");
const popupCadastroKit = document.getElementById("popupCadastroKit");
const newKitForm = document.getElementById("newKitForm");

const datalistProdutosKit = document.getElementById("datalistProdutosKit");

/***********************
 * POPUPS
 ***********************/
function openPopUp() {
    popupCadastroItem.style.display = "block";
    document.body.classList.add('modal-open');
}
function closePopup() {
    popupCadastroItem.style.display = "none";
    document.getElementById("newItemForm").reset();
    document.body.classList.remove('modal-open');
}

function openKitPopUp() {
    popupCadastroKit.style.display = "block";
    atualizarDatalistProdutosKit();
    document.body.classList.add('modal-open');
}
function closeKitPopUp() {
    popupCadastroKit.style.display = "none";
    newKitForm.reset();
    itensKit = [];
    editandoKit = null;
    renderItensKit();
    document.body.classList.remove('modal-open');
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

    // Removed preencherDatalistSeparacao call since datalist was removed
}

/***********************
 * PRODUTOS
 ***********************/
async function salvarProdutoFirebase(produto) {
    
    if (produto.id) {
        const docRef = doc(db, "produtos", produto.id);
        await updateDoc(docRef, produto);
    } else {
        const docRef = await addDoc(produtosCol, produto);
        produto.id = docRef.id;
    }
}
async function salvarTodosProdutosFirebase() {
    for (const p of produtos) {
        await salvarProdutoFirebase(p);
    }
}

// ===============================
// FUNÇÃO GENÉRICA PARA RENDERIZAR TABELAS
// ===============================
function renderTable(tableBody, lista, page, itemsPerPage, columns, actions) {
    const totalPages = Math.ceil(lista.length / itemsPerPage);
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = lista.slice(start, end);

    tableBody.innerHTML = "";
    pageItems.forEach((item, i) => {
        let rowHtml = "<tr>";

        columns.forEach(col => {
            rowHtml += `<td>${item[col] || ""}</td>`;
        });

        if (actions) {
            rowHtml += `<td>${actions(item)}</td>`;
        }

        rowHtml += "</tr>";
        tableBody.innerHTML += rowHtml;
    });

    return totalPages;
}

function renderProdutos(lista = produtos, page = 1) {
    const itemsPerPage = 15;
    const columns = ["sku", "nome", "codigoFull", "localizacao", "estoque"];
    const actions = (item) => `
        <button onclick="editarProduto('${item.sku}')">Editar</button>
        <button onclick="excluirProduto('${item.sku}')">Excluir</button>
    `;

    const totalPages = renderTable(productTableBody, lista, page, itemsPerPage, columns, actions);
    renderPagination('produtos', totalPages, page);
}

function renderKits(lista = kits, page = 1) {
    const itemsPerPage = 15;
    const columns = ["sku", "nome", "codigoFull"];
    const actions = (item) => `
        <button onclick="editarKit('${item.sku}')">Editar</button>
        <button onclick="excluirKit('${item.sku}')">Excluir</button>
    `;

    const totalPages = renderTable(kitTableBody, lista, page, itemsPerPage, columns, actions);
    renderPagination('kits', totalPages, page);
}

function renderPagination(type, totalPages, currentPage) {
    const containerId = type === 'produtos' ? 'itens' : 'kits';
    const container = document.getElementById(containerId);
    if (!container) return;

    // Remove existing pagination
    const existing = container.querySelector('.pagination');
    if (existing) existing.remove();

    if (totalPages <= 1) return;

    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';

    // Botão Anterior
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '◀ Anterior';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => changePage(type, currentPage - 1);
    paginationDiv.appendChild(prevBtn);

    // Botões numéricos (limitando a exibição)
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.onclick = () => changePage(type, i);
        paginationDiv.appendChild(btn);
    }

    // Botão Próximo
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Próximo ▶';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => changePage(type, currentPage + 1);
    paginationDiv.appendChild(nextBtn);

    container.appendChild(paginationDiv);
}

function changePage(type, page) {
    if (type === 'produtos') {
        currentPageProdutos = page;
        const termo = inputPesquisaProdutos?.value.toLowerCase() || '';
        const lista = termo ? produtos.filter(p =>
            p.sku.toLowerCase().includes(termo) ||
            p.nome.toLowerCase().includes(termo) ||
            (p.codigoFull || "").toLowerCase().includes(termo)
        ) : produtos;
        renderProdutos(lista, page);
    } else {
        currentPageKits = page;
        const termo = inputPesquisaKits?.value.toLowerCase() || '';
        const lista = termo ? kits.filter(k =>
            k.sku.toLowerCase().includes(termo) ||
            k.nome.toLowerCase().includes(termo) ||
            (k.codigoFull || "").toLowerCase().includes(termo)
        ) : kits;
        renderKits(lista, page);
    }
}

document.getElementById("newItemForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        const produto = {
            sku: sku.value.trim(),
            nome: nomeProduto.value.trim(),
            codigoFull: codigoFull.value.trim(),
            localizacao: localizacao.value.trim(),
            estoque: Number(estoque.value)
        };

        if (produtoEditandoId) {
            produto.id = produtoEditandoId;

            const index = produtos.findIndex(p => p.id === produtoEditandoId);
            if (index !== -1) produtos[index] = produto;

            await salvarProdutoFirebase(produto);
        } else {
            await salvarProdutoFirebase(produto);
            produtos.push(produto);
        }

        produtoEditandoId = null;

        renderProdutos(produtos, currentPageProdutos);
        atualizarDatalistProdutosKit();
        closePopup();

    } catch (erro) {
        console.error("ERRO AO SALVAR PRODUTO:", erro);
        alert("Erro ao salvar produto.");
    }
});

function editarProduto(skuSelecionado) {
    const p = produtos.find(p => p.sku === skuSelecionado);
    if (!p) return;

    produtoEditandoId = p.id || null;

    sku.value = p.sku;
    nomeProduto.value = p.nome;
    codigoFull.value = p.codigoFull || "";
    localizacao.value = p.localizacao;
    estoque.value = p.estoque;

    openPopUp();
}


async function excluirProduto(sku) {
    if (!confirm("Excluir produto?")) return;

    const index = produtos.findIndex(p => p.sku === sku);
    const p = produtos[index];
    if (p.id) {
        await deleteDoc(doc(db, "produtos", p.id));
    }

    produtos.splice(index, 1);
    renderProdutos(produtos, currentPageProdutos);
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

newKitForm.addEventListener("submit", async e => {
    e.preventDefault();

    const kit = {
        sku: kitSku.value.trim(),
        nome: nomeKit.value.trim(),
        codigoFull: kitCodigoFull.value.trim(),
        itens: [...itensKit]
    };

    await salvarKitFirebase(kit);

    if (editandoKit !== null) kits[editandoKit] = kit;
    else kits.push(kit);

    renderKits(kits, currentPageKits);
    closeKitPopUp();
});

    async function salvarKitFirebase(kit) {
    if (kit.id) {
        const docRef = doc(db, "kits", kit.id);
        await updateDoc(docRef, kit);
    } else {
        const docRef = await addDoc(kitsCol, kit);
        kit.id = docRef.id;
    }
}

async function excluirKit(sku) {
    const index = kits.findIndex(k => k.sku === sku);
    const kit = kits[index];

    // Primeiro verifica se o kit está sendo usado na separação
    if (separacao.some(s => s.valor === `KIT:${kit.sku}`)) {
        alert("Este kit está em uso na separação.");
        return;
    }

    if (!confirm(`Excluir o kit "${kit.nome}"?`)) return;

    // Remove da separação (mesmo que não existam, só garante)
    separacao = separacao.filter(s => s.valor !== `KIT:${kit.sku}`);

    // Deleta do Firebase
    if (kit.id) {
        await deleteDoc(doc(db, "kits", kit.id));
    }

    // Remove do array local
    kits.splice(index, 1);

    renderKits(kits, currentPageKits);
    renderSeparacao();
}

function editarKit(sku) {
    const index = kits.findIndex(k => k.sku === sku);
    const k = kits[index];
    kitSku.value = k.sku;
    nomeKit.value = k.nome;
    kitCodigoFull.value = k.codigoFull;
    itensKit = [...k.itens];
    editandoKit = index;
    renderItensKit();
    openKitPopUp();
}

/***********************
 * SEPARAÇÃO (CORRIGIDA SEM REMOVER NADA)
 ***********************/
async function adicionarSeparacao() {
    const valor = window.selecaoAtual;
    const qtd = Number(qtdSeparacao.value);

    if (!valor || qtd <= 0) {
        alert("Selecione um produto ou kit primeiro");
        return;
    }

    const existeProduto = produtos.some(p => p.sku === valor);
    const existeKit = kits.some(k => `KIT:${k.sku}` === valor);

    if (!existeProduto && !existeKit) {
        alert("Produto ou kit não cadastrado");
        return;
    }

    if (editandoSeparacaoIndex !== null) {
        separacao[editandoSeparacaoIndex] = { valor, qtd };
        editandoSeparacaoIndex = null;
    } else {
    separacao.push({
        valor,
        qtd
     });
    }


    window.selecaoAtual = null;
    qtdSeparacao.value = 1;
    document.getElementById("selecaoDisplay").textContent = "Selecionar Produto ou Kit";
    renderSeparacao();
    await salvarSeparacaoFirebase();
}

function renderSeparacao() {
    separacaoKitsBody.innerHTML = "";
    separacaoAvulsosBody.innerHTML = "";

    const kitsSep = separacao
        .map((item, index) => ({ ...item, index }))
        .filter(i => i.valor.startsWith("KIT:"));

    const avulsosSep = separacao
        .map((item, index) => ({ ...item, index }))
        .filter(i => !i.valor.startsWith("KIT:"));

    // ===== KITS =====
    kitsSep.forEach(item => {
        const kit = kits.find(k => k.sku === item.valor.replace("KIT:", ""));

        separacaoKitsBody.innerHTML += `
        <tr class="kit-row">
            <td>${kit?.sku || ""}</td>
            <td>${kit?.nome || ""}</td>
            <td>${kit?.codigoFull || ""}</td>
            <td>${item.qtd}</td>
            <td>KIT</td>
            <td class="no-print">
                <button onclick="editarSeparacao(${item.index})">Editar</button>
                <button onclick="removerSeparacao(${item.index})">X</button>
            </td>
        </tr>
        `;

        kit?.itens.forEach(it => {
            const p = produtos.find(pr => pr.sku === it.sku);
            separacaoKitsBody.innerHTML += `
            <tr class="kit-produto">
                <td>${it.sku}</td>
                <td>${p?.nome || "NÃO CADASTRADO"}</td>
                <td>${p?.codigoFull || ""}</td>
                <td>x${it.qtd}</td>
                <td></td>
                <td class="no-print"></td>
            </tr>
            `;
        });
    });

    // ===== AVULSOS =====
    avulsosSep.forEach(item => {
        const p = produtos.find(pr => pr.sku === item.valor);
        separacaoAvulsosBody.innerHTML += `
        <tr class="${item.index === editandoSeparacaoIndex ? 'editando' : ''}">
            <td>${item.valor}</td>
            <td>${p?.nome || ""}</td>
            <td>${p?.codigoFull || ""}</td>
            <td>${item.qtd}</td>
            <td></td>
            <td class="no-print">
                <button onclick="editarSeparacao(${item.index})">Editar</button>
                <button onclick="removerSeparacao(${item.index})">X</button>
            </td>
        </tr>
        `;
    });
}

function atualizarTituloPedido() {
    const numero = document.getElementById("numeroPedido").value;
    document.getElementById("displayPedido").textContent = numero ? `Pedido: ${numero}` : "";
}
window.atualizarTituloPedido = atualizarTituloPedido;


async function removerSeparacao(i) {
    separacao.splice(i, 1);
    renderSeparacao();
    await salvarSeparacaoFirebase();
}

function editarSeparacao(index) {
    const item = separacao[index];

    const isKit = item.valor.startsWith("KIT:");
    let nome = "";
    let codigo = "";

    if (isKit) {
        const kit = kits.find(k => k.sku === item.valor.replace("KIT:", ""));
        nome = kit?.nome || "";
        codigo = kit?.codigoFull || "";
    } else {
        const p = produtos.find(pr => pr.sku === item.valor);
        nome = p?.nome || "";
        codigo = p?.codigoFull || "";
    }

    document.getElementById("editLinhaRef").value = index;
    document.getElementById("editSku").value = item.valor;
    document.getElementById("editDescricao").value = nome;
    document.getElementById("editCodigoFull").value = codigo;
    document.getElementById("editQtd").value = item.qtd;
    document.getElementById("editObs").value = isKit ? "KIT" : "";

    document.getElementById("modalEditar").style.display = "flex";
    document.body.classList.add('modal-open');
}

function salvarEdicao() {
    const index = Number(document.getElementById("editLinhaRef").value);
    const qtdNova = Number(document.getElementById("editQtd").value);

    if (qtdNova <= 0 || isNaN(qtdNova)) {
        alert("Quantidade inválida");
        return;
    }

    const item = separacao[index];

    // === PRODUTO AVULSO ===
    if (!item.valor.startsWith("KIT:")) {
        const produto = produtos.find(p => p.sku === item.valor);

        if (produto && qtdNova > produto.estoque) {
            alert(`Estoque insuficiente.\nDisponível: ${produto.estoque}`);
            return;
        }
    }

    // === KIT ===
    if (item.valor.startsWith("KIT:")) {
        const kit = kits.find(k => `KIT:${k.sku}` === item.valor);
        if (kit) {
            for (const it of kit.itens) {
                const prod = produtos.find(p => p.sku === it.sku);
                if (!prod) continue;

                const necessario = it.qtd * qtdNova;
                if (necessario > prod.estoque) {
                    alert(
                        `Estoque insuficiente para o kit.\n` +
                        `${prod.nome}\nNecessário: ${necessario} | Disponível: ${prod.estoque}`
                    );
                    return;
                }
            }
        }
    }

    // SALVA
    separacao[index].qtd = qtdNova;

    fecharModal();
    renderSeparacao();
    salvarSeparacaoFirebase();
}

function fecharModal() {
    document.getElementById("modalEditar").style.display = "none";
    document.body.classList.remove('modal-open');
}

/***********************
 * MODAL SELEÇÃO PRODUTO/KIT
 ***********************/
function abrirModalSelecao() {
    const modal = document.getElementById("modalSelecao");
    modal.style.display = "flex";
    document.body.classList.add('modal-open');
    
    // Limpar busca
    document.getElementById("searchSelecao").value = "";
    popularListaSelecao();
    
    // Focar no campo de busca
    document.getElementById("searchSelecao").focus();
    
    // Fechar modal ao clicar fora
    modal.onclick = function(event) {
        if (event.target === modal) {
            fecharModalSelecao();
        }
    };
}

function fecharModalSelecao() {
    document.getElementById("modalSelecao").style.display = "none";
    document.body.classList.remove('modal-open');
}

function popularListaSelecao() {
    const lista = document.getElementById("listaSelecao");
    const search = document.getElementById("searchSelecao").value.toLowerCase();
    
    let html = "";
    
    // Adicionar kits
    kits.forEach(kit => {
        if (search === "" || 
            kit.sku.toLowerCase().includes(search) || 
            kit.nome.toLowerCase().includes(search) ||
            (kit.codigoFull || "").toLowerCase().includes(search)) {
            html += `<div class="item-selecao" data-sku="KIT:${kit.sku}" onclick="selecionarItem(this.dataset.sku)">
                <strong>KIT: ${kit.sku}</strong> - ${kit.nome} ${kit.codigoFull ? `(${kit.codigoFull})` : ''}
            </div>`;
        }
    });
    
    // Adicionar produtos
    produtos.forEach(prod => {
        if (search === "" || 
            prod.sku.toLowerCase().includes(search) || 
            prod.nome.toLowerCase().includes(search) ||
            (prod.codigoFull || "").toLowerCase().includes(search)) {
            html += `<div class="item-selecao" data-sku="${prod.sku}" onclick="selecionarItem(this.dataset.sku)">
                <strong>${prod.sku}</strong> - ${prod.nome} ${prod.codigoFull ? `(${prod.codigoFull})` : ''}
            </div>`;
        }
    });
    
    lista.innerHTML = html;
}

function selecionarItem(sku) {
    // Armazenar o SKU selecionado
    window.selecaoAtual = sku;
    
    // Atualizar display do botão
    const display = document.getElementById("selecaoDisplay");
    if (sku.startsWith("KIT:")) {
        const kitSku = sku.replace("KIT:", "");
        const kit = kits.find(k => k.sku === kitSku);
        display.textContent = `KIT: ${kit ? kit.nome : kitSku}`;
    } else {
        const prod = produtos.find(p => p.sku === sku);
        display.textContent = prod ? prod.nome : sku;
    }
    
    fecharModalSelecao();
}

/***********************
 * RELATÓRIO + HISTÓRICO
 ***********************/
async function gerarRelatorioProdutos() {
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

    const histItem = {
        data: new Date().toLocaleString(),
        itens: mapa
    };

    await addDoc(historicoCol, histItem);
    historico.push(histItem);
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
                    <td><input type="checkbox"></td>
                </tr>
            `;
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

document.getElementById("downloadTemplateButton").onclick = () => {
    const csv = "sku,nome,codigoFull,localizacao,estoque\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo_produtos.csv";
    a.click();

    URL.revokeObjectURL(url);
};

document.getElementById("uploadButton").onclick = () => {
    const file = csvInput.files[0];
    if (!file) return alert("Selecione um CSV");

    const reader = new FileReader();

    reader.onload = async e => {
        const linhas = e.target.result
            .replace(/\r/g, "")
            .split("\n")
            .slice(1); // remove cabeçalho

        let novos = 0;
        let atualizados = 0;

        for (const l of linhas) {
            if (!l.trim()) continue;

            const colunas = l.includes(";") ? l.split(";") : l.split(",");
            const [sku, nome, codigoFull = "", localizacao, estoque] = colunas;


            if (!sku || !nome || !localizacao || isNaN(estoque)) continue;

            const existingIndex = produtos.findIndex(p => p.sku === sku.trim());

            if (existingIndex !== -1) {
                // Atualiza localização e estoque do produto existente
                produtos[existingIndex].localizacao = localizacao.trim();
                produtos[existingIndex].estoque = Number(estoque);
                await salvarProdutoFirebase(produtos[existingIndex]);
                atualizados++;
            } else {
                // Adiciona novo produto
                const produto = {
                    sku: sku.trim(),
                    nome: nome.trim(),
                    codigoFull: codigoFull.trim(),
                    localizacao: localizacao.trim(),
                    estoque: Number(estoque)
                };

                await salvarProdutoFirebase(produto);
                novos++;
            }
        }

        // ATUALIZA UI IMEDIATAMENTE
        renderProdutos(produtos, currentPageProdutos);
        atualizarDatalistProdutosKit();

        // RECARREGA TUDO DO FIRESTORE (para sincronizar)
        await carregarProdutos();

        // ATUALIZA DATALISTS NOVAMENTE SE NECESSÁRIO
        atualizarDatalistProdutosKit();

        btnRemoverArquivo.onclick();

        alert(`${novos} produtos importados e ${atualizados} produtos atualizados com sucesso`);
    };

    reader.readAsText(file, "UTF-8");
};

/***********************
 * SEPARAÇÃO - FIRESTORE
 ***********************/
async function salvarSeparacaoFirebase() {
    const refSep = doc(db, "separacoes", "atual");
    await setDoc(refSep, { itens: separacao });
}

async function carregarSeparacaoFirebase() {
    const refSep = doc(db, "separacoes", "atual");
    const snap = await getDoc(refSep);
    return snap.exists() ? snap.data().itens : [];
}

async function limparSeparacaoFirebase() {
    const refSep = doc(db, "separacoes", "atual");
    await setDoc(refSep, { itens: [] });
}

// === EXPOE FUNÇÕES PARA BOTÕES (OBRIGATÓRIO EM MODULE) ===
window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;

window.adicionarProdutoKit = adicionarProdutoKit;
window.removerItemKit = removerItemKit;
window.editarKit = editarKit;
window.excluirKit = excluirKit;

window.adicionarSeparacao = adicionarSeparacao;
window.editarSeparacao = editarSeparacao;
window.removerSeparacao = removerSeparacao;

window.openPopUp = openPopUp;
window.closePopup = closePopup;
window.openKitPopUp = openKitPopUp;
window.closeKitPopUp = closeKitPopUp;

window.showTab = showTab;
window.gerarRelatorioProdutos = gerarRelatorioProdutos;

window.salvarEdicao = salvarEdicao;
window.fecharModal = fecharModal;

/***********************
 * INIT
 ***********************/
(async function init() {
    await carregarProdutos();
    await carregarKits();
    await carregarHistorico();

    // 🔥 RESTAURA SEPARAÇÃO
    separacao = await carregarSeparacaoFirebase();
    renderSeparacao();
})();

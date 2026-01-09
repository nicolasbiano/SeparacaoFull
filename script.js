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

async function carregarProdutos() {
    const snapshot = await getDocs(produtosCol);
    produtos = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    renderProdutos();
}

async function carregarKits() {
    const snapshot = await getDocs(kitsCol);
    kits = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    renderKits();
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
const inputSeparacao = document.getElementById("inputSeparacao");
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

document.getElementById("newItemForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        const novoProduto = {
            sku: sku.value.trim(),
            nome: nomeProduto.value.trim(),
            codigoFull: codigoFull.value.trim(),
            localizacao: localizacao.value.trim(),
            estoque: Number(estoque.value)
        };

        await salvarProdutoFirebase(novoProduto);

        produtos.push(novoProduto);
        renderProdutos();
        closePopup();

        console.log("Produto salvo com sucesso:", novoProduto);

    } catch (erro) {
        console.error("ERRO AO SALVAR PRODUTO:", erro);
        alert("Erro ao salvar produto. Veja o console (F12).");
    }
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

async function excluirProduto(i) {
    if (!confirm("Excluir produto?")) return;

    const p = produtos[i];
    if (p.id) {
        await deleteDoc(doc(db, "produtos", p.id));
    }

    produtos.splice(i, 1);
    renderProdutos();
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

    renderKits();
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

async function excluirKit(index) {
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

    renderKits();
    renderSeparacao();
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

async function adicionarSeparacao() {
    const valor = inputSeparacao.value.trim();
    const qtd = Number(qtdSeparacao.value);

    if (!valor || qtd <= 0) {
        alert("Dados inválidos");
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


    inputSeparacao.value = "";
    qtdSeparacao.value = 1;
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
            <td>${item.qtd}</td>
            <td>x${item.qtd}</td>
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

    inputSeparacao.value = item.valor;
    qtdSeparacao.value = item.qtd;

    editandoSeparacaoIndex = index;
    renderSeparacao();
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
                    <td>${p ? "SIM" : "NÃO"}</td>
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

        for (const l of linhas) {
            if (!l.trim()) continue;

            const colunas = l.includes(";") ? l.split(";") : l.split(",");
            const [sku, nome, codigoFull = "", localizacao, estoque] = colunas;


            if (!sku || !nome || !localizacao || isNaN(estoque)) continue;

            if (produtos.some(p => p.sku === sku.trim())) continue;

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

        // RECARREGA TUDO DO FIRESTORE
        await carregarProdutos();

        // ATUALIZA DATALISTS
        atualizarDatalistProdutosKit();
        preencherDatalistSeparacao();

        btnRemoverArquivo.onclick();

        alert(`${novos} produtos importados com sucesso`);
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

/***********************
 * INIT
 ***********************/
(async function init() {
    await carregarProdutos();
    await carregarKits();
    await carregarHistorico();

    // 🔥 RESTAURA SEPARAÇÃO
    separacao = await carregarSeparacaoFirebase();
    preencherDatalistSeparacao();
    renderSeparacao();
})();

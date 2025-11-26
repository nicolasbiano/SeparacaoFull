// Função para abrir o popup
function openPopUp() {
    document.getElementById("popupCadastroItem").style.display = "block";
}

// Função para fechar o popup
function closePopup() {
    document.getElementById("popupCadastroItem").style.display = "none";
}

// Fechar o popup ao clicar fora da janela de conteúdo (opcional)
window.onclick = function(event) {
    var modal = document.getElementById("popupCadastroItem");
    if (event.target == modal) {
        closePopup();
    }
}

// Variável para armazenar a linha que está sendo editada
let editingRow = null;

// Lógica para enviar o formulário e adicionar o produto à tabela
document.getElementById("newItemForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Previne o envio do formulário e recarregamento da página

    const sku = document.getElementById("sku").value;
    const nomeProduto = document.getElementById("nomeProduto").value;
    const codigoFull = document.getElementById("codigoFull").value;
    const localizacao = document.getElementById("localizacao").value;
    const estoque = parseInt(document.getElementById("estoque").value);

    const table = document.getElementById("productTableBody");

    if (editingRow) {
        // Se estiver editando, atualiza a linha existente
        const cells = editingRow.getElementsByTagName("td");
        cells[1].textContent = nomeProduto;
        cells[2].textContent = codigoFull;
        cells[3].textContent = localizacao;
        cells[4].textContent = estoque;

        console.log(`Produto editado: SKU ${sku} -> Estoque: ${estoque}`);

        editingRow = null; // Limpa a linha de edição após salvar

    } else {
        // Se não estiver editando, adiciona um novo produto
        const newRow = document.createElement("tr");

        // Cria as células e atribui os valores
        const cellSKU = document.createElement("td");
        cellSKU.textContent = sku;

        const cellNomeProduto = document.createElement("td");
        cellNomeProduto.textContent = nomeProduto;

        const cellCodigoFull = document.createElement("td");
        cellCodigoFull.textContent = codigoFull;

        const cellLocalizacao = document.createElement("td");
        cellLocalizacao.textContent = localizacao;

        const cellEstoque = document.createElement("td");
        cellEstoque.textContent = estoque;

        // Cria a célula de ações com botões de Editar e Excluir
        const cellAcoes = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Editar";
        editButton.classList.add("btn-editar");
        editButton.addEventListener("click", function() {
            editProduct(newRow);
        });
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Excluir";
        deleteButton.classList.add("btn-excluir");
        deleteButton.addEventListener("click", function() {
            deleteProduct(newRow);
        });

        cellAcoes.appendChild(editButton);
        cellAcoes.appendChild(deleteButton);

        // Adiciona as células à nova linha
        newRow.appendChild(cellSKU);
        newRow.appendChild(cellNomeProduto);
        newRow.appendChild(cellCodigoFull);
        newRow.appendChild(cellLocalizacao);
        newRow.appendChild(cellEstoque);
        newRow.appendChild(cellAcoes);

        // Adiciona a nova linha à tabela
        table.appendChild(newRow);

        console.log(`Produto Adicionado: SKU ${sku} - Estoque: ${estoque}`);
    }

    closePopup(); // Fecha o popup após o envio
    document.getElementById("newItemForm").reset(); // Resetar o formulário após a adição
});

// Função para editar o produto
function editProduct(row) {
    const cells = row.getElementsByTagName("td");

    // Preenche o formulário com dados da linha (não alteramos o SKU)
    document.getElementById("sku").value = cells[0].textContent; // SKU é mantido
    document.getElementById("nomeProduto").value = cells[1].textContent;
    document.getElementById("codigoFull").value = cells[2].textContent;
    document.getElementById("localizacao").value = cells[3].textContent;
    document.getElementById("estoque").value = cells[4].textContent;

    openPopUp(); // Abre o popup para editar

    // Marca a linha como "em edição"
    editingRow = row;
}

// Função para excluir o produto
function deleteProduct(row) {
    row.remove(); // Remove a linha da tabela
    console.log("Produto excluído.");
}

// Exibir somente a aba selecionada
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.style.display = 'none'; // Esconde as abas
    });

    const activeTab = document.getElementById(tabName);
    if (activeTab) {
        activeTab.style.display = 'block'; // Mostra a aba selecionada
    }
}

document.addEventListener('DOMContentLoaded', function() {
    showTab('itens'); // Exibe a aba "itens" por padrão
});


// ======================================
// ARTE BLACK - CATÁLOGO DIGITAL
// ======================================

// Dados iniciais
// Futuramente serão carregados pelo Supabase.

let produtos = [];
let servicos = [];

let categoriaAtual = "todos";

// ======================================
// NAVEGAÇÃO ENTRE PRODUTOS E SERVIÇOS
// ======================================

const botoesNavegacao = document.querySelectorAll(".nav-btn");

const secaoProdutos = document.getElementById("products");
const secaoServicos = document.getElementById("services");

botoesNavegacao.forEach(botao => {

    botao.addEventListener("click", () => {

        const secao = botao.dataset.section;

        botoesNavegacao.forEach(item => {
            item.classList.remove("active");
        });

        botao.classList.add("active");

        secaoProdutos.classList.remove("active");
        secaoServicos.classList.remove("active");

        if (secao === "products") {
            secaoProdutos.classList.add("active");
        }

        if (secao === "services") {
            secaoServicos.classList.add("active");
        }

    });

});

// ======================================
// FILTRO DE CATEGORIAS
// ======================================

const botoesCategorias = document.querySelectorAll(".category-btn");

botoesCategorias.forEach(botao => {

    botao.addEventListener("click", () => {

        categoriaAtual = botao.dataset.category;

        botoesCategorias.forEach(item => {
            item.classList.remove("active");
        });

        botao.classList.add("active");

        renderizarProdutos();

    });

});

// ======================================
// EXIBIR PRODUTOS
// ======================================

function renderizarProdutos() {

    const container = document.getElementById("products-container");
    const contador = document.getElementById("products-count");
    const mensagemVazia = document.getElementById("empty-products");

    const produtosFiltrados = categoriaAtual === "todos"
        ? produtos
        : produtos.filter(produto => produto.categoria === categoriaAtual);

    container.innerHTML = "";

    contador.textContent = produtosFiltrados.length === 1
        ? "1 produto"
        : `${produtosFiltrados.length} produtos`;

    if (produtosFiltrados.length === 0) {

        mensagemVazia.style.display = "block";

        return;

    }

    mensagemVazia.style.display = "none";

    produtosFiltrados.forEach(produto => {

        const card = document.createElement("article");

        card.className = "product-card";

        card.innerHTML = `
            <div class="product-image">
                <img src="${produto.foto}" alt="${produto.nome}">
            </div>

            <div class="product-info">

                <span class="product-category">
                    ${produto.categoria}
                </span>

                <h4>${produto.nome}</h4>

                <p class="product-price">
                    ${formatarPreco(produto.preco)}
                </p>

                <p class="product-stock">
                    ${produto.quantidade > 0
                        ? "Disponível"
                        : "Esgotado"}
                </p>

                <a
                    href="${gerarLinkWhatsApp(produto)}"
                    class="product-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Tenho interesse
                </a>

            </div>
        `;

        container.appendChild(card);

    });

}

// ======================================
// EXIBIR SERVIÇOS
// ======================================

function renderizarServicos() {

    const container = document.getElementById("services-container");
    const mensagemVazia = document.getElementById("empty-services");

    container.innerHTML = "";

    if (servicos.length === 0) {

        mensagemVazia.style.display = "block";

        return;

    }

    mensagemVazia.style.display = "none";

    servicos.forEach(servico => {

        const item = document.createElement("article");

        item.className = "service-item";

        item.innerHTML = `
            <div>
                <h4>${servico.nome}</h4>
                <p>${servico.descricao || ""}</p>
            </div>

            <span class="service-price">
                ${formatarPreco(servico.preco)}
            </span>
        `;

        container.appendChild(item);

    });

}

// ======================================
// FORMATAR PREÇOS
// ======================================

function formatarPreco(valor) {

    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}

// ======================================
// WHATSAPP
// ======================================

// Depois colocaremos o número oficial da barbearia.

const whatsappBarbearia = "";

function gerarLinkWhatsApp(produto) {

    const mensagem = `Olá! Tenho interesse neste produto:

Produto: ${produto.nome}
Preço: ${formatarPreco(produto.preco)}

Gostaria de saber mais sobre a disponibilidade!`;

    return `https://wa.me/${whatsappBarbearia}?text=${encodeURIComponent(mensagem)}`;

}

// ======================================
// ANO AUTOMÁTICO NO RODAPÉ
// ======================================

document.getElementById("current-year").textContent =
    new Date().getFullYear();

// ======================================
// INICIALIZAÇÃO
// ======================================

renderizarProdutos();
renderizarServicos();

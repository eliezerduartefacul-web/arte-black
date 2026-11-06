
/* ==========================================
   ARTE BLACK - CATÁLOGO DIGITAL
========================================== */

// 1. CONEXÃO COM SUPABASE

const SUPABASE_URL = "https://xqwullsydwdtimodgygl.supabase.co";

const SUPABASE_KEY = "sb_publishable_ZKsC3krH1eiXVQ7LQ90goQ_iqfigPDB";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// 2. VARIÁVEIS

let produtos = [];
let servicos = [];
let categoriaAtual = "todos";


// 3. ELEMENTOS HTML

const botoesNavegacao = document.querySelectorAll(".nav-btn");

const secaoProdutos = document.getElementById("products");
const secaoServicos = document.getElementById("services");

const containerProdutos = document.getElementById("products-container");
const contadorProdutos = document.getElementById("products-count");
const mensagemVazia = document.getElementById("empty-products");

const listaCategorias = document.getElementById("category-list");


// 4. NAVEGAÇÃO

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


// 5. NORMALIZAR TEXTO

function normalizarTexto(texto) {

    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

}


// 6. CRIAR CATEGORIAS AUTOMATICAMENTE

function criarCategorias() {

    listaCategorias.innerHTML = "";

    const todas = document.createElement("button");

    todas.className = "category-btn active";
    todas.dataset.category = "todos";
    todas.textContent = "Todos";

    listaCategorias.appendChild(todas);

    const categorias = [
        ...new Set(
            produtos
                .map(produto => String(produto.category || "").trim())
                .filter(categoria => categoria !== "")
        )
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));

    categorias.forEach(categoria => {

        const botao = document.createElement("button");

        botao.className = "category-btn";
        botao.dataset.category = normalizarTexto(categoria);
        botao.textContent = categoria;

        listaCategorias.appendChild(botao);

    });

}


// 7. FILTRO DE CATEGORIAS

listaCategorias.addEventListener("click", event => {

    const botao = event.target.closest(".category-btn");

    if (!botao) return;

    categoriaAtual = botao.dataset.category;

    listaCategorias.querySelectorAll(".category-btn").forEach(item => {
        item.classList.remove("active");
    });

    botao.classList.add("active");

    renderizarProdutos();

});


// 8. FORMATAR PREÇOS

function formatarPreco(valor) {

    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


// 9. WHATSAPP

const whatsappBarbearia = "";

function gerarLinkWhatsApp(produto) {

    const mensagem = `Olá! Tenho interesse neste produto:

Produto: ${produto.name}
Preço: ${formatarPreco(produto.price)}

Gostaria de saber mais sobre a disponibilidade!`;

    return `https://wa.me/${whatsappBarbearia}?text=${encodeURIComponent(mensagem)}`;

}


// 10. EXIBIR PRODUTOS

function renderizarProdutos() {

    const produtosFiltrados = categoriaAtual === "todos"
        ? produtos
        : produtos.filter(produto =>
            normalizarTexto(produto.category) === categoriaAtual
        );

    containerProdutos.innerHTML = "";

    contadorProdutos.textContent =
        produtosFiltrados.length === 1
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

        const imagemContainer = document.createElement("div");
        imagemContainer.className = "product-image";

        const imagem = document.createElement("img");

        imagem.src = produto.image_url ||
            "https://placehold.co/400x300?text=Sem+imagem";

        imagem.alt = produto.name || "Produto Arte Black";
        imagem.loading = "lazy";

        imagem.onerror = () => {
            imagem.src = "https://placehold.co/400x300?text=Sem+imagem";
        };

        imagemContainer.appendChild(imagem);

        const informacoes = document.createElement("div");
        informacoes.className = "product-info";

        const categoria = document.createElement("span");
        categoria.className = "product-category";
        categoria.textContent = produto.category || "";

        const nome = document.createElement("h4");
        nome.textContent = produto.name || "";

        const preco = document.createElement("p");
        preco.className = "product-price";
        preco.textContent = formatarPreco(produto.price);

        const estoque = document.createElement("p");
        estoque.className = "product-stock";

        estoque.textContent = Number(produto.quantity) > 0
            ? "Disponível"
            : "Esgotado";

        const botao = document.createElement("a");

        botao.className = "product-btn";
        botao.textContent = "Tenho interesse";
        botao.href = gerarLinkWhatsApp(produto);
        botao.target = "_blank";
        botao.rel = "noopener noreferrer";

        informacoes.appendChild(categoria);
        informacoes.appendChild(nome);
        informacoes.appendChild(preco);
        informacoes.appendChild(estoque);
        informacoes.appendChild(botao);

        card.appendChild(imagemContainer);
        card.appendChild(informacoes);

        containerProdutos.appendChild(card);

    });

}


// 11. BUSCAR PRODUTOS NO SUPABASE

async function carregarProdutos() {

    mensagemVazia.style.display = "block";

    mensagemVazia.innerHTML = `
        <span>✦</span>
        <h3>Carregando produtos...</h3>
        <p>Aguarde um instante.</p>
    `;

    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

    if (error) {

        console.error("Erro ao buscar produtos:", error);

        mensagemVazia.innerHTML = `
            <span>✦</span>
            <h3>Não foi possível carregar os produtos.</h3>
            <p>Verifique sua conexão e tente novamente.</p>
        `;

        contadorProdutos.textContent = "Erro ao carregar";

        return;

    }

    produtos = data || [];

    criarCategorias();

    renderizarProdutos();

}


// 12. SERVIÇOS

function renderizarServicos() {

    const container = document.getElementById("services-container");
    const mensagem = document.getElementById("empty-services");

    if (!container || !mensagem) return;

    container.innerHTML = "";

    if (servicos.length === 0) {

        mensagem.style.display = "block";

        return;

    }

    mensagem.style.display = "none";

}


// 13. ANO AUTOMÁTICO

document.getElementById("current-year").textContent =
    new Date().getFullYear();


// 14. INICIALIZAÇÃO

async function iniciarCatalogo() {

    renderizarServicos();

    await carregarProdutos();

}

iniciarCatalogo();

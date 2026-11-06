
// ==========================================
// ARTE BLACK - CATÁLOGO DE PRODUTOS
// ==========================================

// 1. CONEXÃO COM O SUPABASE

const SUPABASE_URL = "https://xqwullsydwdtimodgygl.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZKsC3krH1eiXVQ7LQ90goQ_iqfigPDB";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// 2. CONFIGURAÇÕES

const whatsappBarbearia = "5553984783002";

let produtos = [];
let categoriaAtual = "todos";

// 3. ELEMENTOS DO HTML

const listaCategorias = document.getElementById("category-list");
const containerProdutos = document.getElementById("products-container");
const contadorProdutos = document.getElementById("products-count");
const mensagemVazia = document.getElementById("empty-products");

// 4. FORMATAR PREÇO

function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// 5. NORMALIZAR CATEGORIAS

function normalizarCategoria(categoria) {
    return String(categoria || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

// 6. GERAR LINK DO WHATSAPP



function gerarLinkWhatsApp(produto) {
    const mensagem = 
        `Olá! Tenho interesse neste produto:\n\n` +
        `Produto: ${produto.name}\n` +
        `Preço: ${formatarPreco(produto.price)}\n\n` +
        `Gostaria de saber mais sobre a disponibilidade!`;

    const numero = "5553984783002";

    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}


// 7. CARREGAR PRODUTOS DO SUPABASE

async function carregarProdutos() {
    containerProdutos.innerHTML = "<p>Carregando produtos...</p>";

    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Erro ao carregar produtos:", error);

        containerProdutos.innerHTML =
            "<p>Não foi possível carregar os produtos. Tente novamente.</p>";

        contadorProdutos.textContent = "0 produtos";
        mensagemVazia.style.display = "none";
        return;
    }

    produtos = data || [];

    criarCategorias();
    renderizarProdutos();
}

// 8. CRIAR CATEGORIAS AUTOMATICAMENTE

function criarCategorias() {
    listaCategorias.innerHTML = "";

    const botaoTodos = document.createElement("button");
    botaoTodos.type = "button";
    botaoTodos.className = "category-btn active";
    botaoTodos.textContent = "Todos";
    botaoTodos.dataset.category = "todos";

    botaoTodos.addEventListener("click", () => {
        filtrarCategoria("todos");
    });

    listaCategorias.appendChild(botaoTodos);

    const categorias = [
        ...new Set(
            produtos
                .map(produto => String(produto.category || "").trim())
                .filter(categoria => categoria !== "")
        )
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));

    categorias.forEach(categoria => {
        const botao = document.createElement("button");

        botao.type = "button";
        botao.className = "category-btn";
        botao.textContent = categoria;
        botao.dataset.category = normalizarCategoria(categoria);

        botao.addEventListener("click", () => {
            filtrarCategoria(categoria);
        });

        listaCategorias.appendChild(botao);
    });
}

// 9. FILTRAR PRODUTOS

function filtrarCategoria(categoria) {
    categoriaAtual = categoria;

    document.querySelectorAll(".category-btn").forEach(botao => {
        const selecionado =
            categoria === "todos"
                ? botao.dataset.category === "todos"
                : botao.dataset.category === normalizarCategoria(categoria);

        botao.classList.toggle("active", selecionado);
    });

    renderizarProdutos();
}

// 10. EXIBIR PRODUTOS

function renderizarProdutos() {
    containerProdutos.innerHTML = "";

    const produtosFiltrados = produtos.filter(produto => {
        if (categoriaAtual === "todos") {
            return true;
        }

        return (
            normalizarCategoria(produto.category) ===
            normalizarCategoria(categoriaAtual)
        );
    });

    contadorProdutos.textContent =
        `${produtosFiltrados.length} produto(s)`;

    if (produtosFiltrados.length === 0) {
        mensagemVazia.style.display = "block";
        return;
    }

    mensagemVazia.style.display = "none";

    produtosFiltrados.forEach(produto => {
        const card = document.createElement("article");
        card.className = "product-card";

        // Imagem

        if (produto.image_url) {
            const imagem = document.createElement("img");

            imagem.className = "product-image";
            imagem.src = produto.image_url;
            imagem.alt = produto.name || "Produto Arte Black";
            imagem.loading = "lazy";

            imagem.onerror = () => {
                imagem.style.display = "none";
            };

            card.appendChild(imagem);
        }

        // Informações

        const informacoes = document.createElement("div");
        informacoes.className = "product-info";

        const categoria = document.createElement("p");
        categoria.className = "product-category";
        categoria.textContent = produto.category || "";

        const nome = document.createElement("h3");
        nome.className = "product-name";
        nome.textContent = produto.name || "Produto sem nome";

        const descricao = document.createElement("p");
        descricao.className = "product-description";
        descricao.textContent = produto.description || "";

        const preco = document.createElement("p");
        preco.className = "product-price";
        preco.textContent = formatarPreco(produto.price);

        const quantidade = document.createElement("p");
        quantidade.className = "product-stock";

        quantidade.textContent =
            Number(produto.quantity) > 0
                ? `${produto.quantity} disponível(is)`
                : "Consulte a disponibilidade";

        // Botão WhatsApp

        const botaoWhatsApp = document.createElement("a");

        botaoWhatsApp.className = "whatsapp-btn";
        botaoWhatsApp.href = gerarLinkWhatsApp(produto);
        botaoWhatsApp.textContent = "Tenho interesse";

        informacoes.appendChild(categoria);
        informacoes.appendChild(nome);
        informacoes.appendChild(descricao);
        informacoes.appendChild(preco);
        informacoes.appendChild(quantidade);
        informacoes.appendChild(botaoWhatsApp);

        card.appendChild(informacoes);
        containerProdutos.appendChild(card);
    });
}

// 11. INICIAR CATÁLOGO

carregarProdutos();

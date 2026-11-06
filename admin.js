
/* ==========================================
   ARTE BLACK - PAINEL ADMINISTRATIVO
========================================== */

// 1. CONEXÃO COM SUPABASE

const SUPABASE_URL = "https://xqwullsydwdtimodgygl.supabase.co";

const SUPABASE_KEY = "COLOQUE_AQUI_SUA_PUBLISHABLE_KEY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// 2. ELEMENTOS HTML

const loginSection = document.getElementById("login-section");
const adminSection = document.getElementById("admin-section");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

const logoutButton = document.getElementById("logout-button");

const productForm = document.getElementById("product-form");
const productMessage = document.getElementById("product-message");

const productsList = document.getElementById("products-list");

const productId = document.getElementById("product-id");
const productName = document.getElementById("product-name");
const productCategory = document.getElementById("product-category");
const productDescription = document.getElementById("product-description");
const productPrice = document.getElementById("product-price");
const productQuantity = document.getElementById("product-quantity");
const productImage = document.getElementById("product-image");
const productActive = document.getElementById("product-active");

const formTitle = document.getElementById("form-title");
const saveProductButton = document.getElementById("save-product-button");
const cancelEditButton = document.getElementById("cancel-edit-button");


// 3. MENSAGENS

function showLoginMessage(message, error = false) {
    loginMessage.textContent = message;
    loginMessage.style.color = error ? "#ff6b6b" : "#D4AF37";
}

function showProductMessage(message, error = false) {
    productMessage.textContent = message;
    productMessage.style.color = error ? "#ff6b6b" : "#D4AF37";
}


// 4. VERIFICAR AUTORIZAÇÃO DO ADMINISTRADOR

async function verifyAdmin(user) {

    const { data, error } = await supabaseClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        throw new Error(
            "Erro ao consultar admin_users: " + error.message
        );
    }

    console.log("UID autenticado:", user.id);
    console.log("Registro encontrado:", data);

    return data !== null;
}


// 5. ABRIR PAINEL

async function openAdminPanel(user) {

    showLoginMessage("Verificando autorização...");

    try {

        const isAdmin = await verifyAdmin(user);

        if (!isAdmin) {

            showLoginMessage(
                "Usuário autenticado, mas não encontrado na tabela admin_users.",
                true
            );

            await supabaseClient.auth.signOut();

            return;
        }

        loginSection.hidden = true;
        adminSection.hidden = false;

        await loadProducts();

    } catch (error) {

        console.error(error);

        showLoginMessage(error.message, true);
    }
}


// 6. LOGIN

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    showLoginMessage("Entrando...");

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const { data, error } = await supabaseClient.auth
        .signInWithPassword({
            email,
            password
        });

    if (error) {

        console.error("Erro no login:", error);

        showLoginMessage(
            "Erro no login: " + error.message,
            true
        );

        return;
    }

    await openAdminPanel(data.user);
});


// 7. SAIR

logoutButton.addEventListener("click", async function() {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert("Erro ao sair: " + error.message);
        return;
    }

    adminSection.hidden = true;
    loginSection.hidden = false;

    loginForm.reset();

    resetProductForm();

    showLoginMessage("");
});


// 8. CARREGAR PRODUTOS

async function loadProducts() {

    productsList.innerHTML = "<p>Carregando produtos...</p>";

    const { data, error } = await supabaseClient
        .from("products")
        .select("*");

    if (error) {

        console.error("Erro ao carregar produtos:", error);

        productsList.innerHTML =
            "<p>Erro ao carregar produtos: " +
            escapeHTML(error.message) +
            "</p>";

        return;
    }

    data.sort((a, b) => {
        return new Date(b.created_at || 0) -
               new Date(a.created_at || 0);
    });

    renderProducts(data);
}


// 9. PROTEGER TEXTOS EXIBIDOS NA TELA

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function(char) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];
    });
}


// 10. EXIBIR PRODUTOS

function renderProducts(products) {

    if (!products.length) {

        productsList.innerHTML =
            "<p>Nenhum produto cadastrado.</p>";

        return;
    }

    productsList.innerHTML = products.map(product => {

        const id = escapeHTML(product.id);
        const name = escapeHTML(product.name);
        const category = escapeHTML(product.category);
        const description = escapeHTML(product.description);

        const image = product.image_url
            ? escapeHTML(product.image_url)
            : "https://placehold.co/400x300?text=Sem+imagem";

        const price = Number(product.price || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

        const status = product.active ? "Ativo" : "Inativo";

        return `
            <article class="product-card">

                <img src="${image}" alt="${name}">

                <h3>${name}</h3>

                <p>Categoria: ${category}</p>

                <p>${description}</p>

                <p class="product-price">${price}</p>

                <p>Estoque: ${Number(product.quantity || 0)}</p>

                <p>Status: ${status}</p>

                <button
                    type="button"
                    data-action="edit"
                    data-id="${id}">
                    Editar
                </button>

                <button
                    type="button"
                    class="delete-button"
                    data-action="delete"
                    data-id="${id}">
                    Excluir
                </button>

            </article>
        `;

    }).join("");
}


// 11. ENVIAR IMAGEM PARA O STORAGE

async function uploadProductImage(file) {

    const extension = file.name.split(".").pop().toLowerCase();

    const fileName = crypto.randomUUID() + "." + extension;

    const { error } = await supabaseClient.storage
        .from("product-images")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false
        });

    if (error) {
        throw new Error("Erro ao enviar imagem: " + error.message);
    }

    const { data } = supabaseClient.storage
        .from("product-images")
        .getPublicUrl(fileName);

    return data.publicUrl;
}


// 12. SALVAR PRODUTO

productForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    saveProductButton.disabled = true;
    saveProductButton.textContent = "Salvando...";

    try {

        const id = productId.value;

        const productData = {

            name: productName.value.trim(),

            category: productCategory.value.trim(),

            description: productDescription.value.trim(),

            price: Number(productPrice.value),

            quantity: Number(productQuantity.value),

            active: productActive.checked

        };

        if (
            !productData.name ||
            !productData.category ||
            !Number.isFinite(productData.price) ||
            productData.price < 0 ||
            !Number.isInteger(productData.quantity) ||
            productData.quantity < 0
        ) {
            throw new Error("Confira os dados do produto.");
        }

        const file = productImage.files[0];

        if (file) {

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!allowedTypes.includes(file.type)) {
                throw new Error("Use uma imagem JPG, PNG ou WebP.");
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error("A imagem deve ter no máximo 5 MB.");
            }

            productData.image_url = await uploadProductImage(file);
        }

        if (!id && !productData.image_url) {
            productData.image_url = null;
        }

        let result;

        if (id) {

            result = await supabaseClient
                .from("products")
                .update(productData)
                .eq("id", id);

        } else {

            result = await supabaseClient
                .from("products")
                .insert([productData]);

        }

        if (result.error) {
            throw new Error(result.error.message);
        }

        showProductMessage("Produto salvo com sucesso!");

        resetProductForm();

        await loadProducts();

    } catch (error) {

        console.error(error);

        showProductMessage(error.message, true);

    } finally {

        saveProductButton.disabled = false;
        saveProductButton.textContent = "Salvar produto";

    }
});


// 13. EDITAR E EXCLUIR

productsList.addEventListener("click", async function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;

    if (button.dataset.action === "edit") {
        await editProduct(id);
    }

    if (button.dataset.action === "delete") {
        await deleteProduct(id);
    }
});


// 14. ABRIR PRODUTO PARA EDIÇÃO

async function editProduct(id) {

    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {

        showProductMessage(
            "Erro ao abrir produto: " + error.message,
            true
        );

        return;
    }

    productId.value = data.id;

    productName.value = data.name || "";

    productCategory.value = data.category || "";

    productDescription.value = data.description || "";

    productPrice.value = data.price ?? "";

    productQuantity.value = data.quantity ?? 0;

    productActive.checked = Boolean(data.active);

    productImage.value = "";

    formTitle.textContent = "Editar produto";

    saveProductButton.textContent = "Atualizar produto";

    cancelEditButton.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// 15. EXCLUIR PRODUTO

async function deleteProduct(id) {

    const confirmation = confirm(
        "Tem certeza que deseja excluir este produto?"
    );

    if (!confirmation) return;

    const { error } = await supabaseClient
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {

        alert("Erro ao excluir: " + error.message);

        return;
    }

    alert("Produto excluído com sucesso!");

    await loadProducts();
}


// 16. LIMPAR FORMULÁRIO

function resetProductForm() {

    productForm.reset();

    productId.value = "";

    productActive.checked = true;

    formTitle.textContent = "Adicionar produto";

    saveProductButton.textContent = "Salvar produto";

    cancelEditButton.hidden = true;
}

cancelEditButton.addEventListener("click", resetProductForm);


// 17. VERIFICAR SESSÃO EXISTENTE

async function checkSession() {

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {

        console.error("Erro ao verificar sessão:", error);

        showLoginMessage(error.message, true);

        return;
    }

    if (data.session) {

        await openAdminPanel(data.session.user);

    }
}


// 18. INICIAR PAINEL

checkSession();

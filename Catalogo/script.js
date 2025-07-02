// --- ESTADO DA APLICAÇÃO ---
let perfumes = [];
let cart = [];
let sales = [];
let users = [];
let currentUser = null;
const adminEmail = 'viniciuslufrano11@gmail.com';
const adminPassword = 'testes9221';
const meuNumeroWhatsApp = '5511940843608';

// --- MAPEAMENTO DE ELEMENTOS DO DOM ---
const appRoot = document.getElementById('app-root');
const mainNav = document.getElementById('main-nav');
const registerModal = document.getElementById('register-modal');

// --- FUNÇÕES DE UTILIDADE E MÁSCARAS ---
const applyCpfMask = (event) => { let value = event.target.value.replace(/\D/g, ""); value = value.replace(/(\d{3})(\d)/, "$1.$2"); value = value.replace(/(\d{3})(\d)/, "$1.$2"); value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); event.target.value = value; };
const fetchAddressFromCep = async (cep) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (data.erro) { alert("CEP não encontrado."); return; }
        document.getElementById('popup-user-address').value = data.logradouro || '';
        document.getElementById('popup-user-neighborhood').value = data.bairro || '';
        document.getElementById('popup-user-city-state').value = `${data.localidade || ''} - ${data.uf || ''}`;
        document.getElementById('popup-user-complement').value = data.complemento || '';
        document.getElementById('popup-user-address-number').focus();
    } catch (error) { console.error("Erro ao buscar o CEP:", error); alert("Não foi possível buscar o endereço."); }
};

// --- LÓGICA DO MODAL DE CADASTRO ---
function openRegisterModal(event) { if (event) event.preventDefault(); if (registerModal) { registerModal.style.display = 'block'; sessionStorage.setItem('hasSeenRegisterPopup', 'true'); } }
function closeRegisterModal() { if (registerModal) registerModal.style.display = 'none'; }
window.onclick = function(event) { if (event.target == registerModal) { closeRegisterModal(); } }
const handlePopupRegister = (event) => {
    event.preventDefault();
    const formMessage = document.getElementById('popup-form-message');
    const newUser = {
        id: Date.now().toString(), name: document.getElementById('popup-user-name').value, email: document.getElementById('popup-user-email').value, password: document.getElementById('popup-user-password').value, document: document.getElementById('popup-user-document').value,
        address: { street: document.getElementById('popup-user-address').value, number: document.getElementById('popup-user-address-number').value, complement: document.getElementById('popup-user-complement').value, zipcode: document.getElementById('popup-user-zipcode').value, neighborhood: document.getElementById('popup-user-neighborhood').value, cityState: document.getElementById('popup-user-city-state').value, }
    };
    if (users.some(user => user.email === newUser.email)) { formMessage.textContent = 'Este e-mail já está cadastrado.'; formMessage.style.color = 'var(--cor-perigo)'; return; }
    users.push(newUser);
    saveData();
    formMessage.textContent = 'Cadastro realizado com sucesso!'; formMessage.style.color = 'var(--cor-sucesso)';
    setTimeout(() => { closeRegisterModal(); alert('Cadastro efetuado! Por favor, faça o login para continuar.'); window.location.hash = '#login'; }, 2000);
};

// --- LÓGICA DE AUTENTICAÇÃO ---
const handleLogin = (event) => {
    event.preventDefault();
    const emailInput = document.getElementById('user-email').value;
    const passwordInput = document.getElementById('user-password').value;
    const loginError = document.getElementById('login-error');
    if (emailInput === adminEmail && passwordInput === adminPassword) { sessionStorage.setItem('isAdminAuthenticated', 'true'); localStorage.removeItem('jkCurrentUser'); currentUser = null; document.body.classList.add('admin-view'); document.body.classList.remove('user-view'); renderNav(); window.location.hash = '#dashboard'; return; }
    const foundUser = users.find(user => user.email === emailInput && user.password === passwordInput);
    if (foundUser) { localStorage.setItem('jkCurrentUser', JSON.stringify(foundUser)); sessionStorage.removeItem('isAdminAuthenticated'); currentUser = foundUser; document.body.classList.add('user-view'); document.body.classList.remove('admin-view'); renderNav(); window.location.hash = '#my-account'; } else { loginError.textContent = 'E-mail ou senha incorretos.'; }
};
const handleLogout = () => { sessionStorage.removeItem('isAdminAuthenticated'); localStorage.removeItem('jkCurrentUser'); currentUser = null; document.body.classList.remove('admin-view'); document.body.classList.remove('user-view'); renderNav(); window.location.hash = '#catalog'; };

// --- FUNÇÕES DE DADOS (localStorage) ---
const saveData = () => { localStorage.setItem('jkPerfumesDB', JSON.stringify(perfumes)); localStorage.setItem('jkCartDB', JSON.stringify(cart)); localStorage.setItem('jkSalesDB', JSON.stringify(sales)); localStorage.setItem('jkUsersDB', JSON.stringify(users)); };
const loadData = () => { try { const perfumesData = localStorage.getItem('jkPerfumesDB'); if (perfumesData) { perfumes = JSON.parse(perfumesData); } else { perfumes = [ { id: '1', name: 'Perfume Oceano', price: 'R$ 299,90', cost: 'R$ 150,00', notes: 'Cítricas, Marinhas, Amadeiradas', description: 'Uma fragrância refrescante.', images: ['https://images.unsplash.com/photo-1585399136113-d5395ab6a512?q=80&w=1887&auto=format&fit=crop'], reviews: [], stock: 10 } ]; } const cartData = localStorage.getItem('jkCartDB'); if (cartData) cart = JSON.parse(cartData); const salesData = localStorage.getItem('jkSalesDB'); if (salesData) sales = JSON.parse(salesData); const usersData = localStorage.getItem('jkUsersDB'); if (usersData) users = JSON.parse(usersData); const currentUserData = localStorage.getItem('jkCurrentUser'); if (currentUserData) currentUser = JSON.parse(currentUserData); } catch (error) { console.error("Erro ao carregar dados do localStorage:", error); } };

// --- FUNÇÕES DE RENDERIZAÇÃO ---
const renderStars = (rating) => { let starsHTML = ''; const fullStars = Math.floor(rating); for (let i = 0; i < 5; i++) { starsHTML += i < fullStars ? '★' : '☆'; } return `<div class="star-rating">${starsHTML}</div>`; };
const renderNav = () => { mainNav.innerHTML = `<ul><li class="admin-only"><a href="#dashboard" class="nav-link">Dashboard</a></li><li><a href="#catalog" class="nav-link">Catálogo</a></li><li class="admin-only"><a href="#add-perfume" class="nav-link">Adicionar</a></li><li class="admin-only"><a href="#import" class="nav-link">Importar</a></li><li class="user-only"><a href="#my-account" class="nav-link">Minha Conta</a></li><li><a href="#about" class="nav-link">Sobre</a></li><li class="user-only"><a href="#" onclick="handleLogout()">Sair</a></li><li class="guest-only"><a href="#" onclick="openRegisterModal(event)">Cadastre-se</a></li><li class="guest-only"><a href="#login" class="nav-link">Login</a></li><li class="admin-only"><a href="#" onclick="handleLogout()">Sair</a></li></ul><a href="#cart" class="nav-cart" title="Ver Carrinho"><svg xmlns="http://www.w3.org/2000/svg" height="28" width="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17 6h-2c0-2.21-1.79-4-4-4S7 3.79 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm5 16H7V8h2v2h2V8h2v2h2V8h2v12z"/></svg><span id="cart-count" class="cart-count">0</span></a>`; updateCartCount();};

// --- ÁREA DO USUÁRIO COM NOVO DESIGN ---
const renderMyDetailsPage = () => {
    if (!currentUser) { window.location.hash = '#login'; return; }
    const accountHeader = `<div class="account-header"><h2>Minha Conta</h2><div class="account-tabs"><a href="#my-details" class="account-tab active">Meus Dados</a><a href="#my-orders" class="account-tab">Meus Pedidos</a></div></div>`;
    const detailsHtml = `
        <div class="data-card">
            <div class="data-card-header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                <h3>Informações Pessoais</h3>
            </div>
            <div class="account-details">
                <p><strong>Nome:</strong> ${currentUser.name}</p>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Documento:</strong> ${currentUser.document}</p>
            </div>
        </div>
        <div class="data-card">
            <div class="data-card-header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <h3>Endereço Principal</h3>
            </div>
            <div class="account-details">
                <p><strong>Endereço:</strong> ${currentUser.address.street}, ${currentUser.address.number}</p>
                ${currentUser.address.complement ? `<p><strong>Complemento:</strong> ${currentUser.address.complement}</p>` : ''}
                <p><strong>Bairro:</strong> ${currentUser.address.neighborhood}</p>
                <p><strong>CEP:</strong> ${currentUser.address.zipcode}</p>
                <p><strong>Cidade/UF:</strong> ${currentUser.address.cityState}</p>
            </div>
        </div>
    `;
    appRoot.innerHTML = `<section class="page">${accountHeader}<div>${detailsHtml}</div></section>`;
};
const renderMyOrdersPage = () => {
    if (!currentUser) { window.location.hash = '#login'; return; }
    const accountHeader = `<div class="account-header"><h2>Minha Conta</h2><div class="account-tabs"><a href="#my-details" class="account-tab">Meus Dados</a><a href="#my-orders" class="account-tab active">Meus Pedidos</a></div></div>`;
    const userOrders = sales.filter(sale => sale.customer.cpf === currentUser.document);
    let historyHtml = '';
    if (userOrders.length === 0) {
        historyHtml = '<div class="data-card"><p>Você ainda não fez nenhum pedido.</p></div>';
    } else {
        userOrders.reverse().forEach(sale => {
            historyHtml += `<div class="order-card"><a href="#order-details?id=${sale.id}" style="text-decoration: none; color: inherit;"><div class="order-summary"><div><strong>Pedido Nº:</strong> ${sale.id}<br><strong>Data:</strong> ${new Date(sale.date).toLocaleDateString('pt-BR')}</div><div><strong>Total: R$ ${sale.total.toFixed(2).replace('.', ',')}</strong></div></div></a></div>`;
        });
    }
    appRoot.innerHTML = `<section class="page">${accountHeader}<div>${historyHtml}</div></section>`;
};
const renderOrderDetailsPage = (saleId) => {
    if (!currentUser) { window.location.hash = '#login'; return; }
    const sale = sales.find(s => s.id === saleId);
    if (!sale || sale.customer.cpf !== currentUser.document) { window.location.hash = '#my-orders'; return; }
    let itemsHtml = sale.items.map(item => {
        const product = perfumes.find(p => p.id === item.id);
        const price = product ? parsePrice(product.price) : 0;
        const subtotal = item.quantity * price;
        return `<li class="order-product-item"><img src="${product?.images[0] || ''}" alt="${product?.name || ''}"><div class="order-product-info"><strong>${product?.name || 'Produto indisponível'}</strong><span>Qtd: ${item.quantity}</span></div><div class="order-product-price"><span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span></div></li>`;
    }).join('');
    appRoot.innerHTML = `<section class="page"><a href="#my-orders" class="btn" style="margin-bottom: 2rem;">&larr; Voltar para Meus Pedidos</a><div class="formulario"><div class="order-details-page-header"><h2>Detalhes do Pedido Nº ${sale.id}</h2><p><strong>Data:</strong> ${new Date(sale.date).toLocaleDateString('pt-BR')} &nbsp;&nbsp;&nbsp; <strong>Total:</strong> R$ ${sale.total.toFixed(2).replace('.', ',')}</p></div><h3>Produtos Comprados</h3><ul class="order-product-list">${itemsHtml}</ul></div></section>`;
};

// --- DEMAIS RENDERIZADORES (Login, Catálogo, etc.) ---
const renderLoginPage = () => { appRoot.innerHTML = `<section class="page form-container"><form class="formulario" id="login-form"><h2>Acesso à Conta</h2><p>Use seu e-mail e senha para entrar.</p><input type="email" id="user-email" placeholder="E-mail" required><input type="password" id="user-password" placeholder="Senha" required><button type="submit" class="btn">Entrar</button><p id="login-error" class="login-error"></p></form></section>`; document.getElementById('login-form').addEventListener('submit', handleLogin); };
const renderCatalogPage = () => { const heroSlides = perfumes.map(p => { const imageUrl = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/400x400.png?text=Sem+Imagem'; return `<div class="swiper-slide"><a href="#product?id=${p.id}"><img src="${imageUrl}" alt="${p.name}"></a></div>`; }).join(''); appRoot.innerHTML = `<section id="page-catalog" class="page"><div class="swiper hero-swiper"><div class="swiper-wrapper">${heroSlides}</div><div class="swiper-pagination"></div></div><div class="filter-bar"><div class="search-container"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7s-7 3.132-7 7 3.133 7 7 7a6.977 6.977 0 0 0 5.025-2.125z"/></svg><input type="search" id="searchInput" placeholder="Pesquisar..."></div><select id="sortSelect"><option value="default">Padrão</option><option value="name-asc">Nome (A-Z)</option><option value="price-asc">Preço (Menor)</option><option value="price-desc">Preço (Maior)</option></select><button class="btn btn-download" onclick="gerarPDF()">&#x2B07; Baixar PDF</button></div><div id="catalogo" class="grid"></div></section>`; if (typeof Swiper !== 'undefined') { new Swiper('.hero-swiper', { loop: true, autoplay: { delay: 4000, disableOnInteraction: false }, pagination: { el: '.swiper-pagination', clickable: true }, }); } document.getElementById('searchInput').addEventListener('input', applyFiltersAndRender); document.getElementById('sortSelect').addEventListener('change', applyFiltersAndRender); applyFiltersAndRender(); };
const renderPerfumeCards = (items) => { const catalogGrid = document.getElementById('catalogo'); if(!catalogGrid) return; catalogGrid.innerHTML = ''; if (items.length === 0) { catalogGrid.innerHTML = '<p>Nenhum perfume encontrado.</p>'; return; } items.forEach(perfume => { const hasReviews = Array.isArray(perfume.reviews) && perfume.reviews.length > 0; const avgRating = hasReviews ? perfume.reviews.reduce((sum, review) => sum + review.rating, 0) / perfume.reviews.length : 0; const isOutOfStock = perfume.stock <= 0; const imageUrl = (perfume.images && perfume.images.length > 0) ? perfume.images[0] : 'https://via.placeholder.com/400x400.png?text=Sem+Imagem'; const card = document.createElement('div'); card.classList.add('card'); card.innerHTML = `<a href="#product?id=${perfume.id}" class="card-image-container">${isOutOfStock ? '<div class="out-of-stock-badge">Esgotado</div>' : ''}<img src="${imageUrl}" alt="${perfume.name}"></a><div class="info"><h3>${perfume.name}</h3>${renderStars(avgRating)}<p class="preco">${perfume.price}</p></div><div class="buy-button-container"><a href="#product?id=${perfume.id}" class="btn btn-buy ${isOutOfStock ? 'btn-disabled' : ''}">${isOutOfStock ? 'Esgotado' : 'Ver Detalhes'}</a></div><div class="admin-actions admin-only"><button title="Editar" onclick="editPerfume('${perfume.id}')">&#9998;</button><button title="Remover" onclick="removePerfume('${perfume.id}')">&#10005;</button></div>`; catalogGrid.appendChild(card); }); };
const renderProductDetailPage = (productId) => { const perfume = perfumes.find(p => p.id === productId); if (!perfume) { window.location.hash = '#catalog'; return; } const hasReviews = Array.isArray(perfume.reviews) && perfume.reviews.length > 0; const avgRating = hasReviews ? perfume.reviews.reduce((sum, review) => sum + review.rating, 0) / perfume.reviews.length : 0; const isOutOfStock = perfume.stock <= 0; const productSlides = (perfume.images && perfume.images.length > 0) ? perfume.images.map(imgUrl => `<div class="swiper-slide"><img src="${imgUrl}" alt="${perfume.name}"></div>`).join('') : `<div class="swiper-slide"><img src="https://via.placeholder.com/400x400.png?text=Sem+Imagem" alt="${perfume.name}"></div>`; let reviewsHTML = '<h3>Nenhuma avaliação ainda.</h3>'; if (hasReviews) { reviewsHTML = '<h2>Avaliações</h2>'; perfume.reviews.forEach((review, index) => { reviewsHTML += `<div class="review-item"><div class="review-header"><strong>${review.author}</strong>${renderStars(review.rating)}<button class="delete-review-btn admin-only" onclick="removeReview('${perfume.id}', ${index})">Excluir</button></div><p>${review.comment}</p></div>`; }); } appRoot.innerHTML = `<section class="page product-detail-container"><a href="#catalog" class="btn" style="margin-bottom: 2rem;">&larr; Voltar</a><div class="product-detail-layout"><div class="swiper product-image-swiper"><div class="swiper-wrapper">${productSlides}</div><div class="swiper-button-next"></div><div class="swiper-button-prev"></div><div class="swiper-pagination"></div></div><div class="details"><h1>${perfume.name}</h1>${renderStars(avgRating)}<p class="preco" style="text-align: left; font-size: 2rem;">${perfume.price}</p><p><strong>Notas:</strong> ${perfume.notes}</p><p><strong>Estoque:</strong> ${perfume.stock} un.</p><p style="margin-top: 1rem;">${perfume.description}</p><br><button class="btn btn-buy ${isOutOfStock ? 'btn-disabled' : ''}" onclick="addToCart('${perfume.id}')" ${isOutOfStock ? 'disabled' : ''}>${isOutOfStock ? 'Esgotado' : 'Adicionar ao Carrinho'}</button></div></div><div class="reviews-container">${reviewsHTML}<div class="review-form-container"><h3>Deixe sua avaliação</h3><form class="formulario" id="review-form" style="box-shadow: none; padding: 0; margin-top: 1rem;"><input type="text" id="review-author" placeholder="Seu nome" required value="${currentUser ? currentUser.name : ''}"><div class="rating-input"><input type="radio" id="star5" name="rating" value="5" required><label for="star5">☆</label><input type="radio" id="star4" name="rating" value="4"><label for="star4">☆</label><input type="radio" id="star3" name="rating" value="3"><label for="star3">☆</label><input type="radio" id="star2" name="rating" value="2"><label for="star2">☆</label><input type="radio" id="star1" name="rating" value="1"><label for="star1">☆</label></div><textarea id="review-comment" placeholder="Escreva seu comentário..." required></textarea><button type="submit" class="btn">Enviar</button></form></div></div></section>`; if (typeof Swiper !== 'undefined') { new Swiper('.product-image-swiper', { loop: true, pagination: { el: '.swiper-pagination', clickable: true }, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }, }); } document.getElementById('review-form').addEventListener('submit', (event) => handleReviewSubmit(event, productId)); };
const renderCartPage = () => { let cartContent = ''; let totalPrice = 0; let isCheckoutDisabled = false; if (cart.length === 0) { cartContent = '<p>Seu carrinho está vazio.</p>'; } else { cart.forEach(cartItem => { const product = perfumes.find(p => p.id === cartItem.id); if(product) { if (cartItem.quantity > product.stock) { isCheckoutDisabled = true; } const itemTotal = parsePrice(product.price) * cartItem.quantity; totalPrice += itemTotal; const imageUrl = (product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/400x400.png?text=Sem+Imagem'; cartContent += `<div class="cart-item"><img src="${imageUrl}" alt="${product.name}"><div class="cart-item-info"><h3>${product.name}</h3><p>${product.price}</p>${cartItem.quantity > product.stock ? `<p class="login-error">Estoque: ${product.stock}</p>` : ''}</div><div class="cart-item-actions"><span>Qtd: </span><input type="number" class="cart-quantity-input" min="1" value="${cartItem.quantity}" onchange="updateCartQuantity('${product.id}', this.value)"><button title="Remover" onclick="removeFromCart('${product.id}')">&times;</button></div><p><strong>Subtotal:</strong> R$ ${itemTotal.toFixed(2).replace('.', ',')}</p></div>`; } }); } let checkoutSectionHTML = ''; if (currentUser) { checkoutSectionHTML = `<div class="customer-info-form"><h3>Seus Dados para Entrega</h3><input type="text" value="${currentUser.name}" readonly><input type="text" value="${currentUser.document}" readonly></div><div class="cart-total"><span>Total:</span><span>R$ ${totalPrice.toFixed(2).replace('.', ',')}</span></div><br><div style="text-align: right;"><button class="btn btn-buy ${isCheckoutDisabled ? 'btn-disabled' : ''}" onclick="checkout()" ${isCheckoutDisabled ? 'disabled' : ''}>${isCheckoutDisabled ? 'Verifique Estoque' : 'Finalizar via WhatsApp'}</button></div>`; } else { checkoutSectionHTML = `<div class="formulario" style="text-align: center; margin-top: 2rem; padding: 2rem;"><h3>Faça o Login para Continuar</h3><p style="margin: 1rem 0;">Você precisa ter uma conta e estar logado para finalizar seu pedido.</p><div style="display: flex; gap: 1rem; justify-content: center;"><a href="#login" class="btn">Fazer Login</a><button class="btn btn-download" onclick="openRegisterModal(event)">Criar Conta</button></div></div>`; } appRoot.innerHTML = `<section class="page cart-container"><h2>Meu Carrinho</h2><div id="cart-items">${cartContent}</div>${cart.length > 0 ? checkoutSectionHTML : '<a href="#catalog" class="btn">Voltar ao Catálogo</a>'}</section>`; };

const renderAddPerfumePage = () => {
    const perfumeId = localStorage.getItem('perfumeToEditId');
    localStorage.removeItem('perfumeToEditId');
    const perfumeToEdit = perfumeId ? perfumes.find(p => p.id === perfumeId) : null;

    // CORREÇÃO: Garante que 'perfume' seja sempre um objeto, evitando erros de 'undefined'.
    const perfume = perfumeToEdit || { id: '', name: '', stock: 0, images: [], reviews: [], cost: '', price: '', notes: '', description: '' };

    appRoot.innerHTML = `<section id="page-add-perfume" class="page form-container">
        <form class="formulario" id="form-perfume">
            <h2>${perfume.id ? 'Editar Perfume' : 'Adicionar Novo Perfume'}</h2>
            <input type="hidden" id="editPerfumeId" value="${perfume.id}">
            <input type="text" id="nome" placeholder="Nome do perfume" required value="${perfume.name}">
            <div style="display: flex; gap: 1rem;">
                <input type="number" id="estoque" placeholder="Qtd. em Estoque" min="0" required value="${perfume.stock}" style="width: 50%;">
                <input type="text" id="preco" placeholder="Preço de Venda" required value="${perfume.price}" style="width: 50%;">
            </div>
            <input type="text" id="cost" placeholder="Preço de Custo" required value="${perfume.cost}">
            <input type="text" id="notas" placeholder="Principais notas" required value="${perfume.notes}">
            <label for="imagem-links">Links das imagens (um por linha):</label>
            <p style="font-size: 0.8rem; color: var(--cor-texto-suave); margin: 0.25rem 0 0.75rem 0;">Para melhor qualidade, use imagens quadradas (1:1) com resolução de 800x800 pixels.</p>
            <textarea id="imagem-links" placeholder="https://exemplo.com/imagem1.jpg\nhttps://exemplo.com/imagem2.jpg" rows="4">${perfume.images.join('\n')}</textarea>
            <label for="uploadImagem" style="margin-top: 1rem;">Ou faça upload de arquivos (prioritário):</label>
            <input type="file" id="uploadImagem" accept="image/*" multiple style="border:none; padding-left:0; width:100%; margin-top:0.5rem;"/>
            <textarea id="descricao" placeholder="Descrição do perfume" required>${perfume.description}</textarea>
            <button type="submit" class="btn">Salvar Perfume</button>
        </form>
    </section>`;
    document.getElementById('form-perfume').addEventListener('submit', handleFormSubmit);
};

const renderAboutPage = () => { appRoot.innerHTML = `<section class="page"><div class="formulario"><h2>Sobre a JK Perfumes</h2><p style="text-align:center; line-height: 1.8;">Bem-vindo à JK Perfumes...</p></div></section>`; };
const renderImportPage = () => { appRoot.innerHTML = `<section id="page-import" class="page form-container"><div class="formulario"><h2>Importar Catálogo</h2><p style="margin-bottom: 1.5rem;">Suba um arquivo .csv para substituir todo o catálogo atual.</p><button class="btn btn-download" onclick="downloadCSVTemplate()" style="margin-bottom: 2rem; display: inline-block;">&#x2B07; Baixar Layout</button><p><strong>Ordem das Colunas:</strong></p><p style="font-family: monospace; background: #eee; padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0; word-break: break-all;">id,name,price,cost,notes,description,images,stock,reviews</p><p style="margin-bottom: 1.5rem;">Para múltiplas imagens, separe os links com ponto e vírgula (;).</p><input type="file" id="csvFileInput" accept=".csv" style="width: 100%; padding: 1rem; border: 1px dashed #ccc; border-radius: 8px;"><div id="import-status" style="margin-top: 1rem; font-weight: bold;"></div></div></section>`; document.getElementById('csvFileInput').addEventListener('change', handleFileUpload);};
const renderDashboardPage = () => { const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0); let totalCost = 0; const productSalesCount = {}; sales.forEach(sale => { sale.items.forEach(item => { const product = perfumes.find(p => p.id === item.id); if (product) { totalCost += parsePrice(product.cost) * item.quantity; productSalesCount[product.name] = (productSalesCount[product.name] || 0) + item.quantity; } }); }); const totalProfit = totalRevenue - totalCost; const bestsellers = Object.entries(productSalesCount).sort(([,a],[,b]) => b - a).slice(0, 5); appRoot.innerHTML = `<section class="page dashboard-container"><div class="kpi-cards"><div class="kpi-card"><h3>Faturamento Total</h3><div class="value">R$ ${totalRevenue.toFixed(2).replace('.',',')}</div></div><div class="kpi-card"><h3>Lucro Total</h3><div class="value">R$ ${totalProfit.toFixed(2).replace('.',',')}</div></div><div class="kpi-card"><h3>Total de Vendas</h3><div class="value">${sales.length}</div></div></div><div class="dashboard-section"><h2>Vendas ao Longo do Tempo</h2><canvas id="salesChart"></canvas></div><div class="dashboard-section"><h2>Mais Vendidos</h2><ol class="bestsellers-list">${bestsellers.map(item => `<li><span>${item[0]}</span> <strong>${item[1]} un.</strong></li>`).join('') || '<li>Nenhuma venda registrada.</li>'}</ol></div></section>`; if (typeof Chart !== 'undefined' && document.getElementById('salesChart')) { const ctx = document.getElementById('salesChart').getContext('2d'); const salesByMonth = sales.reduce((acc, sale) => { const month = new Date(sale.date).toLocaleString('default', { month: 'short', year: '2-digit' }); acc[month] = (acc[month] || 0) + sale.total; return acc; }, {}); new Chart(ctx, { type: 'bar', data: { labels: Object.keys(salesByMonth), datasets: [{ label: 'Faturamento Mensal', data: Object.values(salesByMonth), backgroundColor: 'rgba(52, 152, 219, 0.5)', borderColor: 'rgba(52, 152, 219, 1)', borderWidth: 1 }] }, options: { scales: { y: { beginAtZero: true } } } }); } };
const updateCartCount = () => { const cartCountElement = document.getElementById('cart-count'); if (!cartCountElement) return; const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); cartCountElement.textContent = totalItems; cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';};
const applyFiltersAndRender = () => { const searchInput = document.getElementById('searchInput'); const sortSelect = document.getElementById('sortSelect'); if (!searchInput || !sortSelect) return; let filteredPerfumes = [...perfumes]; const searchTerm = searchInput.value.toLowerCase(); if (searchTerm) { filteredPerfumes = filteredPerfumes.filter(p => p.name.toLowerCase().includes(searchTerm)); } const sortValue = sortSelect.value; switch (sortValue) { case 'name-asc': filteredPerfumes.sort((a, b) => a.name.localeCompare(b.name)); break; case 'price-asc': filteredPerfumes.sort((a, b) => parsePrice(a.price) - parsePrice(b.price)); break; case 'price-desc': filteredPerfumes.sort((a, b) => parsePrice(b.price) - parsePrice(a.price)); break; } renderPerfumeCards(filteredPerfumes); };
const addToCart = (productId) => { const product = perfumes.find(p => p.id === productId); const itemInCart = cart.find(item => item.id === productId); const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0; if (currentQuantityInCart >= product.stock) { alert('Estoque esgotado!'); return; } if(itemInCart) { itemInCart.quantity++; } else { cart.push({ id: productId, quantity: 1 }); } saveData(); updateCartCount(); alert('Adicionado ao carrinho!'); };
const removeFromCart = (productId) => { cart = cart.filter(item => item.id !== productId); saveData(); updateCartCount(); router(); };
const updateCartQuantity = (productId, newQuantity) => { const quantity = parseInt(newQuantity); const cartItem = cart.find(item => item.id === productId); const product = perfumes.find(p => p.id === productId); if (quantity > product.stock) { alert(`Estoque insuficiente. Apenas ${product.stock} un.`); if (cartItem) cartItem.quantity = product.stock; router(); return; } if (cartItem && quantity > 0) { cartItem.quantity = quantity; } else if (cartItem && quantity <= 0) { cart = cart.filter(item => item.id !== productId); } saveData(); updateCartCount(); router(); };
const checkout = () => { if (!currentUser) { alert("Você precisa estar logado para finalizar o pedido."); window.location.hash = '#login'; return; } const customerName = currentUser.name; const customerCpf = currentUser.document; if (cart.length === 0) { alert("Carrinho vazio!"); return; } const saleId = Date.now().toString(); let message = `Olá, JK Perfumes! Pedido Nº ${saleId}.\n\n*Cliente:*\nNome: ${customerName}\nCPF: ${customerCpf}\n\n*Itens:*\n`; let totalPrice = 0; cart.forEach(cartItem => { const product = perfumes.find(p => p.id === cartItem.id); if(product) { const itemTotal = parsePrice(product.price) * cartItem.quantity; totalPrice += itemTotal; message += `• ${product.name} (Qtd: ${cartItem.quantity}) - R$ ${itemTotal.toFixed(2).replace('.',',')}\n`; product.stock -= cartItem.quantity; } }); message += `\n*Total: R$ ${totalPrice.toFixed(2).replace('.',',')}*`; const newSale = { id: saleId, date: new Date().toISOString(), customer: { name: customerName, cpf: customerCpf }, items: [...cart], total: totalPrice }; sales.push(newSale); cart = []; saveData(); updateCartCount(); const whatsappUrl = `https://wa.me/${meuNumeroWhatsApp}?text=${encodeURIComponent(message)}`; window.open(whatsappUrl, '_blank'); alert("Pedido enviado! Redirecionando..."); window.location.hash = '#catalog'; };
const handleReviewSubmit = (event, productId) => { event.preventDefault(); const form = event.target; const author = form.querySelector('#review-author').value; const ratingInput = form.querySelector('input[name="rating"]:checked'); const comment = form.querySelector('#review-comment').value; if (!author || !ratingInput || !comment) { alert("Preencha todos os campos."); return; } const rating = parseInt(ratingInput.value); const perfume = perfumes.find(p => p.id === productId); if(perfume) { if (!perfume.reviews) { perfume.reviews = []; } perfume.reviews.unshift({ author, rating, comment }); saveData(); router(); } };

const handleFormSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const editingId = form.querySelector('#editPerfumeId').value;
    const files = form.querySelector('#uploadImagem').files;
    const urlsFromTextarea = form.querySelector('#imagem-links').value.split('\n').map(url => url.trim()).filter(url => url);

    const processAndSave = (imageArray) => {
        const perfumeToUpdate = editingId ? perfumes.find(p => p.id === editingId) : null;
        const perfumeData = {
            id: editingId || Date.now().toString(),
            name: form.querySelector('#nome').value,
            stock: parseInt(form.querySelector('#estoque').value, 10) || 0,
            price: form.querySelector('#preco').value,
            cost: form.querySelector('#cost').value,
            notes: form.querySelector('#notas').value,
            description: form.querySelector('#descricao').value,
            images: imageArray.length > 0 ? imageArray : ['https://via.placeholder.com/400x400.png?text=Sem+Imagem'],
            reviews: perfumeToUpdate ? perfumeToUpdate.reviews : []
        };

        // CORREÇÃO: Lógica de salvar/atualizar mais robusta.
        if (editingId) {
            const index = perfumes.findIndex(p => p.id === editingId);
            if (index !== -1) {
                // Se encontrou o perfume, atualiza na posição correta.
                perfumes[index] = perfumeData;
            } else {
                // Se não encontrou (ex: foi deletado), adiciona como novo.
                perfumes.unshift(perfumeData);
            }
        } else {
            // Se não tinha ID, é um perfume novo.
            perfumes.unshift(perfumeData);
        }

        saveData();
        form.reset();
        alert(`Perfume ${editingId && perfumeToUpdate ? 'atualizado' : 'adicionado'}!`);
        window.location.hash = '#catalog';
    };

    if (files.length > 0) {
        const filePromises = Array.from(files).map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(e);
                reader.readAsDataURL(file);
            });
        });
        Promise.all(filePromises).then(base64Images => {
            processAndSave(base64Images);
        }).catch(error => {
            console.error("Erro ao ler arquivos:", error);
            alert("Erro ao carregar imagens.");
        });
    } else {
        processAndSave(urlsFromTextarea);
    }
};

const handleFileUpload = (event) => { const file = event.target.files[0]; if (!file) return; const statusDiv = document.getElementById('import-status'); statusDiv.textContent = 'Lendo...'; const reader = new FileReader(); reader.onload = (e) => { const text = e.target.result; try { const newPerfumes = []; const rows = text.split(/\r?\n/); const header = rows[0].trim().split(','); if (header.length < 8 || header[0] !== 'id' || header[1] !== 'name') { throw new Error('Formato do CSV inválido.'); } for (let i = 1; i < rows.length; i++) { if (rows[i].trim() === '') continue; const values = rows[i].trim().split(','); const perfume = { id: values[0] || Date.now().toString() + i, name: values[1] || '', price: values[2] || 'R$ 0,00', cost: values[3] || 'R$ 0,00', notes: values[4] || '', description: values[5] || '', images: (values[6] || '').split(';').map(url => url.trim()).filter(url => url), stock: parseInt(values[7], 10) || 0, reviews: [] }; newPerfumes.push(perfume); } if (confirm(`Encontrados ${newPerfumes.length} perfumes. Deseja substituir o catálogo atual?`)) { perfumes = newPerfumes; saveData(); alert('Catálogo importado!'); window.location.hash = '#catalog'; } else { statusDiv.textContent = 'Importação cancelada.'; } } catch (error) { statusDiv.textContent = `Erro: ${error.message}`; alert(`Erro: ${error.message}`); } }; reader.readAsText(file); };
const editPerfume = (id) => { localStorage.setItem('perfumeToEditId', id); window.location.hash = '#add-perfume'; };
const removePerfume = (id) => { if (confirm('Tem certeza?')) { perfumes = perfumes.filter(p => p.id !== id); saveData(); router(); } };
const removeReview = (productId, reviewIndex) => { if (!confirm('Excluir avaliação?')) return; const perfume = perfumes.find(p => p.id === productId); if (perfume && perfume.reviews[reviewIndex]) { perfume.reviews.splice(reviewIndex, 1); saveData(); router(); } };
const downloadCSVTemplate = () => { const headers = "id,name,price,cost,notes,description,images,stock,reviews"; const exampleRow = "1,Perfume Exemplo,R$ 199.90,R$ 80.00,Amadeirado,Descrição de exemplo,https://url1.com/foto.jpg;https://url2.com/foto.jpg,15,"; const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + exampleRow; const encodedUri = encodeURI(csvContent); const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", "template_jk_perfumes.csv"); document.body.appendChild(link); link.click(); document.body.removeChild(link);};
const gerarPDF = () => { const catalogElement = document.createElement('div'); const items = perfumes; let html = '<style> .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; } .card { border: 1px solid #eee; padding: 1rem; text-align: center; font-family: sans-serif; } img { max-width: 100%; height: 200px; object-fit: cover; } h3 {font-size: 1.2rem;} p {font-size: 1rem;} </style>'; html += '<h1>Catálogo - JK</h1><div class="grid">'; items.forEach(perfume => { const imageUrl = (perfume.images && perfume.images.length > 0) ? perfume.images[0] : ''; html += `<div class="card"><img src="${imageUrl}" alt="${perfume.name}"><h3>${perfume.name}</h3><p>${perfume.price}</p><p>${perfume.notes}</p></div>`; }); html += '</div>'; catalogElement.innerHTML = html; html2pdf().from(catalogElement).set({ margin: 1, filename: 'catalogo_perfumes.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } }).save(); };
const parsePrice = (priceStr) => { if (typeof priceStr !== 'string') return 0; return parseFloat(priceStr.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0; };

// --- ROTEAMENTO E INICIALIZAÇÃO ---
const routes = {
    '#catalog': renderCatalogPage,
    '#my-account': renderMyDetailsPage,
    '#my-details': renderMyDetailsPage,
    '#my-orders': renderMyOrdersPage,
    '#order-details': renderOrderDetailsPage,
    '#product': renderProductDetailPage,
    '#cart': renderCartPage,
    '#add-perfume': renderAddPerfumePage,
    '#about': renderAboutPage,
    '#login': renderLoginPage,
    '#import': renderImportPage,
    '#dashboard': renderDashboardPage
};

const router = () => {
    const hash = window.location.hash || '#catalog';
    const [path, queryString] = hash.split('?');
    const protectedAdminRoutes = ['#add-perfume', '#import', '#dashboard'];
    if (protectedAdminRoutes.includes(path) && sessionStorage.getItem('isAdminAuthenticated') !== 'true') { window.location.hash = '#login'; return; }
    
    const protectedUserRoutes = ['#my-account', '#my-details', '#my-orders', '#order-details'];
    if (protectedUserRoutes.includes(path) && !currentUser) { window.location.hash = '#login'; return; }

    const pageRenderer = routes[path] || routes['#catalog'];
    const params = new URLSearchParams(queryString);
    if(appRoot) appRoot.innerHTML = '';
    if (typeof pageRenderer === 'function') {
        pageRenderer(params.get('id'));
    } else {
        routes['#catalog']();
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPath = link.getAttribute('href');
        let mainPath = path.split('?')[0];
        if(protectedUserRoutes.includes(mainPath)) {
            mainPath = '#my-account';
        }
        link.classList.toggle('active', linkPath === mainPath);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    if (sessionStorage.getItem('isAdminAuthenticated') === 'true') { document.body.classList.add('admin-view');
    } else if (currentUser) { document.body.classList.add('user-view'); }
    renderNav();

    const registerFormPopup = document.getElementById('register-form-popup');
    const cpfInput = document.getElementById('popup-user-document');
    const cepInput = document.getElementById('popup-user-zipcode');
    if(registerFormPopup) registerFormPopup.addEventListener('submit', handlePopupRegister);
    if(cpfInput) cpfInput.addEventListener('input', applyCpfMask);
    if(cepInput) cepInput.addEventListener('blur', (event) => fetchAddressFromCep(event.target.value));
    
    appRoot.addEventListener('click', (event) => {
        if(event.target.matches('.account-tab')) {
            event.preventDefault();
            const newPath = event.target.getAttribute('href');
            if (newPath && newPath !== window.location.hash) {
                window.location.hash = newPath;
            }
        }
    });

    window.addEventListener('hashchange', router);
    router();
    updateCartCount();
    const notLoggedIn = !sessionStorage.getItem('isAdminAuthenticated') && !currentUser;
    const hasNotSeenPopup = !sessionStorage.getItem('hasSeenRegisterPopup');
    if(notLoggedIn && hasNotSeenPopup) { setTimeout(() => { openRegisterModal(); }, 5000); }
});
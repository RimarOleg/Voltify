let allProducts = [];
let allCategories = [];
let currentCategoryId = 1;

async function init() {
    try {
        const [prodRes, catRes] = await Promise.all([
            fetch('/get-products?v=' + Date.now()),
            fetch('/get-categories?v=' + Date.now())
        ]);
        allProducts = await prodRes.json();
        allCategories = await catRes.json();
        
        if (!Array.isArray(allProducts)) allProducts = [];
        if (!Array.isArray(allCategories)) allCategories = [];
        
        renderCategories();

        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');

        if (searchQuery) {
            const inputField = document.getElementById('searchInput');
            if (inputField) inputField.value = searchQuery;
            applyFilters();
        } else {
            renderProducts(allProducts);
        }

        // Додаємо слухачі на пошук та ціни
        document.getElementById('searchInput')?.addEventListener('input', applyFilters);
        document.getElementById('minPrice')?.addEventListener('input', applyFilters);
        document.getElementById('maxPrice')?.addEventListener('input', applyFilters);

    } catch (e) {
        console.error("Помилка завантаження:", e);
        const container = document.getElementById('catalog-container');
        if (container) container.innerHTML = "<h3>Помилка зв'язку з сервером ❌</h3>";
    }
}

function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";
    
    // Отримуємо значення цін (якщо порожньо — ставимо крайні межі)
    const minPrice = parseFloat(document.getElementById('minPrice')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || Infinity;

    const filtered = allProducts.filter(p => {
        const matchesText = p.name.toLowerCase().includes(searchText);
        const matchesCategory = (Number(currentCategoryId) === 1) || (Number(p.categoryID) === Number(currentCategoryId));
        
        // Фільтрація за ціною
        const productPrice = Number(p.price) || 0;
        const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;

        return matchesText && matchesCategory && matchesPrice;
    });

    renderProducts(filtered);
}

function renderProducts(list) {
    const container = document.getElementById('catalog-container');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = "<h3 style='grid-column: 1/-1; text-align:center; margin-top: 50px; color: #6A6A89;'>Нічого не знайдено 🔍</h3>";
        return;
    }

    container.innerHTML = list.map((p) => {
        const imgSrc = (p.image && p.image.startsWith('data:')) ? p.image : `/goods-images/${p.image}`;
        return `
            <div class="product-card" onclick='openProduct(${JSON.stringify(p).replace(/'/g, "&apos;")})'>
                <img src="${imgSrc}" alt="${p.name}" onerror="this.src='images/placeholder.png'">
                <p><strong>${p.name}</strong></p>
                <p>${p.price} грн</p>
            </div>
        `;
    }).join('');
}
function openProduct(product) {
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    window.location.href = 'goods.html';
}

function renderCategories() {
    const menu = document.getElementById('catalogMenu');
    if (!menu) return;
    menu.innerHTML = allCategories.map(cat => 
        `<a href="#" onclick="filterByCat(event, ${cat.id})">${cat.name}</a>`
    ).join('');
}

function filterByCat(e, id) {
    if (e) e.preventDefault();
    currentCategoryId = id;
    document.getElementById('catalogMenu')?.classList.remove('show');
    applyFilters();
}

document.getElementById('catalogBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('catalogMenu')?.classList.toggle('show');
});

document.addEventListener('click', () => {
    document.getElementById('catalogMenu')?.classList.remove('show');
});

init();

function logoutAdmin(){
    if(confirm("Вийти з режиму адміністратора?")){
        localStorage.setItem("isLoggedIn", "false");
        localStorage.setItem("userRole", "user");
        window.location.reload(); 
    }
}
function updateClock(){
    const now=new Date();
    const time = now.toLocaleTimeString('uk-UA',{
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const year=now.getFullYear();
    const clockElement=document.getElementById('real-time-clock');
    if(clockElement){
        clockElement.innerHTML=`${time} &nbsp; ${year}`;
    }
}
setInterval(updateClock, 1000);
updateClock();
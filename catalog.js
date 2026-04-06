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

        document.getElementById('searchInput')?.addEventListener('input', applyFilters);

    } catch (e) {
        console.error("Помилка завантаження:", e);
    }
}

function applyFilters() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allProducts.filter(p => {
        const matchesText = p.name.toLowerCase().includes(searchText);
        const matchesCategory = (currentCategoryId === 1) || (String(p.categoryID) === String(currentCategoryId));
        return matchesText && matchesCategory;
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

    // Очищуємо контейнер і рендеримо товари
    container.innerHTML = list.map((p, i) => {
        // Використовуємо твої класи div8-div15 для перших 8 товарів.
        // Для 9-го і далі — використовуємо div15, але скидаємо grid-area, 
        // щоб вони автоматично ставали в наступні рядки grid-сітки батька.
        const gridClass = (i < 8) ? `div${i + 8}` : `div15`;
        const autoStyle = (i >= 8) ? 'grid-area: auto; grid-row: auto; grid-column: auto;' : '';

        return `
            <div class="${gridClass}" onclick='openProduct(${JSON.stringify(p).replace(/'/g, "&apos;")})' 
                 style="${autoStyle} cursor: pointer; transition: transform 0.3s ease;">
                <img src="${p.image}" alt="${p.name}" onerror="this.src='images/placeholder.png'" style="width: 150px; height: auto;">
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

// Кнопка каталогу
document.getElementById('catalogBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('catalogMenu').classList.toggle('show');
});

document.addEventListener('click', () => {
    document.getElementById('catalogMenu')?.classList.remove('show');
});

init();
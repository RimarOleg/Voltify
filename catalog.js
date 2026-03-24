const catalogBtn = document.getElementById('catalogBtn');
const catalogMenu = document.getElementById('catalogMenu');

catalogBtn.addEventListener('click', function(e){
    e.stopPropagation();
    catalogMenu.classList.toggle('show');
});
window.addEventListener('click', function() {
    if (catalogMenu.classList.contains('show')) {
        catalogMenu.classList.remove('show');
    }
});


async function loadProducts() {
    const response = await fetch('items.json');
    const products = await response.json();
    
    const container = document.getElementById('products-container');
    
    container.innerHTML = products.map(item => `
        <div class="product-item">
            <img src="${item.img}" alt="${item.name}">
            <p>${item.name}</p>
            <span>${item.price} грн</span>
        </div>
    `).join('');
}

loadProducts();
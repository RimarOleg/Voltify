import {getProducts, getCategories} from './api.js';
import {initClock} from './utils.js';
import* as ui from './ui.js';
initClock();

let allProducts= [];
let allCategories= [];
let currentCategoryId= 1;
const isAdmin= localStorage.getItem('userRole')=== 'admin';

async function init(){
    try{
        const [products, categories]= await Promise.all([
            getProducts(),
            getCategories()
        ]);
        allProducts= Array.isArray(products)? products: [];
        allCategories= Array.isArray(categories)? categories: [];
        ui.renderCategoryMenu('catalogMenu', allCategories, 'window.filterByCat');
        if(isAdmin){
            const cartBtn= document.querySelector('.cart-btn');
            if(cartBtn) cartBtn.style.display= 'none';
        }
        const urlParams= new URLSearchParams(window.location.search);
        const searchQuery= urlParams.get('search');
        if(searchQuery){
            const inputField= document.getElementById('searchInput');
            if(inputField) inputField.value= searchQuery;
            applyFilters();
        } else{
            ui.renderProductList('catalog-container', allProducts, isAdmin);
        }
        const catalogBtn= document.getElementById('catalogBtn');
        const catalogMenu= document.getElementById('catalogMenu');
        if(catalogBtn){
            catalogBtn.onclick= (e)=>{
                e.stopPropagation();
                if(catalogMenu){
                    catalogMenu.classList.toggle('show');
                }
            };
        }
        document.addEventListener('click', (e)=>{
            if(catalogMenu && !catalogMenu.contains(e.target) && e.target!==catalogBtn){
                catalogMenu.classList.remove('show');
            }
        });
        ['searchInput', 'minPrice', 'maxPrice'].forEach(id=>{
            document.getElementById(id)?.addEventListener('input', applyFilters);
        });
    } catch(e){
        console.error("Помилка завантаження каталогу:", e);
        const container= document.getElementById('catalog-container');
        if(container) container.innerHTML= "<h3>Помилка зв'язку з сервером ❌</h3>";
    }
}

function applyFilters(){
    const searchText= document.getElementById('searchInput')?.value.toLowerCase().trim() || "";
    const minPrice= parseFloat(document.getElementById('minPrice')?.value) || 0;
    const maxPrice= parseFloat(document.getElementById('maxPrice')?.value) || Infinity;
    const filtered= allProducts.filter(p=>{
        const matchesText= p.name.toLowerCase().includes(searchText);
        const pCatId= Number(p.categoryID || p.category_id); 
        const matchesCategory= (Number(currentCategoryId)===1) || (pCatId===Number(currentCategoryId));
        const productPrice= Number(p.price) || 0;
        return matchesText && matchesCategory && (productPrice>=minPrice && productPrice<=maxPrice);
    });
    ui.renderProductList('catalog-container', filtered, isAdmin);
}

window.filterByCat= function(e, id){
    if(e) e.preventDefault();
    currentCategoryId= id;
    const catalogMenu= document.getElementById('catalogMenu');
    if(catalogMenu) catalogMenu.classList.remove('show');
    applyFilters();
};
window.openProduct= function(product){
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    window.location.href= 'goods.html';
};
window.addToCart= (productId)=>{
    const product= allProducts.find(p=>p.id===productId);
    if(!product) return;
    if(Number(product.quantity)<=0){
        alert("На жаль, цього товару немає в наявності! ❌");
        return;
    }
    let cart= JSON.parse(localStorage.getItem('cart')) || [];
    const existing= cart.find(i=>i.id===productId);
    if(existing){
        if(existing.quantity>=Number(product.quantity)){
            alert(`Вибачте, на складі доступно лише ${product.quantity} шт. 📦`);
            return;
        }
        existing.quantity+=1;
    } else{
        cart.push({ 
            ...product, 
            stock: Number(product.quantity), 
            quantity: 1 
        });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    if (window.updateCartCounter) window.updateCartCounter();
    alert(`${product.name} додано в кошик! ✅`);
};
init();
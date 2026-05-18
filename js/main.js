import {initClock} from './utils.js';
import* as api from './api.js'; 
import* as ui from './ui.js'; 

function updateCartCounter(){
    const cart= JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems= cart.reduce((sum, item)=>sum+ (parseInt(item.quantity) || 0), 0);
    const counters= ['cart-count', 'cart-count-nav'];
    counters.forEach(id=>{
        const el= document.getElementById(id);
        if(el) el.textContent= totalItems;
    });
}

async function loadRecentProducts(){
    try{
        const products= await api.getProducts(); 
        if(!products || !Array.isArray(products)) return;
        const latest= products.slice(-4).reverse(); 
        ui.renderRecentActions('recent-actions', latest);
    } catch(err){
        console.error("Не вдалося завантажити останні товари:", err);
        const container = document.getElementById('recent-actions');
        if(container){
            container.innerHTML= '<p style="color: #6A6A89; width: 100%; text-align: center;">Не вдалося завантажити новинки</p>';
        }
    }
}

async function initPage(){
    const path= window.location.pathname;
    const page= path.split("/").pop().split("?")[0] || "index.html";
    try{
        initClock();
    } catch(e){
        console.warn("Годинник не ініціалізовано на цій сторінці.");
    }
    updateCartCounter();
    const role= localStorage.getItem('userRole') || 'user';
    const isAdmin= role=== 'admin';
    try{
        if(page==="index.html" || page===""){
            const adminLink= document.getElementById('admin-panel-link');
            const adminBlocks= document.querySelectorAll('.div9, .div10');
            const cartBlock= document.querySelector('.div12');
            const mainCardsContainer= document.querySelector('.main-cards-container');
            if(!isAdmin){
                adminBlocks.forEach(el => el.style.display = 'none');
                if(cartBlock) cartBlock.style.display = 'flex'; 
                if(adminLink) adminLink.style.display = 'none';
                if(mainCardsContainer) mainCardsContainer.classList.add('user-view');
            } else{
                adminBlocks.forEach(el=>el.style.display= 'flex');
                if(cartBlock) cartBlock.style.display= 'none'; 
                if(adminLink) adminLink.style.display= 'block';
                if(mainCardsContainer) mainCardsContainer.classList.remove('user-view');
            }
            await loadRecentProducts();
        }
        if(page.includes("editing.html")) await import("./editing.js");
        else if(page.includes("goods.html")) await import("./goods.js");
        else if(page.includes("catalog.html")) await import("./catalog.js");
        else if(page.includes("cart.html")) await import("./cart.js");
        else if(page.includes("admin-contacts.html")) await import("./admin-contacts.js");
        else if(page.includes("contacts.html")) await import("./contacts.js");
        else if(page.includes("login.html")) await import("./login.js");
        else if(page.includes("report.html")) await import("./report.js");
        else if (page.includes("signin.html") || page==="signin") {console.log("Loading registration module...");
            try{
                const signinModule= await import("./signin.js");
                if(signinModule && signinModule.initRegistration){
                    await signinModule.initRegistration();
                    console.log("Registration module initialized successfully! 🎉");
                } else{
                    console.error("Помилка: функцію initRegistration не знайдено в signin.js");
                }
            } catch(err){
                console.error("Критична помилка завантаження модуля signin.js:", err);
            }
        }
    } catch(error){
        console.error("Помилка завантаження модуля сторінки:", error);
    }
}

window.updateCartCounter= updateCartCounter;
window.goToCatalog= ()=>{ window.location.href = 'catalog.html'; };
window.logout= async ()=>{
    try{
        const response= await fetch('/logout', {method: 'POST'});
        if(response.ok){
            localStorage.removeItem('userRole');
            localStorage.removeItem('isAdmin');
            window.location.href= "index.html";
        }
    } catch(err){
        console.error("Помилка виходу:", err);
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAdmin');
        window.location.href= "index.html";
    }
};

document.addEventListener('click', (e)=>{
    const catalogCard= e.target.closest('.div8');
    const cartCard= e.target.closest('.div12');
    if(catalogCard && !window.location.pathname.includes('editing.html')){
        window.location.href= 'catalog.html';
    }
    if(cartCard){
        window.location.href= 'cart.html';
    }
});
initPage();
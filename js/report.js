import {getProducts, getCategories} from './api.js';
import {initClock} from './utils.js';
import* as ui from './ui.js';
initClock();
async function initReportPage(){
    const role= localStorage.getItem('userRole');
    if(role!=='admin'){
        alert("У вас немає прав доступу!");
        window.location.href= "catalog.html";
        return;
    }
    try{
        const [products, categories]= await Promise.all([
            getProducts(),
            getCategories()
        ]);
        let totalItemsCount= 0; 
        let totalWarehouseValue= 0; 
        const stats= {}; 
        products.forEach(p=>{
            const qty= Number(p.quantity) || 0;
            const price= Number(p.price) || 0;
            totalItemsCount+= qty;
            totalWarehouseValue+= (price* qty);
            const currentCatId= p.categoryID || p.category_id;
            const cat= categories.find(c=>c.id==currentCatId);
            const catName= cat? cat.name: "Інше";
            stats[catName]= (stats[catName] || 0)+ qty;
        });
        ui.renderReportStats({
            totalItems: totalItemsCount,
            totalValue: totalWarehouseValue,
            categoryCount: categories.length
        });
        ui.renderReportChart('categoryChart', stats);
    } catch(e){
        console.error("❌ Помилка побудови статистики:", e);
    }
}
window.logoutAdmin= function(){
    if(confirm("Вийти з режиму адміністратора?")){
        localStorage.setItem("isLoggedIn", "false");
        localStorage.setItem("userRole", "user");
        window.location.href= "catalog.html"; 
    }
};
initReportPage();
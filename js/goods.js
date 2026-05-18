import {deleteProductById} from './api.js';
import {initClock} from './utils.js';
import* as ui from './ui.js';

const CATEGORY_NAMES={
    2: "Ноутбук", 3: "ПК", 4: "Мишка", 
    5: "Навушники", 6: "Монітор", 7: "Підставка"
};
function initGoodsPage(){
    initClock();
    const rawData= localStorage.getItem('selectedProduct');
    if(!rawData){
        console.warn("Товар не знайдено в localStorage, повертаємось до каталогу.");
        window.location.href = 'catalog.html';
        return;
    }
    try{
        const product= JSON.parse(rawData);
        if(product.image){
            const isBase64= product.image.startsWith('data:');
            const isExternal= product.image.startsWith('http');
            if(!isBase64 && !isExternal){
                product.image= `/goods-images/${product.image}`;
            }
        } else{
            product.image= '/goods-images/placeholder.png';
        }
        const role= localStorage.getItem('userRole');
        if(ui && typeof ui.renderFullProductPage==='function'){
            ui.renderFullProductPage(product, role, CATEGORY_NAMES);
        } else{
            console.error("Помилка: функція ui.renderFullProductPage не знайдена!");
        }
    } catch(e){
        console.error("Помилка при читанні даних товару:", e);
    }
}
window.deleteProduct= async function(){
    const data= JSON.parse(localStorage.getItem('selectedProduct'));
    if(!data || !confirm(`Видалити ${data.name}?`)) return;
    try{
        const result= await deleteProductById(data.id);
        if(result?.success){
            localStorage.removeItem('selectedProduct');
            window.location.href= 'catalog.html';
        }
    } catch(e){alert("Помилка видалення");}
};
window.editProduct= function(){
    window.location.href= 'editing.html?edit=true';
};
initGoodsPage();
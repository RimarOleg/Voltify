document.addEventListener('DOMContentLoaded', ()=>{
    const data=localStorage.getItem('selectedProduct');
    if(!data){
        console.error("Дані про товар не знайдені в localStorage");
        window.location.href='catalog.html';
        return;
    }
    const product=JSON.parse(data);
    const role=localStorage.getItem('userRole');
    const adminControls=document.querySelector('.admin-controls');
    if(adminControls){
        adminControls.style.display=(role==='admin') ? 'flex': 'none';
    }
    const categoryNames={
        2: "Ноутбук", 3: "ПК", 4: "Мишка", 
        5: "Навушники", 6: "Монітор", 7: "Підставка"
    };
    const safeSetText=(id, text)=>{
        const el=document.getElementById(id);
        if(el){
            el.textContent = text;
        } 
        else{
            console.warn(`Елемент з ID "${id}" не знайдено в HTML`);
        }
    };
    const formatWarranty=(n)=>{
        const years=parseInt(n) || 0;
        if(years===0) return "немає";
        if(years%10===1 && years%100!== 11) return years+" рік";
        if([2, 3, 4].includes(years % 10) && ![12, 13, 14].includes(years % 100)) return years+" роки";
        return years+" років";
    };
    safeSetText('g-name', product.name || "Без назви");
    safeSetText('g-price', `${product.price || 0} грн`);
    safeSetText('g-warranty', formatWarranty(product.warranty));
    safeSetText('g-year', product.year || "---");
    safeSetText('g-brand', categoryNames[product.categoryID] || "Техніка");
    safeSetText('g-count', `${product.quantity || 0} шт.`);
    safeSetText('t-year', `Рік: ${product.year || '---'}`);
    safeSetText('t-warranty', `Гарантія: ${formatWarranty(product.warranty)}`);
    safeSetText('t-count', `Кількість: ${product.quantity || 0} шт.`);
    safeSetText('t-price', `Ціна: ${product.price || 0} грн`);
    const gImg=document.getElementById('g-img');
    if(gImg){
        gImg.src=product.image ? `/goods-images/${product.image}`: 'images/placeholder.png';
    }
});
async function deleteProduct(){
    const data=JSON.parse(localStorage.getItem('selectedProduct'));
    if(!data || !confirm(`Видалити ${data.name}?`)) return;
    try{
        const res=await fetch(`/api/delete-product/${data.id}`, { method: 'DELETE' });
        if(res.ok){
            localStorage.removeItem('selectedProduct');
            window.location.href='catalog.html';
        }
    } 
    catch(e){alert("Помилка видалення");}
}
function editProduct(){
    window.location.href='editing.html?edit=true';
}
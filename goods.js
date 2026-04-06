document.addEventListener('DOMContentLoaded',()=>{
    const data=localStorage.getItem('selectedProduct');
    if(!data){
        window.location.href='catalog.html';
        return;
    }
    const product=JSON.parse(data);
    const categoryNames={
        1: "Всі товари", 2: "Ноутбук", 3: "ПК", 4: "Мишка", 
        5: "Навушники", 6: "Монітор", 7: "Підставка"
    };
    const formatWarranty=(years)=>{
        const n=Math.abs(parseInt(years))||0;
        const n1=n%10;
        const n10=n%100;
        if(n10>10 && n10<20) return n+" років";
        if(n1>1 && n1<5) return n+" роки";
        if(n1===1) return n+" рік";
        return n + " років";
    };
    const setT=(id, text)=>{
        const el=document.getElementById(id);
        if(el)el.textContent=text;
    };
    setT('g-name', product.name);
    setT('g-warranty', formatWarranty(product.warranty));
    setT('g-year', product.year);
    setT('g-brand', categoryNames[product.categoryID] || "Техніка");
    setT('g-price', `${product.price} грн`);
    setT('g-count', `${product.quantity} шт.`);
    const gImg=document.getElementById('g-img');
    if(gImg)gImg.src=product.image;
    setT('t-year', `Рік: ${product.year}`);
    setT('t-warranty', `Гарантія: ${formatWarranty(product.warranty)}`);
    setT('t-count', `Кількість: ${product.quantity}`);
    setT('t-price', `Ціна: ${product.price} грн`);
});
async function deleteProduct(){
    const dataStr=localStorage.getItem('selectedProduct');
    if(!dataStr)return;
    const data=JSON.parse(dataStr);
    if(confirm(`Видалити товар "${data.name}"?`)){
        try {
            const response=await fetch(`/api/delete-product/${Number(data.id)}`, {
                method: 'DELETE'
            });
            if(response.ok){
                alert("Товар видалено успішно!");
                localStorage.removeItem('selectedProduct'); 
                window.location.href='catalog.html';
            } 
            else{
                alert("Сервер не зміг видалити товар.");
            }
        } 
        catch(err){
            console.error(err);
            alert("Помилка з'єднання з сервером");
        }
    }
}
function editProduct() {
    window.location.href = 'editing.html?edit=true';
}
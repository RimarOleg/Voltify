import {updateProductQuantity} from './api.js'; 
export function renderCart(){
    const container= document.getElementById('cart-items');
    const totalEl= document.getElementById('total-price');
    if(!container || !totalEl) return;
    const cart= JSON.parse(localStorage.getItem('cart')) || [];

    if(cart.length=== 0){
        container.innerHTML= `
            <div style="text-align: center; padding: 40px; color: #6A6A89;">
                <img src="images/cart-icon.png" style="width: 80px; opacity: 0.3; margin-bottom: 20px;">
                <p>Ваш кошик порожній</p>
                <a href="catalog.html" class="admin-btn" style="text-decoration:none; display:inline-block; margin-top:15px;">Перейти до товарів</a>
            </div>`;
        totalEl.textContent = '0 грн';
        return;
    }
    let totalSum= 0;
    container.innerHTML= cart.map((item, index)=>{
        const price= parseFloat(item.price) || 0;
        const quantity= parseInt(item.quantity) || 1;
        const itemSum= price * quantity;
        totalSum+= itemSum;
        return `
            <div class="cart-card" style="display: flex; align-items: center; justify-content: space-between; border: 2px solid #6A6A89; border-radius: 15px; padding: 15px; margin-bottom: 15px; background: white;">
                <img src="images/${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: contain;" onerror="this.src='images/category.png'">
                
                <div style="flex: 1; margin-left: 20px;">
                    <h3 style="margin: 0; color: #3C3C4F;">${item.name}</h3>
                    <p style="margin: 5px 0; color: #6A6A89;">${price} грн / шт.</p>
                </div>

                <div style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="updateQty(${index}, -1)" style="cursor:pointer; padding: 5px 10px;">-</button>
                    <span style="font-weight: bold;">${quantity}</span>
                    <button onclick="updateQty(${index}, 1)" style="cursor:pointer; padding: 5px 10px;">+</button>
                </div>

                <div style="margin: 0 20px; font-weight: bold; width: 100px; text-align: right;">
                    ${itemSum} грн
                </div>

                <button onclick="removeItem(${index})" style="background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 1.2rem;">✕</button>
            </div>
        `;
    }).join('');
    totalEl.textContent= `${totalSum} грн`;
    if(window.updateCartCounter) window.updateCartCounter();
}
window.updateQty= (index, delta)=>{
    let cart= JSON.parse(localStorage.getItem('cart')) || [];
    if(!cart[index]) return;
    if(delta>0 && cart[index].stock!==undefined){
        if(cart[index].quantity >= cart[index].stock){
            alert(`Вибачте, на складі доступно лише ${cart[index].stock} шт. цього товару! 📦`);
            return;
        }
    }
    cart[index].quantity= (cart[index].quantity || 1)+delta;
    if(cart[index].quantity<=0){
        cart.splice(index, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
};
window.removeItem= (index)=>{
    let cart= JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
};
window.checkout= async ()=>{
    const cart= JSON.parse(localStorage.getItem('cart')) || [];
    if(cart.length===0) return alert("Кошик порожній!");
    try{
        for(const item of cart){
            const currentStock= parseInt(item.stock) || 0;
            const boughtQuantity= parseInt(item.quantity) || 0;
            const newStock = currentStock - boughtQuantity;
            await updateProductQuantity(item.id, newStock);
        }
        alert("Замовлення прийнято! Складські запаси оновлено. Ми зателефонуємо вам. 🎉");
        localStorage.removeItem('cart');
        renderCart();
    } catch(error){
        console.error("Помилка під час транзакції списування складу:", error);
        alert("Сталася помилка при оформленні замовлення. Спробуйте ще раз.");
    }
};
renderCart();
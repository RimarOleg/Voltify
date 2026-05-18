const safeSetText=(id, text)=>{
    const el= document.getElementById(id);
    if(el) el.textContent= text;
};
export const formatWarranty=(n)=>{
    const years=parseInt(n) || 0;
    if(years===0) return "немає";
    const lastDigit=years% 10;
    const lastTwoDigits=years% 100;
    if(lastDigit===1 && lastTwoDigits!==11) return `${years} рік`;
    if([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return `${years} роки`;
    return `${years} років`;
};
export const notify= (message, type = 'info')=>{
    alert(message);
};
export const setTableStatus=(containerId, message, isError = false)=>{
    const container = document.getElementById(containerId);
    if(container){
        container.innerHTML= `
            <tr>
                <td colspan="6" style="text-align:center; padding: 20px; color: ${isError ? '#ff4d4d' : 'white'}">
                    ${message}
                </td>
            </tr>
        `;
    }
};
export const toggleElementClass= (id, className, forceRemove=false)=>{
    const el= document.getElementById(id);
    if(!el) return;
    if(forceRemove){
        el.classList.remove(className);
    } else{
        el.classList.toggle(className);
    }
};
export const toggleModal= (modalId, display, errorId= null)=>{
    const modal= document.getElementById(modalId);
    if(modal){
        modal.style.display= display;
        if(display==='none' && errorId){
            const errorMsg= document.getElementById(errorId);
            if(errorMsg) errorMsg.style.display= 'none';
        }
    }
};
export const getFormData= (formSelector)=>{
    const form= document.querySelector(formSelector);
    if(!form) return null;
    const formData= new FormData(form);
    const data= {};
    formData.forEach((value, key)=>{
        data[key]= value.trim();
    });
    return data;
};
export const setFormError= (errorId, message)=>{
    const el= document.getElementById(errorId);
    if(el){
        el.textContent= message || "";
        el.style.display= message? "block": "none";
    }
};
export const renderProductList= (containerId, list, isAdmin= false)=>{
    const container= document.getElementById(containerId);
    if(!container) return;
    if(list.length===0){
        container.innerHTML= `<h3 style='grid-column: 1/-1; text-align:center; margin-top: 50px; color: white;'>Нічого не знайдено 🔍</h3>`;
        return;
    }
    container.innerHTML= list.map((p)=>{
        const imgSrc= p.image 
            ? (p.image.startsWith('http') || p.image.startsWith('data:') ? p.image: `/goods-images/${p.image}`) 
            : 'images/placeholder.png';
        const productData= JSON.stringify(p).replace(/"/g, '&quot;');
        return `
            <div class="product-card" onclick='window.openProduct(${productData})'>
                <div class="product-info">
                    <img src="${imgSrc}" alt="${p.name}" onerror="this.src='images/placeholder.png'">
                    <p><strong>${p.name}</strong></p>
                    <p class="price">${p.price} грн</p>
                </div>
                ${isAdmin ? '' : `
                <button class="buy-btn" onclick="event.stopPropagation(); window.addToCart(${p.id})">
                    Купити
                </button>
                `}
            </div>
        `;
    }).join('');
};
export const renderFullProductPage= (product, role, categoryNames)=>{
    const adminControls= document.querySelector('.admin-controls');
    if(adminControls){
        adminControls.style.display= (role==='admin')? 'flex': 'none';
    }
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
    const gImg= document.getElementById('g-img');
    if(gImg){
        gImg.src= product.image 
            ? (product.image.startsWith('data:') ? product.image: `/goods-images/${product.image}`) 
            : 'images/placeholder.png';
        gImg.onerror= ()=>{ gImg.src= 'images/placeholder.png'; };
    }
};
export const renderCategoryMenu= (menuId, categories, onClickHandlerName)=>{
    const menu= document.getElementById(menuId);
    if(!menu) return;
    menu.innerHTML= categories.map(cat=> 
        `<a href="#" onclick="${onClickHandlerName}(event, ${cat.id})">${cat.name}</a>`
    ).join('');
};
export const updateProductPreview= (data, elements)=>{
    if(elements.name) elements.name.textContent= data.name || "Назва пристрою";
    if(elements.price) elements.price.textContent= `${data.price || 0} грн`;
    if(elements.paragraphs){
        elements.paragraphs.forEach(p=>{
            if(p.textContent.includes('Гарантія:')){
                p.textContent= `Гарантія: ${data.warranty || 0} рік`;
            }
            if(p.textContent.includes('Рік:')){
                p.textContent= `Рік: ${data.year || 2025}`;
            }
        });
    }
};
export const fillProductForm= (p, fields, categoryMap)=>{
    if(fields.name) fields.name.value= p.name || '';
    if(fields.warranty) fields.warranty.value= p.warranty || '';
    if(fields.year) fields.year.value= p.year || '';
    if(fields.price) fields.price.value= p.price || '';
    if(fields.quantity) fields.quantity.value= p.quantity || 0;
    const brandId= p.categoryID || p.category_id;
    const brandName= Object.keys(categoryMap).find(key=>categoryMap[key]== brandId);
    if(brandName && fields.select) fields.select.value= brandName;
};
export const setupInterfaceByRole = (role, callbacks)=>{
    const isAdmin= role==='admin';
    const adminSelectors= ['.div9', '.div10', '.div11', '#admin-panel-link', '.admin-only'];
    adminSelectors.forEach(selector=>{
        const el= document.querySelector(selector);
        if(el){
            if(selector.startsWith('.div')){
                el.style.display= isAdmin? 'flex': 'none';
            } else{
                el.style.display= isAdmin? 'block': 'none';
            }
        }
    });
    const catalogBlock= document.querySelector('.div8');
    if(catalogBlock && !isAdmin){
        catalogBlock.style.margin= "0 auto";
    }
    const profileIcon= document.getElementById('profileIcon');
    if(profileIcon){
        profileIcon.src= isAdmin? 'images/logout.png': 'images/user.png';
        profileIcon.onclick= isAdmin? callbacks.onLogout: callbacks.onOpenLogin;
    }
};
export const renderContactsTable= (containerId, contacts)=>{
    const tableBody= document.getElementById(containerId);
    if(!tableBody) return;
    if(!contacts || contacts.length===0){
        setTableStatus(containerId, "Повідомлень поки немає");
        return;
    }
    tableBody.innerHTML= contacts.map(c=>`
        <tr id="row-${c.id}">
            <td>${new Date(c.created_at).toLocaleString('uk-UA')}</td>
            <td>${c.name || '---'}</td>
            <td><a href="mailto:${c.email}" style="color: #A5A5BD;">${c.email}</a></td>
            <td>${c.message}</td>
            <td><button onclick="window.deleteContact(${c.id})" class="admin-btn" style="padding: 5px 10px;">Видалити</button></td>
        </tr>
    `).join('');
};
export const renderReportStats= (statsData)=>{
    safeSetText('totalProducts', statsData.totalItems);
    safeSetText('totalValue', statsData.totalValue.toLocaleString()+' грн');
    safeSetText('totalCategories', statsData.categoryCount);
};
export const renderReportChart= (canvasId, stats)=>{
    const chartCanvas= document.getElementById(canvasId);
    if(!chartCanvas || typeof Chart==='undefined') return;
    return new Chart(chartCanvas.getContext('2d'),{
        type: 'bar',
        data:{
            labels: Object.keys(stats),
            datasets: [{
                label: 'На складі',
                data: Object.values(stats),
                backgroundColor: 'rgba(165, 165, 189, 0.7)',
                borderColor: '#6A6A89',
                borderWidth: 2
            }]
        },
        options:{ 
            responsive: true,
            scales:{
                y: {beginAtZero: true, ticks: {color: "white"}},
                x: {ticks: {color: "white"}}
            },
            plugins: {
                legend: {labels: {color: "white"}}
            }
        }
    });
};
export const renderRecentActions= (containerId, products)=>{
    const gridWrapper= document.getElementById(containerId);
    if(!gridWrapper) return;
    if(!products || products.length===0){
        gridWrapper.innerHTML = '<p style="color: #6A6A89; width: 100%; text-align: center;">Новинок поки немає 📦</p>';
        return;
    }
    const itemsHtml= products.map(p=>{
        const imgSrc= p.image 
            ? (p.image.startsWith('http') || p.image.startsWith('data:') ? p.image: `/goods-images/${p.image}`) 
            : 'images/placeholder.png';
        return `
            <div class="recent-grid-card" onclick="window.location.href='catalog.html'">
                <div class="recent-img-wrapper">
                    <img src="${imgSrc}" alt="${p.name}" onerror="this.src='images/placeholder.png'">
                    <span class="badge-new">NEW</span>
                </div>
                <div class="recent-card-body">
                    <p class="recent-card-title">${p.name}</p>
                    <p class="recent-card-price">${p.price} грн</p>
                </div>
            </div>
        `;
    }).join('');
    gridWrapper.innerHTML= itemsHtml;
};
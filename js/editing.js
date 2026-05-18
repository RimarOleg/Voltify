import {getCategories, addProduct, updateProduct} from './api.js';
import {initClock} from './utils.js';
import * as ui from './ui.js';
initClock();

async function initEditingPage(){
    const role= localStorage.getItem('userRole');
    if (role!=='admin'){
        alert("У вас немає прав доступу!");
        window.location.href= "catalog.html";
        return;
    }
    const fields={
        name: document.querySelector('.div7 input[placeholder="Назва пристрою"]'),
        warranty: document.querySelector('.div7 input[placeholder="Гарантія"]'),
        year: document.querySelector('.div7 input[placeholder="Рік випуску"]'),
        price: document.querySelector('.div7 input[placeholder="Ціна"]') || document.getElementById('edit-price'),
        quantity: document.querySelector('.div7 input[type="number"]'),
        select: document.getElementById('edit-category') || document.querySelector('.div7 select'),
        file: document.getElementById('edit-image-file') || document.querySelector('.div7 input[type="file"]')
    };
    const previewEls={
        small: document.getElementById('preview-small'),
        name: document.getElementById('preview-name') || document.querySelector('.div8 h3'),price: document.getElementById('preview-price') || document.querySelector('.div8 .price-tag'),
        main: document.getElementById('preview-img') || document.querySelector('.div8 img'),
        paragraphs: document.querySelectorAll('.div8 p')
    };
    const runPreview= ()=>{
        ui.updateProductPreview({
            name: fields.name?.value,
            price: fields.price?.value,
            warranty: fields.warranty?.value,
            year: fields.year?.value
        }, previewEls);
    };
    [fields.name, fields.warranty, fields.year, fields.price].forEach(el=>{
        el?.addEventListener('input', runPreview);
    });
    if(fields.file){
        fields.file.onchange= function(){
            if(this.files?.[0]){
                const reader= new FileReader();
                reader.onload= (e)=>{
                    const result= e.target.result;
                    if(previewEls.main){
                        previewEls.main.src= result;
                        previewEls.main.dataset.base64= result; 
                    }
                    ui.updateImagePreview(result, this.files[0].name, previewEls);
                };
                reader.readAsDataURL(this.files[0]);
            }
        };
    }
    let categoryMap= {};
    const isEditMode= new URLSearchParams(window.location.search).get('edit') === 'true';
    let productId= null;
    try{
        const categories= await getCategories();
        if(fields.select){
            fields.select.innerHTML= '<option value="">Оберіть бренд</option>';
            categories.forEach(cat=>{
                categoryMap[cat.name]= cat.id;
                fields.select.add(new Option(cat.name, cat.name));
            });
        }
        if(isEditMode){
            const p= JSON.parse(localStorage.getItem('selectedProduct'));
            if(p){
                productId= p.id;
                ui.fillProductForm(p, fields, categoryMap);
                if(p.image && previewEls.main){
                    const src= p.image.startsWith('data:')? p.image: `/goods-images/${p.image}`;
                    previewEls.main.src= src;
                }
                const title= document.querySelector('.div7 h2');
                if(title) title.textContent= "Редагування товару";
                const saveBtn= document.querySelector('.save');
                if(saveBtn) saveBtn.textContent= "Оновити товар";
                runPreview();
            }
        }
    } catch(e){console.error("Помилка ініціалізації:", e);}const saveBtn = document.querySelector('.save');
    if(saveBtn){
        saveBtn.onclick= async ()=>{
            if(!fields.name || !fields.price){
                console.error("Не знайдено поля форми!");
                return;
            }
            const productData={
                name: fields.name.value,
                price: parseFloat(fields.price.value) || 0,
                warranty: parseInt(fields.warranty.value) || 0,
                year: parseInt(fields.year.value) || 2024,
                quantity: parseInt(fields.quantity.value) || 0,
                categoryID: categoryMap[fields.select.value] || null,
                image: previewEls.main?.dataset.base64 || previewEls.main?.src || "placeholder.png"
            };
            console.log("Відправка даних:", productData);
            const result= isEditMode? await updateProduct(productId, productData): await addProduct(productData);
            if(result){
                alert("Успішно збережено!");
                localStorage.removeItem('selectedProduct');
                window.location.href= "catalog.html";
            }
        };
    }
    const deleteBtn= document.querySelector('.delete');
    if(deleteBtn){
        deleteBtn.onclick= ()=>{
            if(confirm("Скасувати?")){
                localStorage.removeItem('selectedProduct');
                window.location.href= "catalog.html";
            }
        };
    }
}
initEditingPage();
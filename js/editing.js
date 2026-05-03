document.addEventListener('DOMContentLoaded', async()=>{
    const role=localStorage.getItem('userRole');
    if(role!=='admin'){
        alert("У вас немає прав доступу!");
        window.location.href="catalog.html";
        return;
    }
    const inputName=document.querySelector('.div7 input[placeholder="Назва пристрою"]');
    const inputWarranty=document.querySelector('.div7 input[placeholder="Гарантія"]');
    const inputYear=document.querySelector('.div7 input[placeholder="Рік випуску"]');
    const inputPrice=document.getElementById('edit-price');
    const inputQuantity=document.querySelector('.div7 input[type="number"]:last-of-type');
    const selectBrand=document.getElementById('edit-category');
    const inputFile=document.getElementById('edit-image-file');
    const previewSmall=document.getElementById('preview-small');
    const previewName=document.getElementById('preview-name');
    const previewPrice=document.getElementById('preview-price');
    const previewImg=document.getElementById('preview-img');
    const div8Paragraphs=document.querySelectorAll('.div8 p');
    const updateLivePreview=()=>{
        if(previewName){
            previewName.textContent=inputName.value || "Назва пристрою";
        }
        if(previewPrice){
            previewPrice.textContent=`$${inputPrice.value || 0}`;
        }
        div8Paragraphs.forEach(p=>{
            if(p.textContent.includes('Гарантія:')){
                p.textContent=`Гарантія: ${inputWarranty.value || 0} рік`;
            }
            if(p.textContent.includes('Рік:')){
                p.textContent=`Рік: ${inputYear.value || 2025}`;
            }
        });
    };
    [inputName, inputWarranty, inputYear, inputPrice].forEach(el=>{
        if(el) el.addEventListener('input', updateLivePreview);
    });
    if(inputFile){
        inputFile.addEventListener('change', function(){
            if(this.files && this.files[0]){
                const file=this.files[0];
                const reader=new FileReader();
                reader.onload=(e)=>{
                    if(previewSmall) previewSmall.src=e.target.result;
                    if(previewImg) previewImg.src=e.target.result;
                    if(previewImg) previewImg.dataset.filename=file.name;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    let categoryMap={};
    const urlParams=new URLSearchParams(window.location.search);
    const isEditMode=urlParams.get('edit')==='true';
    let productId=null;
    try{
        const resp=await fetch('/get-categories');
        const categories=await resp.json();
        if(selectBrand){
            selectBrand.innerHTML='';
            categories.forEach(cat=>{
                categoryMap[cat.name]=cat.id;
                const opt=new Option(cat.name, cat.name);
                selectBrand.add(opt);
            });
        }
    } 
    catch(e){
        console.error("Не вдалося завантажити категорії через API");
    }
    if(isEditMode){
        const storedData=localStorage.getItem('selectedProduct');
        if(storedData){
            const p=JSON.parse(storedData);
            productId=p.id;
            inputName.value=p.name || '';
            inputWarranty.value=p.warranty || '';
            inputYear.value=p.year || '';
            inputPrice.value=p.price || '';
            if(inputQuantity) inputQuantity.value=p.quantity || 0;
            if(p.image){
                const fullPath=`/goods-images/${p.image}`;
                if(previewSmall) previewSmall.src=fullPath;
                if(previewImg){
                    previewImg.src=fullPath;
                    previewImg.dataset.filename=p.image;
                }
            }
            const brandName=Object.keys(categoryMap).find(key=>categoryMap[key]===p.categoryID);
            if(brandName) selectBrand.value=brandName;
            document.querySelector('.div7 h2').textContent="Редагування товару";
            document.querySelector('.save').textContent="Оновити товар";
            updateLivePreview();
        }
    }
    document.querySelector('.save').addEventListener('click', async()=>{
        const productData={
            name: inputName.value,
            price: parseFloat(inputPrice.value) || 0,
            warranty: parseInt(inputWarranty.value) || 0,
            year: parseInt(inputYear.value) || 2024,
            quantity: parseInt(inputQuantity.value) || 0,
            categoryID: categoryMap[selectBrand.value] || null,
            image: (previewImg && previewImg.dataset.filename) ? previewImg.dataset.filename : "placeholder.png"
        };
        const url=isEditMode ? `/api/update-product/${productId}`: '/add-product';
        const method=isEditMode ? 'PUT': 'POST';
        try{
            const response=await fetch(url,{
                method: method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(productData)
            });
            const result=await response.json();
            if(result.success){
                alert(isEditMode ? "Оновлено!" : "Додано!");
                localStorage.removeItem('selectedProduct');
                window.location.href="catalog.html";
            } 
            else{
                alert("Помилка: "+result.message);
            }
        } 
        catch(error){
            alert("Помилка з'єднання з сервером");
        }
    });
    document.querySelector('.delete').addEventListener('click',()=>{
        window.location.href="catalog.html";
    });
});
document.addEventListener('DOMContentLoaded', ()=>{
    const role=localStorage.getItem('userRole');
    if (role!=='admin'){
        alert("У вас немає прав доступу до цієї сторінки!");
        window.location.href="catalog.html"; 
        return; 
    }
    const inputName=document.querySelector('.div7 input[placeholder="Назва пристрою"]');
    const inputWarranty=document.querySelector('.div7 input[placeholder="Гарантія"]');
    const inputYear=document.querySelector('.div7 input[placeholder="Рік випуску"]');
    const selectBrand=document.getElementById('edit-category');
    const inputPrice=document.getElementById('edit-price');
    const inputQuantity=document.querySelector('.div7 input[type="number"]:last-of-type');
    const inputFile=document.getElementById('edit-image-file');
    const previewName=document.getElementById('preview-name');
    const previewPrice=document.getElementById('preview-price');
    const previewImg=document.getElementById('preview-img');
    const previewDetails=document.querySelectorAll('.div8 p');
    const categoryMap={
        "Ноутбук": 2, "ПК": 3, "Мишка": 4, "Навушники": 5, "Монітор": 6, "Підставка": 7
    };
    const urlParams=new URLSearchParams(window.location.search);
    const isEditMode=urlParams.get('edit')==='true';
    let productId=null;
    const formatWarranty=(years)=>{
        const n=Math.abs(parseInt(years))||0;
        const n1=n%10;
        const n10=n%100;
        if(n10>10 && n10<20) return n+" років";
        if(n1>1 && n1<5) return n+" роки";
        if(n1===1) return n+" рік";
        return n+" років";
    };
    const updatePreview=()=>{
        if(previewName) previewName.textContent=inputName.value||"Назва пристрою";
        if(previewPrice) previewPrice.textContent=inputPrice.value?`${inputPrice.value} грн`:"0 грн";
        if(previewDetails[0]) previewDetails[0].textContent=`Гарантія: ${formatWarranty(inputWarranty.value)}`;
        if(previewDetails[1]) previewDetails[1].textContent=`Рік: ${inputYear.value||2025}`;
    };
    if(isEditMode){
        const storedData=localStorage.getItem('selectedProduct');
        if(storedData){
            const p=JSON.parse(storedData);
            productId=p.id;
            inputName.value=p.name;
            inputWarranty.value=p.warranty;
            inputYear.value=p.year;
            inputPrice.value=p.price;
            if(inputQuantity)inputQuantity.value=p.quantity;
            previewImg.src=p.image.startsWith('data:')?p.image:`/goods-images/${p.image}`;
            const brandName=Object.keys(categoryMap).find(key=>categoryMap[key]===p.categoryID);
            if(brandName)selectBrand.value=brandName;
            document.querySelector('.div7 h2').textContent="Редагування товару";
            document.querySelector('.save').textContent="Оновити товар";
            updatePreview();
        }
    }
    inputFile.addEventListener('change', function(){
        if(this.files[0]){
            const reader=new FileReader();
            reader.onload=(e)=>{
                previewImg.src=e.target.result; 
            };
            reader.readAsDataURL(this.files[0]);
        }
    });
    [inputName, inputPrice, inputWarranty, inputYear, inputQuantity].forEach(el=>{
        el?.addEventListener('input', updatePreview);
    });
    document.querySelector('.save').addEventListener('click', async()=>{
        let imageData=previewImg.src;
        if(imageData.includes('/goods-images/')){
            imageData=imageData.split('/').pop(); 
        }
        const productData={
            id: isEditMode ? Number(productId):Date.now(),
            name: inputName.value || "Без назви",
            categoryID: categoryMap[selectBrand.value] || 1,
            price: parseInt(inputPrice.value) || 0,
            warranty: parseInt(inputWarranty.value) || 0,
            year: parseInt(inputYear.value) || 2025,
            quantity: inputQuantity ? parseInt(inputQuantity.value) : 0,
            image: imageData
        };
        const url=isEditMode?`/api/update-product/${productId}`:'/add-product';
        const method=isEditMode?'PUT':'POST';
        try{
            const response=await fetch(url,{
                method: method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(productData)
            });
            if(response.ok){
                alert(isEditMode?"Товар успішно оновлено!":"Товар успішно додано!");
                window.location.href="catalog.html";
            } 
            else{
                alert("Помилка при збереженні на сервері!");
            }
        } 
        catch(error){
            console.error("Помилка:", error);
            alert("Помилка з'єднання з сервером");
        }
    });
    document.querySelector('.delete').addEventListener('click', ()=>{
        if(confirm("Очистити всі поля?")){
            if(isEditMode){
                window.location.href="editing.html"; 
            } 
            else{
                location.reload();
            }
        }
    });
});
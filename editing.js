document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Знаходимо всі елементи введення (зліва)
    const inputName = document.querySelector('.div7 input[placeholder="Назва пристрою"]');
    const inputWarranty = document.querySelector('.div7 input[placeholder="Гарантія"]');
    const inputYear = document.querySelector('.div7 input[placeholder="Рік випуску"]');
    const selectBrand = document.getElementById('edit-category');
    const inputPrice = document.getElementById('edit-price');
    const inputQuantity = document.querySelector('.div7 input[type="number"]:nth-of-type(3)'); // Кількість
    const inputFile = document.getElementById('edit-image-file');

    // 2. Знаходимо елементи, куди будемо виводити дані (справа)
    const previewName = document.getElementById('preview-name');
    const previewPrice = document.getElementById('preview-price');
    const previewImg = document.getElementById('preview-img');
    const previewSmall = document.getElementById('preview-small');
    
    // Знаходимо параграфи в div8 для гарантії та року
    const previewDetails = document.querySelectorAll('.div8 p');
    const warrantyDisplay = previewDetails[0]; // Перший <p>
    const yearDisplay = previewDetails[1];     // Другий <p>

    // 3. Функція оновлення тексту
    const updatePreview = () => {
        previewName.textContent = inputName.value || "Назва пристрою";
        previewPrice.textContent = inputPrice.value ? `$${inputPrice.value}` : "$0";
        warrantyDisplay.textContent = `Гарантія: ${inputWarranty.value || 0} рік`;
        yearDisplay.textContent = `Рік: ${inputYear.value || 2025}`;
    };

    // 4. Обробка завантаження фото
    inputFile.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Оновлюємо обидві картинки (маленьку в формі та велику в прев'ю)
                previewImg.src = e.target.result;
                previewSmall.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    // 5. Додаємо слухачі подій "input" (спрацьовує при кожному натисканні клавіші)
    inputName.addEventListener('input', updatePreview);
    inputPrice.addEventListener('input', updatePreview);
    inputWarranty.addEventListener('input', updatePreview);
    inputYear.addEventListener('input', updatePreview);

    // Кнопка "Скасувати" — очищує форму
    document.querySelector('.delete').addEventListener('click', () => {
        if(confirm("Ви впевнені, що хочете скасувати зміни?")) {
            location.reload(); // Найпростіший спосіб скинути все
        }
    });

    // Кнопка "Зберегти"
    document.querySelector('.save').addEventListener('click', () => {
        alert("Дані збережено успішно!");
        // Тут можна додати логіку відправки на сервер через fetch()
    });
});
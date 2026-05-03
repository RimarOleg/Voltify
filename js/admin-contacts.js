document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('contacts-body');
    
    // 1. Перевірка локальної ролі
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
        alert("Доступ заборонено! Ви не є адміністратором.");
        window.location.href = "catalog.html";
        return;
    }

    try {
        // 2. Запит до сервера з передачею сесії
        const response = await fetch('/api/get-contacts', { 
            credentials: 'include' 
        });

        // Якщо сервер повернув 403, значить сесія на сервері не активна
        if (response.status === 403) {
            tableBody.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center">Помилка: Сервер не підтвердив права адміна. Перезайдіть в акаунт.</td></tr>';
            return;
        }

        const contacts = await response.json();

        if (!Array.isArray(contacts)) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center">Помилка формату даних</td></tr>';
            return;
        }

        if (contacts.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center">Повідомлень поки немає</td></tr>';
            return;
        }

        // 3. Рендеринг
        tableBody.innerHTML = contacts.map(c => `
    <tr id="row-${c.id}">
        <td class="date-cell">${new Date(c.created_at).toLocaleString('uk-UA')}</td>
        <td class="name-cell">${c.name}</td>
        <td><a href="mailto:${c.email}" class="email-link">${c.email}</a></td>
        <td>${c.message}</td>
        <td>
            <button onclick="deleteContact(${c.id})" class="btn-delete">Видалити</button>
        </td>
    </tr>
`).join('');

    } catch (err) {
        console.error("Fetch error:", err);
        tableBody.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center">Помилка завантаження (перевірте консоль)</td></tr>';
    }
});
async function deleteContact(id) {
    if (!confirm("Ви впевнені, що хочете видалити це повідомлення?")) return;

    try {
        const response = await fetch(`/api/delete-contact/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const result = await response.json();
        if (result.success) {
            // Видаляємо рядок з таблиці без оновлення сторінки
            document.getElementById(`row-${id}`).remove();
        } else {
            alert("Помилка: " + result.message);
        }
    } catch (err) {
        alert("Не вдалося з'єднатися з сервером");
    }
}

function updateClock(){
    const now=new Date();
    const time=now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const year=now.getFullYear();
    const clockElement=document.getElementById('real-time-clock');
    if(clockElement){
        clockElement.innerHTML=`${time} &nbsp; ${year}`;
    }
}
setInterval(updateClock, 1000);
updateClock();

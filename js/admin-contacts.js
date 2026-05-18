import {getAllContacts, deleteContactById} from './api.js';
import* as ui from './ui.js';
async function initAdminContacts(){
    const TABLE_ID= 'contacts-body';
    if(localStorage.getItem('userRole')!=='admin'){
        if(ui.notify) ui.notify("Доступ заборонено!");
        window.location.href= "catalog.html";
        return;
    }
    try{
        const response= await getAllContacts();
        let contacts= [];
        if(response && response.status){
            if(response.status===403){
                ui.setTableStatus(TABLE_ID, "Помилка: Доступ заборонено сервером.", true);
                return;
            }
            contacts= await response.json();
        } else{
            contacts= response;
        }
        if(ui.renderContactsTable){
            ui.renderContactsTable(TABLE_ID, contacts);
        } else{
            console.error("Метод ui.renderContactsTable не знайдено!");
        }
    } catch(err){
        console.error("Помилка завантаження контактів:", err);
        if(ui.setTableStatus){
            ui.setTableStatus(TABLE_ID, "Помилка з'єднання з сервером", true);
        }
    }
}
window.deleteContact= async function(id){
    if(!confirm("Видалити це повідомлення?")) return;
    try{
        const result= await deleteContactById(id);
        if(result?.success || result?.status===200){
            const row= document.getElementById(`row-${id}`);
            if(row) row.remove();
            const tableBody= document.getElementById('contacts-body');
            if(tableBody && tableBody.children.length===0){
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">Повідомлень немає</td></tr>';
            }
        } else{
            alert("Помилка видалення: "+ (result?.message || "невідома помилка"));
        }
    } catch(err){
        alert("Помилка при видаленні");
    }
};
initAdminContacts();
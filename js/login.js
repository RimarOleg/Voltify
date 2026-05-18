import {loginUser} from './api.js';
import {initClock} from './utils.js';
import* as ui from './ui.js';
initClock();

async function initLoginPage(){
    const loginForm= document.querySelector('form');
    if(!loginForm) return;
    loginForm.onsubmit= async (e)=>{
        e.preventDefault();
        const data= ui.getFormData('form');
        if(!data.login || !data.password){
            ui.notify("Введіть логін та пароль!");
            return;
        }
        try{
            const result= await loginUser(data.login, data.password);
            if(result?.success){
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userLogin', result.login);
                localStorage.setItem('userRole', result.isAdmin? 'admin': 'user');
                ui.notify(`Вітаємо, ${result.login}!`);
                window.location.href= 'index.html'; 
            } else{
                ui.notify("Помилка входу: "+ (result?.message || "Невірні дані"));
            }
        } catch(error){
            ui.notify("Сервер не відповідає.");
        }
    };
}
initLoginPage();
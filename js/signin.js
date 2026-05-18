import {registerUser} from './api.js';
import {initClock} from './utils.js';
import* as ui from './ui.js';
initClock();
export async function initRegistration(){
    const registrationForm= document.querySelector('form');
    console.log("signin.js: Форму знайдено?", registrationForm);
    if(!registrationForm) return;
    registrationForm.onsubmit= async (e)=>{
        e.preventDefault(); 
        console.log("signin.js: Сабміт перехоплено!");
        const data= ui.getFormData('form');
        if(!data.login || !data.password){
            ui.notify("Будь ласка, заповніть усі поля!");
            setTimeout(()=>{ window.location.href= 'signin.html'; }, 1500);
            return;
        }
        if(data.login.length<3){
            ui.notify("Логін має бути не менше 3 символів!");
            setTimeout(()=>{ window.location.href= 'signin.html'; }, 1500);
            return;
        }
        if(data.password.length<6){
            ui.notify("Пароль має бути не менше 6 символів!");
            setTimeout(()=>{window.location.href= 'signin.html';}, 1500);
            return;
        }
        try{
            const result= await registerUser(data.login, data.password);
            if(result?.success){
                ui.notify("Реєстрація успішна! Тепер ви можете увійти.");
                setTimeout(()=>{window.location.href= 'login.html';}, 1500);
            } else{
                ui.notify(result?.message || "Цей логін уже зайнятий");
                setTimeout(()=>{window.location.href= 'signin.html';}, 2000);
            }
        } catch(error){
            ui.notify("Сервер не відповідає");
            setTimeout(()=>{window.location.href= 'signin.html';}, 2000);
        }
    };
}
initRegistration();
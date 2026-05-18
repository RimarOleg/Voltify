import {loginUser, getRecentActions} from './api.js';
import {initClock} from './utils.js';
import* as ui from './ui.js'; 
initClock();

let targetUrl= "catalog.html";
const passInput= document.getElementById("passInput");
window.openLogin= function(url){
    targetUrl= url;
    ui.toggleModal("loginModal", "block", "error");
    if(passInput) passInput.value= "";
};
window.closeModal= function(){
    ui.toggleModal("loginModal", "none");
};
window.logoutAdmin= function(){
    if(confirm("Вийти з режиму адміністратора?")){
        localStorage.setItem("isLoggedIn", "false");
        localStorage.setItem("userRole", "user");
        window.location.reload();
    }
};

async function checkLogin(){
    const enteredPass= passInput.value;
    const loginInput= document.querySelector('input[name="login"]');
    const enteredLogin= loginInput? loginInput.value: "admin";
    try{
        const result= await loginUser(enteredLogin, enteredPass);
        if(result.success){ 
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userRole", result.data?.role || "admin");
            window.location.href= targetUrl;
        } else{
            ui.showLoginError("error");
        }
    } catch(error){
        console.error("Помилка:", error);
        alert("Сервер не відповідає.");
    }
}
const submitBtn= document.getElementById("submitPass");
if(submitBtn) submitBtn.onclick= checkLogin;
window.onclick= (event)=>{
    if(event.target==document.getElementById("loginModal")) window.closeModal();
};

document.addEventListener('DOMContentLoaded', ()=>{
    if(localStorage.getItem('isLoggedIn')!=='true'){
        localStorage.setItem('userRole', 'user');
    }
    const role= localStorage.getItem('userRole') || 'user';
    ui.setupInterfaceByRole(role,{
        onLogout: window.logoutAdmin,
        onOpenLogin: window.openLogin
    });
    loadRecentActions(); 
});

async function loadRecentActions(){
    try{
        const products= await getProducts(); 
        const latestProducts= products.slice(-4).reverse();
        ui.renderRecentActions('recent-actions', latestProducts);
    } catch(err){
        console.error("Помилка завантаження новинок:", err);
        const container= document.getElementById('recent-actions');
        if(container) container.innerHTML= '<span style="color: #6A6A89;">Не вдалося завантажити новинки</span>';
    }
}
const modal=document.getElementById("loginModal");
const passInput=document.getElementById("passInput");
const errorMsg=document.getElementById("error");
let targetUrl="catalog.html";
function openLogin(url){
    targetUrl=url;
    if(modal){
        modal.style.display="block";
        passInput.value="";
        errorMsg.style.display="none";
    }
}
function closeModal(){
    if(modal)modal.style.display="none";
}
async function checkLogin(){
    const enteredPass=passInput.value;
    const loginInput=document.querySelector('input[name="login"]');
    const enteredLogin=loginInput?loginInput.value: "admin"; 
    try{
        const response=await fetch('/login',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({login: enteredLogin, password: enteredPass})
        });
        const result=await response.json();

        if(response.ok && result.success){
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userRole", result.role); 
            window.location.href=targetUrl;
        } 
        else{
            if(errorMsg)errorMsg.style.display="block";
        }
    } 
    catch(error){
        console.error("Помилка:", error);
        alert("Сервер не відповідає.");
    }
}
const submitBtn=document.getElementById("submitPass");
if(submitBtn)submitBtn.onclick=checkLogin;
window.onclick=function(event){
    if(event.target==modal)closeModal();
}
document.addEventListener('DOMContentLoaded', ()=>{
    if(localStorage.getItem('isLoggedIn')!=='true'){
        localStorage.setItem('userRole', 'user');
    }
    const role=localStorage.getItem('userRole') || 'user'; 
    const editingBlock=document.querySelector('.div9');
    const reportBlock=document.querySelector('.div10');
    const actionsBlock=document.querySelector('.div11');
    const catalogBlock=document.querySelector('.div8');
    if(role!=='admin'){
        if(editingBlock) editingBlock.style.display='none';
        if(reportBlock) reportBlock.style.display='none';
        if(actionsBlock) actionsBlock.style.display='none';    
        if (catalogBlock) {
            catalogBlock.style.gridColumn="1 / -1"; 
            catalogBlock.style.width="400px"; 
            catalogBlock.style.margin="0 auto";
            catalogBlock.style.display="flex";
            catalogBlock.style.flexDirection="column";
            catalogBlock.style.alignItems="center";
            catalogBlock.style.padding="20px";
        }
    } 
    else{
        if(editingBlock) editingBlock.style.display='block';
        if(reportBlock) reportBlock.style.display='block';
        if(actionsBlock) actionsBlock.style.display='block';
        if(catalogBlock){
            catalogBlock.style.gridColumn=""; 
            catalogBlock.style.width=""; 
            catalogBlock.style.margin="";
        }
    }
});
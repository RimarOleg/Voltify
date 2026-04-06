const modal=document.getElementById("loginModal");
const passInput=document.getElementById("passInput");
const errorMsg=document.getElementById("error");
let targetUrl="catalog.html";
function openLogin(url){
    targetUrl=url;
    modal.style.display="block";
    passInput.value="";
    errorMsg.style.display="none";
}
function closeModal(){
    modal.style.display="none";
}
async function checkLogin(){
    const enteredPass=passInput.value;
    try{
        const response=await fetch('data.profile/users.json');
        if(!response.ok) throw new Error("JSON не знайдено");
        const users=await response.json();
        const userFound=users.find(u => u.password === enteredPass);
        if(userFound){
            localStorage.setItem("isLoggedIn", "true");
            window.location.href=targetUrl;
        }else{
            errorMsg.style.display="block";
        }
    }catch(error){
        console.error("Помилка:", error);
        alert("Помилка бази даних. Перевірте Live Server.");
    }
}
document.getElementById("submitPass").onclick=checkLogin;
window.onclick=function(event){
    if (event.target==modal) closeModal();
}
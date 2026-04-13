document.addEventListener('DOMContentLoaded', ()=>{
    const registrationForm=document.querySelector('form');
    if(!registrationForm)return; 
    registrationForm.addEventListener('submit', async(e)=>{
        e.preventDefault();
        const loginInput=document.querySelector('input[name="login"]').value;
        const passwordInput=document.querySelector('input[name="password"]').value;
        try{
            const response=await fetch('/register',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({login: loginInput, password: passwordInput})
            });
            const result=await response.json();
            if(response.ok && result.success){
                localStorage.clear();
                localStorage.setItem('userRole', result.role); 
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href='/dashboard';
            } 
            else{
                alert(result.message || "Цей логін уже зайнятий!");
            }
        } 
        catch(error){
            console.error("Помилка мережі:", error);
            alert("Не вдалося з'єднатися з сервером.");
        }
    });
});
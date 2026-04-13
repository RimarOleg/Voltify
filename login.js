document.addEventListener('DOMContentLoaded',()=>{
    const loginForm=document.querySelector('form');
    if(!loginForm)return;
    loginForm.addEventListener('submit', async(e)=>{
        e.preventDefault();
        const loginInput=document.querySelector('input[name="login"]').value;
        const passwordInput=document.querySelector('input[name="password"]').value;
        try{
            const response=await fetch('/login',{
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
                alert("Помилка: "+(result.message || "Невірні дані для входу"));
            }
        } 
        catch(error){
            console.error("Помилка мережі:", error);
            alert("Сервер не відповідає.");
        }
    });
});
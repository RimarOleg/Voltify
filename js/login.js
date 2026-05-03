document.addEventListener('DOMContentLoaded', ()=>{
    const loginForm=document.querySelector('form');
    if(!loginForm) return;
    loginForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const loginInput=document.querySelector('input[name="login"]').value.trim();
        const passwordInput=document.querySelector('input[name="password"]').value.trim();
        console.log("Спроба входу для:", loginInput);
        try{
            const response=await fetch('/login',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    login: loginInput, 
                    password: passwordInput 
                })
            });
            const result=await response.json();
            console.log("Відповідь сервера:", result);
            if(response.ok && result.success){
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', result.isAdmin ? 'admin' : 'user');
                localStorage.setItem('userLogin', result.login);
                alert(`Вітаємо, ${result.login}!`);
                if(result.isAdmin){
                    window.location.href='editing.html';
                } 
                else{
                    window.location.href='catalog.html';
                }
            } 
            else{
                alert("Помилка входу: "+(result.message || "Невірні дані"));
            }
        } 
        catch(error){
            console.error("Критична помилка запиту:", error);
            alert("Сервер не відповідає. Перевір консоль VS Code.");
        }
    });
});
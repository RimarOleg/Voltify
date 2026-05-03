document.addEventListener('DOMContentLoaded', ()=>{
    const registrationForm=document.querySelector('form');
    if(!registrationForm) return;
    registrationForm.addEventListener('submit', async(e)=>{
        e.preventDefault();
        const loginInput=document.querySelector('input[name="login"]').value.trim();
        const passwordInput=document.querySelector('input[name="password"]').value.trim();
        if(passwordInput.length<6){
            alert("Пароль має бути не менше 6 символів для безпечного хешування!");
            return;
        }
        try{
            const response=await fetch('/register',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    login: loginInput, 
                    password: passwordInput 
                })
            });
            const result=await response.json();
            if(response.ok && result.success){
                alert("Реєстрація успішна! Тепер ви можете увійти.");
                window.location.href='login.html'; 
            } 
            else{
                alert("Помилка: "+(result.message || "Цей логін уже зайнятий"));
            }
        } 
        catch(error){
            console.error("Помилка реєстрації:", error);
            alert("Сервер не відповідає.");
        }
    });
});
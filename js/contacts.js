const isValidEmail=(email)=>{
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
};
const validateContactForm=({ name, email, message })=>{
    const cleanName=name.trim();
    const cleanEmail=email.trim();
    const cleanMessage=message.trim();
    if(!cleanName || !cleanEmail || !cleanMessage){
        return{valid: false, error: "Усі поля обов'язкові"};
    }
    if(cleanName.length<2){
        return{valid: false, error: "Ім'я повинно містити щонайменше 2 символи"};
    }
    if(!isValidEmail(cleanEmail)){
        return{valid: false, error: "Введіть коректний email"};
    }
    if(cleanMessage.length<10){
        return{valid: false, error: "Повідомлення повинно містити хоча б 10 символів"};
    }
    return{valid: true};
};
const form=document.getElementById('contactForm');
const errorElement=document.getElementById('error-message');
form.addEventListener('submit', function(e){
    const formData={
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };
    const result=validateContactForm(formData);
    if(!result.valid){
        e.preventDefault(); 
        errorElement.textContent=result.error;
        errorElement.style.display='block';
        errorElement.style.animation='shake 0.3s';
        setTimeout(()=>{errorElement.style.animation='';}, 300);
    } 
    else{
        errorElement.style.display='none';
        alert('Форму успішно відправлено!');
    }
});
document.addEventListener('DOMContentLoaded', ()=>{
    const submitBtn=document.querySelector('.btn-primary, button'); 
    const inputName=document.querySelector('input[placeholder="Ваше ім\'я"]');
    const inputEmail=document.querySelector('input[placeholder="Email"]');
    const inputMessage=document.querySelector('textarea[placeholder="Ваше повідомлення"]');
    if(submitBtn){
        submitBtn.addEventListener('click', async (e)=>{
            e.preventDefault(); 
            const contactData={
                name: inputName.value,
                email: inputEmail.value,
                message: inputMessage.value
            };
            try{
                const response=await fetch('/api/save-contact',{
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(contactData)
                });
                const result=await response.json();
                if(result.success){
                    alert("Дякуємо! Ваше повідомлення надіслано.");
                    inputName.value='';
                    inputEmail.value='';
                    inputMessage.value='';
                } 
                else{
                    alert("Помилка: "+result.message);
                }
            } 
            catch(error){
                console.error("Помилка відправки:", error);
                alert("Не вдалося з'єднатися з сервером");
            }
        });
    }
});
function updateClock(){
    const now=new Date();
    const time=now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const year=now.getFullYear();
    const clockElement=document.getElementById('real-time-clock');
    if(clockElement){
        clockElement.innerHTML=`${time} &nbsp; ${year}`;
    }
}
setInterval(updateClock, 1000);
updateClock();

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
import{sendContactMessage} from './api.js';
import* as ui from './ui.js';
const isValidEmail= (email)=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
const getValidationError= (data)=>{
    if(!data.name || !data.email || !data.message) return "Усі поля обов'язкові";
    if(data.name.length<2) return "Ім'я занадто коротке";
    if(!isValidEmail(data.email)) return "Введіть коректний email";
    if(data.message.length<10) return "Повідомлення занадто коротке (мін. 10 симв.)";
    return null;
};

async function initContactForm(){
    const form= document.getElementById('contactForm');
    if(!form) return;
    form.onsubmit= async (e)=>{
        e.preventDefault();
        const contactData= ui.getFormData('#contactForm');
        const error= getValidationError(contactData);
        ui.setFormError('error-message', error);
        if(error) return;
        try{
            const result= await sendContactMessage(contactData);
            if(result?.success){
                ui.notify('Дякуємо! Ваше повідомлення надіслано.');
                form.reset(); 
            } else{
                ui.notify('Помилка: '+ (result?.message || 'не вдалося відправити'));
            }
        } catch(err){
            ui.notify('Сервер не відповідає. Спробуйте пізніше.');
        }
    };
}
initContactForm();
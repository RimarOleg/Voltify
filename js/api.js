const BASE_URL= ""; 
async function handleResponse(response){
    try{
        const data= await response.json();
        if(!response.ok){
            return{
                success: false,
                message: data.message || `Помилка сервера: ${response.status}`
            };
        }
        return data;
    } catch(parseError){
        console.error("Не вдалося розпарсити відповідь сервера:", parseError);
        return{
            success: false,
            message: "Сталася помилка при обробці відповіді від сервера."
        };
    }
}
export async function getProducts(){
    const response= await fetch(`/api/products?v=${Date.now()}`);
    return handleResponse(response);
}
export async function addProduct(productData){
    const response= await fetch('/api/products',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(productData),
        credentials: 'include' 
    });
    return handleResponse(response);
}
export async function updateProduct(id, productData){
    const response= await fetch(`/api/update-product/${id}`,{
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(productData),
        credentials: 'include'
    });
    return handleResponse(response);
}
export async function deleteProductById(id){
    const response= await fetch(`/api/delete-product/${id}`,{
        method: 'DELETE',
        credentials: 'include' 
    });
    return handleResponse(response);
}
export async function getCategories(){
    const response= await fetch(`/api/categories?v=${Date.now()}`);
    return handleResponse(response);
}
export async function registerUser(login, password){
    try{
        const response= await fetch('/register',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({login, password})
        });
        return await handleResponse(response); 
    } catch(networkError){
        console.error("Мережева помилка у registerUser:", networkError);
        return{ 
            success: false, 
            message: "Не вдалося з'єднатися з сервером. Перевірте підключення до інтернету." 
        };
    }
}
export async function loginUser(login, password){
    const response= await fetch('/login',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({login, password})
    });
    return handleResponse(response);
}
export async function sendContactMessage(contactData){
    const response = await fetch('/api/save-contact',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(contactData)
    });
    return handleResponse(response);
}
export async function getAllContacts(){
    const response = await fetch('/api/get-contacts',{ 
        method: 'GET',
        credentials: 'include', 
        headers: {'Cache-Control': 'no-cache'}
    });
    return handleResponse(response);
}
export async function deleteContactById(id){
    const response= await fetch(`/api/delete-contact/${id}`,{
        method: 'DELETE',
        credentials: 'include'
    });
    return handleResponse(response);
}
export async function getRecentActions(){
    const response= await fetch('/api/recent-actions',{
        credentials: 'include'
    });
    if(!response.ok) return []; 
    return await response.json();
}
export async function updateProductQuantity(productId, newQuantity){
    const response= await fetch(`/api/products/${productId}`,{
        method: 'PATCH', 
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({quantity: newQuantity})
    });
    if(!response.ok) throw new Error('Не вдалося оновити залишок товару');
    return await response.json();
}
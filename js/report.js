document.addEventListener('DOMContentLoaded', async()=>{
    try{
        const [prodRes, catRes]=await Promise.all([
            fetch('/get-products'),
            fetch('/get-categories')
        ]);
        const products=await prodRes.json();
        const categories=await catRes.json();
        let totalItemsCount=0; 
        let totalWarehouseValue=0; 
        const stats={}; 
        products.forEach(p=>{
            const qty=Number(p.quantity) || 0;
            const price=Number(p.price) || 0;
            totalItemsCount+=qty;
            totalWarehouseValue+=(price*qty);
            const cat=categories.find(c=>c.id==p.categoryID);
            const catName=cat ? cat.name: "Інше";
            stats[catName]=(stats[catName] || 0)+qty;
        });
        document.getElementById('totalProducts').innerText=totalItemsCount;
        document.getElementById('totalValue').innerText=totalWarehouseValue.toLocaleString()+' грн';
        document.getElementById('totalCategories').innerText=categories.length;
        const ctx=document.getElementById('categoryChart').getContext('2d');
        new Chart(ctx,{
            type: 'bar',
            data: {
                labels: Object.keys(stats),
                datasets: [{
                    label: 'Кількість одиниць на складі',
                    data: Object.values(stats),
                    backgroundColor: 'rgba(106, 106, 137, 0.7)',
                    borderColor: '#3C3C4F',
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {display: true},
                    title: {display: true, text: 'Наявність товарів за категоріями'}
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: {stepSize: 1} 
                    }
                }
            }
        });
    } 
    catch(e){
        console.error("Помилка статистики:", e);
    }
});
function logoutAdmin(){
    if(confirm("Вийти з режиму адміністратора?")){
        localStorage.setItem("isLoggedIn", "false");
        localStorage.setItem("userRole", "user");
        window.location.reload(); 
    }
}
function updateClock(){
    const now=new Date();
    const time = now.toLocaleTimeString('uk-UA',{
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const year=now.getFullYear();
    const clockElement=document.getElementById('real-time-clock');
    if(clockElement){
        clockElement.innerHTML=`${time} &nbsp; ${year}`;
    }
}
setInterval(updateClock, 1000);
updateClock();
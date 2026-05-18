export function updateClock(){
    const now=new Date();
    const time=now.toLocaleTimeString('uk-UA',{ 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    const year=now.getFullYear();
    const clockElement=document.getElementById('real-time-clock');
    if(clockElement){
        clockElement.innerHTML= `${time} &nbsp; ${year}`;
    }
}
export function initClock(){
    updateClock();
    setInterval(updateClock, 1000);
}
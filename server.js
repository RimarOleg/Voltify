const express=require('express');
const fs=require('fs');
const path=require('path');
const app=express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true, limit: '50mb'}));
app.use(express.static(__dirname)); 
const externalGoodsPath='C:/Users/User/OneDrive/Desktop/Voltify/Goods';
if(!fs.existsSync(externalGoodsPath)){
    console.log("!] Папка 'Goods' не знайдена. Перевір шлях у server.js");
}
app.use('/goods-images', express.static(externalGoodsPath));
const dataDir=path.join(__dirname, 'data');
const productsFile=path.join(dataDir, 'products.json');
const usersFile=path.join(dataDir, 'users.json');
const categoriesFile=path.join(dataDir, 'categories.json');
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if(!fs.existsSync(productsFile)) fs.writeFileSync(productsFile, '[]');
if(!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '[]');
if(!fs.existsSync(categoriesFile)){
    const defaultCats=[
        {id: 1, name: "Всі товари"}, {id: 2, name: "Ноутбуки"}, 
        {id: 3, name: "ПК"}, {id: 4, name: "Мишки"}, 
        {id: 5, name: "Навушники"}, {id: 6, name: "Монітори"}, {id: 7, name: "Підставки"}
    ];
    fs.writeFileSync(categoriesFile, JSON.stringify(defaultCats, null, 2));
}
const readJSON=(file)=>{
    try{
        if(!fs.existsSync(file))return[];
        const data=fs.readFileSync(file, 'utf8');
        return JSON.parse(data || "[]");
    } 
    catch(e){return [];}
};
const writeJSON=(file, data)=>{
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};
app.get('/', (req, res)=>res.sendFile(path.join(__dirname, 'sign in.html')));
app.get('/login-page', (req, res)=>res.sendFile(path.join(__dirname, 'login.html')));
app.get('/dashboard', (req, res)=>res.sendFile(path.join(__dirname, 'index.html')));
app.get('/catalog-page', (req, res)=>res.sendFile(path.join(__dirname, 'catalog.html')));
app.get('/editing', (req, res)=>res.sendFile(path.join(__dirname, 'editing.html')));
app.get('/goods', (req, res)=>res.sendFile(path.join(__dirname, 'goods.html')));
app.post('/register', (req, res)=>{
    const{login, password}=req.body;
    let users=readJSON(usersFile);
    if(users.find(u=>u.login===login)){
        return res.status(400).json({ success: false, message: "Цей користувач уже існує" });
    }
    users.push({login, password});
    writeJSON(usersFile, users);
    res.json({success: true});
});
app.post('/login', (req, res)=>{
    const{login, password}=req.body;
    const users=readJSON(usersFile);
    const user=users.find(u=>u.login === login && u.password === password);
    if(user){
        res.json({success: true});
    } 
    else{
        res.status(401).json({success: false, message: "Невірний логін або пароль"});
    }
});
app.get('/get-products', (req, res)=>res.json(readJSON(productsFile)));
app.post('/add-product', (req, res)=>{
    try{
        let products=readJSON(productsFile);
        const newProd=req.body;
        newProd.id=newProd.id ? Number(newProd.id):Date.now();
        products.push(newProd);
        writeJSON(productsFile, products);
        res.json({success: true});
    } 
    catch(e){ res.status(500).json({success: false});}
});
app.put('/api/update-product/:id', (req, res)=>{
    try{
        const id=Number(req.params.id);
        const updatedData=req.body;
        let products=readJSON(productsFile);
        const index=products.findIndex(p => Number(p.id) === id);
        if (index!==-1){
            products[index]={ ...updatedData, id: id };
            writeJSON(productsFile, products);
            res.json({success: true}); 
        } 
        else{
            res.status(404).json({ success: false, message: "Товар не знайдено" });
        }
    } 
    catch(e){res.status(500).json({ success: false});}
});
app.delete('/api/delete-product/:id', (req, res)=>{
    try{
        const id=Number(req.params.id);
        let products=readJSON(productsFile);
        const filtered=products.filter(p=>Number(p.id)!==id);
        if(products.length!==filtered.length){
            writeJSON(productsFile, filtered);
            res.json({success: true});
        } 
        else{
            res.status(404).json({success: false});
        }
    } 
    catch(e){res.status(500).json({success: false});}
});
app.get('/get-categories', (req, res)=>res.json(readJSON(categoriesFile)));
const PORT=3000;
app.listen(PORT, ()=>{
    console.log(`\n--- СЕРВЕР ПРАЦЮЄ ---`);
    console.log(`Адреса: http://localhost:${PORT}`);
});
require('dotenv').config();
const express= require('express');
const cors= require('cors');
const path= require('path');
const bcrypt= require('bcrypt');
const session= require('express-session');
const supabase= require('./supabase.js');
const app= express();
const PORT= process.env.PORT || 3000;
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: 'voltify-secret-key-2026',
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24*60*60*1000,
        sameSite: 'lax'
    }
}));
app.use(express.static(__dirname));
app.use('/goods-images', express.static(path.join(__dirname, 'Goods')));
function requireAdmin(req, res, next){
    if(req.session && req.session.user && req.session.user.isAdmin){
        return next();
    }
    console.log("Спроба несанкціонованого доступу до:", req.path);
    res.status(403).json({ success: false, message: 'Доступ заборонено: Потрібні права адміністратора' });
}
app.post('/register', async (req, res)=>{
    const{login, password}= req.body;
    try{
        const hashedPassword= await bcrypt.hash(password, 10);
        const{error}= await supabase.from('users').insert([{
            login: login,
            password_hash: hashedPassword
        }]);
        if(error) throw error;
        res.json({success: true});
    }
    catch(err){
        console.error("Помилка реєстрації:", err);
        res.status(400).json({
            success: false,
            message: "Цей логін уже зайнятий, будь ласка, введіть інший! ❌"
        });
    }
});
app.post('/login', async (req, res)=>{
    const{login, password}= req.body;
    try{
        const {data: user, error}= await supabase.from('users').select('*').eq('login', login).maybeSingle();
        if(error || !user) return res.status(401).json({success: false, message: "Користувача не знайдено"});
        const isMatch= await bcrypt.compare(password, user.password_hash);
        if(!isMatch) return res.status(401).json({success: false, message: "Невірний пароль"});
        const isAdmin= login.toLowerCase()==='admin';
        req.session.user={
            id: user.id,
            login: user.login,
            isAdmin: isAdmin
        };
        req.session.save((err)=>{
            if(err) return res.status(500).json({success: false, message: "Помилка сесії"});
            res.json({
                success: true,
                role: isAdmin? 'admin': 'user',
                isAdmin: isAdmin,
                login: user.login
            });
        });
    }
    catch (err){
        res.status(500).json({success: false, message: "Помилка сервера"});
    }
});
app.post('/logout', (req, res)=>{
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.json({ success: true });
});
app.get('/api/products', async(req, res)=>{
    const {data, error}=await supabase.from('products').select('*').order('id', {ascending: false});
    if(error) return res.status(500).json([]);
    res.json(data);
});
app.post('/api/products', requireAdmin, async(req, res)=>{
    const product=req.body;
    if(!product.id) product.id= Math.floor(Date.now()/1000);
    const{error}= await supabase.from('products').insert([product]);
    if(error) return res.status(400).json({success: false, message: error.message});
    res.json({success: true});
});
app.put('/api/update-product/:id', requireAdmin, async(req, res)=>{
    const {id}= req.params;
    const{error}= await supabase.from('products').update(req.body).eq('id', id);
    if(error) return res.status(400).json({success: false, message: error.message});
    res.json({success: true});
});
app.delete('/api/delete-product/:id', requireAdmin, async(req, res)=>{
    const {error}= await supabase.from('products').delete().eq('id', req.params.id);
    if(error) return res.status(400).json({success: false, message: error.message});
    res.json({success: true});
});
app.get('/api/categories', async(req, res)=>{
    const {data, error}= await supabase.from('categories').select('*').order('id', {ascending: true});
    if(error) return res.status(500).json([]);
    res.json(data);
});
app.post('/api/save-contact', async(req, res)=>{
    const {name, email, message}= req.body;
    try{
        const {error}= await supabase.from('contacts').insert([{name, email, message}]);
        if(error) throw error;
        res.json({success: true, message: "Повідомлення збережено!"});
    }
    catch(err){
        res.status(500).json({success: false, message: err.message});
    }
});
app.get('/api/get-contacts', requireAdmin, async(req, res)=>{
    const {data, error}= await supabase.from('contacts').select('*').order('created_at', {ascending: false});
    if(error) return res.status(500).json({success: false, message: error.message});
    res.json(data);
});
app.delete('/api/delete-contact/:id', requireAdmin, async(req, res)=>{
    const{error}= await supabase.from('contacts').delete().eq('id', req.params.id);
    if(error) return res.status(500).json({success: false, message: "Не вдалося видалити"});
    res.json({success: true});
});
app.get('/api/recent-actions', async (req, res)=>{
    try{
        const {data}=await supabase.from('products').select('name').order('id', {ascending: false}).limit(3);
        const actions=data? data.map(item=>`Додано товар: ${item.name}`): [];
        res.json(actions);
    }
    catch(err){
        res.json([]);
    }
});
app.patch('/api/products/:id', async(req, res)=>{
    const{id}=req.params;
    const{quantity}=req.body; 
    try{
        if(quantity===undefined || isNaN(Number(quantity))){
            return res.status(400).json({success: false, message: "Некоректна кількість товару"});
        }
        const{data, error}= await supabase
            .from('products')
            .update({ quantity: Number(quantity) })
            .eq('id', id)
            .select();
        if(error) throw error;
        res.json({
            success: true,
            message: "Залишок товару на складі успішно оновлено! ✅",
            data
        });
    }
    catch(err){
        console.error("Помилка Supabase при оновленні складу:", err);
        res.status(500).json({success: false, message: "Не вдалося оновити базу даних"});
    }
});
app.listen(PORT, ()=>{
    console.log(`🚀 Voltify Server running on http://localhost:${PORT}`);
});
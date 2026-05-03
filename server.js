require('dotenv').config();
const express=require('express');
const cors=require('cors');
const bodyParser=require('body-parser');
const session=require('express-session');
const path=require('path');
const bcrypt=require('bcrypt');
const {createClient}=require('@supabase/supabase-js');
const app=express();
const PORT=process.env.PORT || 3000;
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
);
app.use(cors({ 
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Додай сюди свою адресу, якщо вона інша
    credentials: true 
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json());
app.use(session({
    secret: 'voltify-fixed-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false, maxAge: 24 * 60 * 60 * 1000}
}));
app.use(express.static(__dirname));
app.use('/goods-images', express.static(path.join(__dirname, 'Goods')));
function requireAdmin(req, res, next){
    if(req.session.user && req.session.user.isAdmin) return next();
    res.status(403).json({success: false, message: 'Потрібні права адміністратора'});
}
app.post('/register', async (req, res)=>{
    const {login, password}=req.body;
    try{
        const hashedPassword=await bcrypt.hash(password, 10);
        const {error}=await supabase.from('users').insert([{
            login: login,
            password_hash: hashedPassword
        }]);
        if(error) throw error;
        res.json({success: true});
    } 
    catch(err){
        res.status(400).json({success: false, message: err.message});
    }
});
app.post('/login', async (req, res)=>{
    const {login, password}=req.body;
    try{
        const {data: user, error}=await supabase.from('users').select('*').eq('login', login).maybeSingle();
        if(error || !user) return res.status(401).json({success: false, message: "Користувача не знайдено"});
        const isMatch=await bcrypt.compare(password, user.password_hash);
        if(!isMatch) return res.status(401).json({success: false, message: "Невірний пароль"});
        const isAdmin=login.toLowerCase()==='admin';
        req.session.user={id: user.id, login: user.login, isAdmin: isAdmin};
        res.json({success: true, isAdmin: isAdmin});
    } 
    catch(err){
        res.status(500).json({success: false, message: "Помилка сервера"});
    }
});
app.get('/get-products', async (req, res)=>{
    const {data}=await supabase.from('products').select('*');
    res.json(data || []);
});
app.post('/add-product', requireAdmin, async(req, res)=>{
    const product=req.body;
    if(!product.id){
        product.id=Math.floor(Math.random()*1000000000); 
    }
    const {error}=await supabase.from('products').insert([product]);
    if(error){
        console.error("Помилка Supabase:", error.message);
        return res.status(400).json({ success: false, message: error.message });
    }
    res.json({success: true});
});
app.put('/api/update-product/:id', requireAdmin, async(req, res)=>{
    const {id}=req.params;
    const {error}=await supabase.from('products').update(req.body).eq('id', id);
    if(error) return res.status(400).json({success: false, message: error.message});
    res.json({success: true});
});
app.delete('/api/delete-product/:id', requireAdmin, async(req, res)=>{
    const productId=req.params.id;
    console.log(`Спроба видалення товару з ID: ${productId}`);
    try{
        const {error}=await supabase
            .from('products')
            .delete()
            .eq('id', productId);
        if(error){
            console.error("Помилка Supabase при видаленні:", error.message);
            return res.status(400).json({ success: false, message: error.message });
        }
        console.log("Товар успішно видалено з бази");
        res.json({success: true});
    } 
    catch(err){
        console.error("Критична помилка сервера при видаленні:", err.message);
        res.status(500).json({ success: false, message: "Помилка сервера" });
    }
});
app.get('/get-categories', async (req, res)=>{
    const {data}=await supabase.from('categories').select('*').order('id', {ascending: true});
    res.json(data || []);
});
app.listen(PORT, ()=>{
    console.log(`Сервер працює: http://localhost:${PORT}`);
});
app.post('/api/save-contact', async (req, res)=>{
    const { name, email, message }= req.body;
    if(!name || !email || !message){
        return res.status(400).json({success: false, message: "Заповніть всі поля!"});
    }
    try{
        const{error}=await supabase
            .from('contacts')
            .insert([{ name, email, message }]);
        if(error){
            console.error("Деталі помилки Supabase:", error); 
            return res.status(500).json({ success: false, message: error.message });
        }
        res.json({ success: true, message: "Повідомлення збережено!" });
    } 
    catch(err){
        console.error("Критична помилка сервера:", err);
        res.status(500).json({ success: false, message: "Внутрішня помилка сервера" });
    }
});
app.get('/api/get-contacts', requireAdmin, async (req, res)=>{
    try{
        console.log("Запит на отримання контактів від адміна...");
        const { data, error }= await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false });
        if(error){
            console.error("Помилка Supabase:", error.message);
            return res.status(500).json({ success: false, message: error.message });
        }
        console.log(`Знайдено повідомлень: ${data.length}`);
        res.json(data); 
    } 
    catch (err){
        console.error("Критична помилка сервера:", err);
        res.status(500).json({ success: false, message: "Помилка сервера" });
    }
});
app.delete('/api/delete-contact/:id', requireAdmin, async (req, res)=>{
    const {id}=req.params;
    try{
        const {error}= await supabase
            .from('contacts')
            .delete()
            .eq('id', id);
        if(error) throw error;
        res.json({ success: true, message: "Повідомлення видалено" });
    } 
    catch(err){
        console.error("Помилка видалення:", err.message);
        res.status(500).json({ success: false, message: "Не вдалося видалити" });
    }
});
app.get('/api/recent-actions', async (req, res)=>{
    try{
        const {data, error}= await supabase
            .from('products')
            .select('name, created_at')
            .order('created_at', { ascending: false })
            .limit(3); 
        if(error) throw error;
        const actions= data.map(item=>`Додано товар: ${item.name}`);
        res.json(actions);
    } 
    catch(err){
        res.status(500).json([]);
    }
});
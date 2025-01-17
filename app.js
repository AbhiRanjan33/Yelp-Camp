if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
};
//require('dotenv').config();
const mongoUri = 'mongodb+srv://firstuser:aaadddfff@yelp-camp.evecg.mongodb.net/yelp-camp?retryWrites=true&w=majority';
//console.log("Mongo_uri: ",mongoURI);

const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const session=require('express-session');
const flash=require('connect-flash');
const ExpressError=require('./utils/ExpressError');
const methodOverride=require('method-override');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');
const helmet=require('helmet');

const mongoSanitize=require('express-mongo-sanitize');

const userRoutes=require('./routes/users');
const campgroundRoutes=require('./routes/campgrounds');
const reviewRoutes=require('./routes/reviews');
const MongoDBStore=require("connect-mongo")(session);

const { object } = require('joi');
const dbUrl='mongodb://localhost:27017/yelp-camp';
mongoose.connect(mongoUri);
//mongoose.connect(mongoURI);

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected")
});

const app=express();

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended:true})); //Parses req.body so that it's not empty
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize({
    replaceWith:'_'
}));

const store=new MongoDBStore({
    url:dbUrl,
    secret:'shush',
    touchAfter:24*60*60
});

store.on("error",function(e){
    console.log("SESSION STORE ERROR",e)
});

const sessionConfig={
    store,
    name:'session',
    secret:'shush',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        //secure:true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/", // Mapbox scripts
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // MapTiler (if used)
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // MapTiler styles
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://api.maptiler.com/", // MapTiler connections
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/drqhllyex/", // Replace with your Cloudinary account
                "https://images.unsplash.com/",
                "https://plus.unsplash.com",
                "https://*.mapbox.com/", // Mapbox images
                "https://cdn.maptiler.com/", // MapTiler images (if used)
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
});

app.get('/fakeUser',async(req,res)=>{
    const user=new User({email:'xyz@gmail.com',username:'xyz'});
    const newUser=await User.register(user,'xyz');
    res.send(newUser);
});

app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);

app.get('/',(req,res)=>{
    res.render('home');
});




app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
    res.send('404');
});

app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message){
        err.message='Something wrong';
    }
    res.status(statusCode).render('error',{err});
});
const port=process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Serving on port ${port}`);
});
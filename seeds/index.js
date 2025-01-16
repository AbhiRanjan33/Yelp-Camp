const mongoose=require('mongoose');
const cities=require('./cities');
const{places,descriptors}=require('./seedHelpers');
const Campground=require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected")
});

const sample=(array)=> array[Math.floor(Math.random()*array.length)];
   


const seedDB =async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<300;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            author:'6769852112f92ff85dce5374',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            description:'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rerum, voluptas recusandae perspiciatis, fuga dolorem eum reiciendis quidem in saepe aliquam tenetur, magni ipsa vero autem qui maiores rem. Error, ipsam?',
            price,
            geometry:{
              type:"Point",
              coordinates:[
                cities[random1000].longitude,
                cities[random1000].latitude,
              ]  
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/drqhllyex/image/upload/v1736772489/YelpCamp/plb96ghjq9gmsn06asvc.png',
                  filename: 'YelpCamp/plb96ghjq9gmsn06asvc',
                  
                },
                {
                  url: 'https://res.cloudinary.com/drqhllyex/image/upload/v1736772490/YelpCamp/yv8cjpy00gptmz20fcku.png',
                  filename: 'YelpCamp/yv8cjpy00gptmz20fcku',
                  
                },
                {
                  url: 'https://res.cloudinary.com/drqhllyex/image/upload/v1736772489/YelpCamp/pllfvlhu9aty3yrmmhxy.png',
                  filename: 'YelpCamp/pllfvlhu9aty3yrmmhxy',
                  
                }
              ]
            
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});
const mongoose = require('mongoose');
const cities = require('cities.json');
const {places,descriptors,users,descriptions,images,reviews} = require('./seedHelpers');
const Campground = require('../models/campground');

const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/yelpcamp';
mongoose.connect( dbURL, {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
});

const db=mongoose.connection;
db.on("error",console.error.bind(console,'connection error:'));
db.once("open", () => {
    console.log("DATABASE CONNECTED");
})

const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0;i<1000;i++)
    {
        const randomcity = sample(cities);
        const price = Math.floor(Math.random() * 20) +10;
        const imgs = []
        for(let j=0;j<4;j++){
            imgs.push(sample(images));
        }
        const camp = new Campground({
            author: sample(users),
            location: randomcity.name,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:sample(descriptions),
            price: price,
            images:imgs,
            geometry:{
                type: 'Point',
                coordinates:[
                    randomcity.lng,
                    randomcity.lat
                ]
            },
            reviews
        })
        await camp.save();
    }
}
seedDB().then( () => {
    mongoose.connection.close();
})
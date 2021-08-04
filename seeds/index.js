//Requireing mongoose and model
const mongoose = require("mongoose");
const Campground = require("../models/campground");
//importing cities
const cities = require("./cities");
//importing titles
const { places, descriptors } = require("./seedHelpers");

//Connecting mongoose
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

//Checking if mongoose is connected
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => {
  console.log("Database connected");
});

//Function that picks a random element of given array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

//function that seeds 50 random campgrounds
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    //random number between 1 and 1000 to pick a city
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "60c899711ece943154885cb0",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/arsic21/image/upload/v1624371264/YelpCamp/l2sca8qnpgvovssjosev.jpg",
          filename: "YelpCamp/l2sca8qnpgvovssjosev",
        },
        {
          url: "https://res.cloudinary.com/arsic21/image/upload/v1624371266/YelpCamp/pikwsmzwgpv3vsu7ig30.jpg",
          filename: "YelpCamp/pikwsmzwgpv3vsu7ig30",
        },
      ],
      geometry: {
        type: "Point",
        coordinates: [cities[random1000].longitude, cities[random1000].latitude],
      },
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque, optio maxime! Maxime vel quia ducimus. Eveniet repellat cupiditate sequi est eos, omnis non rem labore adipisci ab nesciunt pariatur rerum.",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});

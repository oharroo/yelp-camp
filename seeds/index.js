const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection; //shortening code. mongoose.connection.on
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "60875fdf8ad0710da03a19e7", //YOUR USER ID
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque quasi aut accusantium ducimus, nobis temporibus rerum nemo rem quas fugit? Veritatis iste cumque inventore blanditiis, similique delectus ea quisquam dignissimos.",
      price: price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dtgh61o7c/image/upload/v1619523832/YelpCamp/lko6tj7c43sbdl4coxsa.jpg",
          filename: "YelpCamp/lko6tj7c43sbdl4coxsa",
        },
        {
          url: "https://res.cloudinary.com/dtgh61o7c/image/upload/v1619523233/YelpCamp/wt9ciezyuefvrlmgq1lg.png",
          filename: "YelpCamp/wt9ciezyuefvrlmgq1lg",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});

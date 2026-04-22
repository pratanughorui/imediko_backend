require("dotenv").config();
const connectDB = require("./config/db");
const { app } = require("./app");

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongo db connection failed !!!", err);
  });

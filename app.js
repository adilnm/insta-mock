const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 5000;
const { MONGOURI } = require("./keys");



mongoose.connect(MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on("connected", () => {
  console.log("connected to mongo");
});

mongoose.connection.on("error", err => {
  console.log("error connecting", err);
});

require("./models/user");
require("./models/post");

app.use(express.json()) //this is a middleware used to convert he posted data from the frontend to a json fromat
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))

app.listen(PORT, () => {
  console.log("server runnin", PORT);
});

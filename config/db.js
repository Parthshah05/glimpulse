const mongoose                  = require("mongoose");
const { DB_NAME, DB_USERNAME, 
        DB_PASSWORD, DB_HOST }  = process.env;

const url = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`

// DB Connection Start
mongoose.Promise = global.Promise;
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("CONNECTION SUCCESSFUL"))
  .catch((err) => console.log(err));
// DB Connection End

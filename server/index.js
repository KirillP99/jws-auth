require('dotenv').config(); // config env for project, we can use process.env after it
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const router = require('./router')
const error = require('./middlewares/error');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser()); // for work with cookie
app.use(cors()); // config work with cors

app.use('/api', router);
app.use(error); // must be last

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, { // it's asynchronous action, so we add await
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        })
        app.listen(PORT, () => console.log(`Server is listening of ${PORT} port`));
    } catch (e) {
        console.log(e);
    }
}

start();

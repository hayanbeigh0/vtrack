const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
   console.log('uncaught Exception! Shutting down');
   console.log(err);
   process.exit(1);
});

dotenv.config({
   path: './config.env',
});

const app = require('./app');

let conUrl = process.env.DATABASE_CLOUD;
conUrl = conUrl.replace('<password>', process.env.DATABASE_PASSWORD);

mongoose
   .connect(conUrl, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
   })
   .then((con) => {
      console.log('Database connection successful.');
   });
// .catch((err) => {
//    console.log('Error connecting to database.');
//    console.log(err);
// });

// START THE SERVER---
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
   console.log(`Starting application on port ${port}`);
});

process.on('unhandledRejection', (err) => {
   console.log('unhandled rejection... Exiting application');
   console.log(err.name, err.message);
   console.log(err);

   server.close(() => {
      process.exit(1);
   });
});

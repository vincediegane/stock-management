const express = require('express');
const cors = require('cors');

const apiRouter = require('./route');

const app = express();

app.use(cors());

app.use(express.json({ extended: false }));

app.use('/api/products', apiRouter);

app.listen(process.env.PORT || 3000, () => console.log(`server in running on port ${process.env.PORT || 3000}`));

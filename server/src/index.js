import upload from './servers/upload';
const express = require('express');
const app = express();
const PORT = 8888;
const HOST = 'http://127.0.0.1';
const HOSTNAME = `${HOST}:${PORT}`;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    req.method === 'OPITIONS'
        ? res.send('CURRENT SERVERICES SUPPORT CROSS DOMAIN REQUEST!')
        : next();
});

app.use('/',upload);

app.listen(PORT, () => {
    console.log(`serve is runnig at ${HOSTNAME}`);
});
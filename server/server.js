require('./config/config');


const express = require('express');
const mongoose = require('mongoose');
const path = require('path')

const app = express();

const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));


// Configuracion global rutas
app.use(require('./routes/index'));

app.get('/', function(req, res) {
    res.json('Hello World')
});

mongoose.connect(process.env.URLDB, (err, res) => {

    if (err) throw err;

    console.log('base de datos online');

});


app.listen(process.env.PORT, () => {
    console.log(`escuchando el puerto ${process.env.PORT}`);
});
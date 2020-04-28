const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');


const fs = require('fs');
const path = require('path');


// default options
app.use(fileUpload());


app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        });
    }

    // Validar tipo
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: ' Los tipos permitidos son: ' + tiposValidos.join(', '),
                tipo
            }
        })
    }

    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'svg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: ' las extensiones permitidas son: ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    // Cambiar nombre al archivo
    let nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extension}`

    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Aqui, imagen cargada
        if (tipo === 'usuarios') {

            imagenUsuario(id, res, nombreArchivo, tipo);
        } else {
            console.log(tipo);

            imagenProducto(id, res, nombreArchivo, tipo);
        }


    });
});



function imagenUsuario(id, res, nombreArchivo, tipo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo(tipo, nombreArchivo);
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borrarArchivo(tipo, nombreArchivo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: ' Ususario no existe'
                }
            });
        }

        borrarArchivo(tipo, usuarioDB.img);

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuarioDB: usuarioGuardado,
                img: nombreArchivo
            });
        });
    });
}

function imagenProducto(id, res, nombreArchivo, tipo) {
    Producto.findById(id, (err, productoBD) => {
        if (err) {
            borrarArchivo(tipo, nombreArchivo);
            res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoBD) {
            borrarArchivo(tipo, nombreArchivo);
            res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        borrarArchivo(tipo, productoBD.img);

        productoBD.img = nombreArchivo;

        productoBD.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });
    });
}

function borrarArchivo(tipo, nombreImagen) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}





module.exports = app;
const express = require('express');
let { verificaToken } = require('../middlewares/autenticacion');

const _ = require('underscore');

let app = express();

let Producto = require('../models/producto');


//=========================================
// Muestra todas los producto
//=========================================
app.get('/producto', verificaToken, (req, res) => {
    // trae todos los producto
    // populate: usuario, categoria
    // paginado


    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .limit(limite)
        .skip(desde)
        .populate('usuario', 'nombre , email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.count({ disponible: true }, (err, conteo) => {

                res.json({
                    ok: true,
                    producto,
                    cuantos: conteo
                });
            });
        })


});

//=========================================
// Obtiene producto por ID
//=========================================
app.get('/producto/:id', verificaToken, (req, res) => {
    // populate: usuario, categoria

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre , email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            };

            res.json({
                ok: true,
                Producto: productoDB
            });
        })


});

//=========================================
// Buscar producto
//=========================================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        });
});

//=========================================
// Crear producto
//=========================================
app.post('/producto', verificaToken, (req, res) => {
    // grabar usuario
    // grabar categoria del listado de categorias

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id

    });

    producto.save((err, productoDB) => {

        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        })
    });


});

//=========================================
// Actualiza los producto
//=========================================
app.put('/producto/:id', verificaToken, (req, res) => {
    // grabar usuario
    // grabar categoria del listado de categorias

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria']);

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });


});

//=========================================
// Elimina un producto
//=========================================
app.delete('/producto/:id', verificaToken, (req, res) => {
    // cambiar estado a disponible

    let id = req.params.id;

    let cambiaEstado = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, productoBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'producto no encontrado'
                }
            });
        };

        res.json({
            ok: true,
            producto: productoBorrado
        });


    });



});






module.exports = app;
const express = require('express');
let { verificaToken, verificaRol } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');


//=========================================
// Muestra todas las categorias
//=========================================

app.get('/categoria', verificaToken, (req, res) => {


    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre, email')
        .exec((err, categoria) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categoria
            });
        });


});

//=========================================
// Muestra una categoria por ID
//=========================================

app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoria) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        };

        res.json({
            ok: true,
            categoria
        });
    });



});

//=========================================
// Crea una nueva categoria
//=========================================

app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });


    categoria.save((err, categoriaBD) => {

        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaBD) {
            res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBD,
        });
    })
});

//=========================================
// Actualiza una categoria
//=========================================

app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let desCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, desCategoria, { new: true, runValidators: true }, (err, categoriaBD) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaBD) {
            res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBD
        });
    });

});

//=========================================
// Elimina una categoria
//=========================================

app.delete('/categoria/:id', [verificaToken, verificaRol], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'no lo puedo borrar'
                }
            });
        };

        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        };

        res.json({
            ok: true,
            categoria: categoriaBorrada
        });
    });
});



























module.exports = app;
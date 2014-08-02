var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser());

var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/blocks');

var Block = require('./app/models/block');

router.use(function(req,res,next) {
    console.log(req);
    next();
});

router.get('/', function(req, res) {
    res.json({ message: 'Hello' });
});

router.route('/blocks')
    .post(function(req,res) {
        var block = new Block();
        block.url = req.body.url;
        block.save(function (err) {
            if (err) res.send(err);
            else res.json({id: 1, data: block, message: 'Block created!'});
        });
    })
    .get(function(req,res) {
        Block.find(function(err, blocks) {
            if (err)
                res.send(err);
            else
                res.json(blocks);
        });
    });

app.use('/api', router);

app.listen(3000);
console.log('API listening on port 3000');

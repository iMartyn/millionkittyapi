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
        for (var propertyName in SettableBlockProperties) {
            if (SettableBlockProperties.hasOwnProperty(propertyName)) {
                console.log(block.hasOwnProperty(propertyName));
                console.log('setting '+propertyName);
                block[propertyName] = req.body[propertyName]
            }
        }
        console.log(block);
        block.save(function (err) {
            if (err) res.send(err);
            else { 
                res.json({data: block, message: 'Block created!'});
            }
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
router.route('/blocks/:block_id')
    .put(function(req,res){
        console.log('Finding block id '+req.params.block_id);
        Block.findOne({'block_id': req.params.block_id},function(err,block){
            if (err)
                res.send(err);
            if (!block) {
                res.json({message: 'Not found.'})
            } else {
                console.log(block)
                for (var propertyName in block) {
                    if (SettableBlockProperties.hasOwnProperty(propertyName)) {
                        block[propertyName] = req.body[propertyName]
                    }
                    block.block_id = req.params.block_id
                }
                console.log(block)
                block.save(function(err) {
                    if (err) res.send(err);
                    else res.json({message: 'Block updated'});
                });
            }
        });
    });

app.use('/api', router);
app.use(express.static(__dirname + '/html'));

app.listen(3000);
console.log('API listening on port 3000');

var express = require('express');
var Primus = require('primus');
var http = require('http');
var app = express();
var server = http.createServer(app);
var bodyParser = require('body-parser');
var braintree = require('braintree');
app.use(bodyParser());

var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/blocks');

var Block = require('./app/models/block');
var async = require('async');
var block_ids = []
for (var i=0; i<=72; i++) {
    block_ids.push(i);
}
async.eachSeries(block_ids, function(id, callback) {
    Block.findOne({'block_id':id}, function(err,doc) {
        if (err || doc === null) {
            block = new Block();
            block.block_id = id;
            block.save();
        }
        console.log(err,doc);
        console.log("Would have created "+id);
        callback();
    });
});

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
            else {
                var maxPaid = 0;
                var blockCount = blocks.length;
                for (var i = 0; i < blockCount; i++) {
                    if (blocks[i].amount_paid > maxPaid) {
                        maxPaid = blocks[i].amount_paid;
                    }
                }
                console.log(maxPaid);
                for (var i = 0; i < blockCount; i++) {
                    thisPaid = 0;
                    if ('amount_paid' in blocks[i]) {
                        thisPaid = blocks[i].amount_paid;
                    }
                    if (thisPaid > 0) {
                        blocks[i].scale = thisPaid / maxPaid;
                    } else {
                        blocks[i].scale = 0;
                    }
                    if (blocks[i].amount_paid === undefined) {
                        blocks[i].amount_paid = 0;
                    }
                    if (blocks[i].url === undefined) {
                        blocks[i].url = '';
                    }
                    if (blocks[i].text === undefined) {
                        blocks[i].text = '';
                    }
                }
                res.json(blocks);
            }
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
                    else {
                        res.json({message: 'Block updated'});
                        primus.write('Block updated');
                    }
                });
            }
        });
    });
app.get('/braintreetoken',function (req, res) {
  gateway.clientToken.generate({
  }, function (err, response) {
    res.send(response.clientToken);
  });
});
app.post('/checkout',function (req,res) {
    console.log('Finding block id '+req.body.id);
    Block.findOne({'block_id': req.body.id},function(err,block){
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
                block.block_id = req.body.id
            }
            console.log(block)
            block.save(function(err) {
                if (err) res.send(err);
                else {
                    res.redirect(302, '/');
                    primus.write('Block updated');
                }
            });
        }
    });
});
app.use('/api', router);
app.use(express.static(__dirname + '/html'));
primus = new Primus(server, { transformer: 'websockets' });
primus.on('connection', function(spark) {
    console.log('received connection');
});

var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   '823jmwshc52b8w4z',
    publicKey:    '9qkf9zx9sr6gzkhz',
    privateKey:   '5841ac9ca73292a41e43e0893f459b71'
});

server.listen(3000);
console.log('API listening on port 3000');

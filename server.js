// const express = require('express')
// const app = express()
// app.get('/',(req, res) => res.send('1.0.0'));
// app.listen(process.env.PORT || 3000);

const express = require('express')
var cors = require('cors')
const db = require('./data/db');
const fo = require('./routes/formats');
var bodyParser = require('body-parser');

const app = express()
app.use(express.json());
app.use(cors())

let errorHandler = (res, err) => {
    res.status(500).send(err);
};

app.get('/version', (req, res) => res.send('1.0.0'));

app.get('/data/:tableName', (req, res) => {

    db.query(req.params.tableName, req.query, rows => {
        res.send({
            success: true,
            data: rows
        });
    },
        (err) => errorHandler(res, err));
});

app.post('/data/:tableName', (req, res) => {

    db.insertOne(req.params.tableName, req.body, insertId => {
        res.send({
            success: true,
            data: { id: insertId }
        });
    },
        (err) => errorHandler(res, err));
});

app.put('/data/:tableName/:id', (req, res) => {

    db.update(req.params.tableName, req.params.id, req.body, updateCount => {
        res.send({
            success: updateCount == 1
        });
    },
        (err) => errorHandler(res, err));
});

app.delete('/data/:tableName/:id', (req, res) => {

    db.delete(req.params.tableName, req.params.id, updateCount => {
        res.send({
            success: updateCount == 1
        });
    },
        (err) => errorHandler(res, err));
});

// Formats
app.get('/formats/:productId', fo.formatsForProduct);
//app.post('/formats', fo.addFormatForProduct);
app.put('/formats/:joinedId', fo.updateFormatForProduct);

app.listen(process.env.PORT || 3000);
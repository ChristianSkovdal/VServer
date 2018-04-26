const db = require('../data/db');


let errorHandler = (res, err) => {
    res.status(500).send(err);
};


exports.formatsForProduct = (req, res) => {

    db.formatsForProduct(req.params.productId, rows => {
        res.send({
            success: true,
            data: rows
        });
    },
        (err) => errorHandler(res, err));
}

// exports.addFormatForProduct = (req, res) => {

//     db.addFormatForProduct(req.body, insertId => {
//         res.send({
//             success: true,
//             data: { id: insertId }
//         });
//     },
//         (err) => errorHandler(res, err));
// }

exports.updateFormatForProduct = (req, res) => {

    db.updateFormatForProduct(req.params.joinedId, req.body, updateCount => {
        res.send({
            success: updateCount == 1
        });
    },
        (err) => errorHandler(res, err));

}



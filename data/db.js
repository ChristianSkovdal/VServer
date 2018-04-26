'use strict';
const mysql = require('mysql');
const config = require('../config.json');

var conn = mysql.createConnection(config.db);
conn.connect(function (err) {
    if (err)
        throw err;
    console.log("Connected!");
});

exports.query = (table, params, callback, error) => {

    let order = params.order || 'ORDER BY id DESC';

    let sql = `SELECT * from ${table}`;

    if (params.where) {
        sql += ' WHERE ' + params.where;
    }
    sql += ' ' + order;

    conn.query(sql, function (err, rows, fields) {
        if (!err)
            callback(rows);
        else
            error('Error while performing GET: ' + err);
    });
}

exports.insertOne = (table, obj, callback, error) => {

    let sql = `INSERT INTO ${table}(${Object.keys(obj).join()}) VALUES ?`;
    conn.query(sql, [[Object.values(obj)]], function (err, result, fields) {
        if (!err)
            callback(result.insertId);
        else
            error('Error while performing POST: ' + err);
    });

}

exports.update = (table, id, obj, callback, error) => {

    delete obj.id;
    let sql = `UPDATE ${table} SET ? WHERE ?`;

    conn.query(sql, [obj, { 'id': id }], function (err, result, fields) {
        if (!err)
            callback(result.affectedRows);
        else
            error('Error while performing PUT: ' + err);
    });

}

exports.delete = (table, id, callback, error) => {

    let sql = `DELETE FROM ${table} WHERE id=` + id;

    conn.query(sql, function (err, result, fields) {
        if (!err)
            callback(result.affectedRows);
        else
            error('Error while performing DELETE: ' + err);
    });

}

exports.formatsForProduct = (productId, callback, error) => {

    const sqlformat = 'SELECT id AS format_id, name AS formatName FROM formats';
    const sqljoin = `SELECT format_id, product_id FROM products_formats where product_id=${productId}`;

    let result = [];

    conn.query(sqlformat, function (err, rows, fields) {
        if (err) return error(err);

        result = rows;

        conn.query(sqljoin, function (err, available, fields) {
            if (err) return error(err);

            result.forEach(r => {
                r['id'] = `${r.formatId}-${productId}`;
                r['available'] = available.map(a => a.format_id).indexOf(r.format_id) >= 0;
                r['product_id'] = productId;
            });

            callback(result);
        });
    });

}

// exports.addFormatForProduct = (record, callback, error) => {

//     let sql = `INSERT INTO products_formats(format_id, product_id) VALUES ?`;
//     conn.query(sql, [[[record.formatId, record.productId]]], function (err, result, fields) {
//         if (err) return error(err);

//         callback(result.insertId);
//     });
// }

exports.updateFormatForProduct = (joinedId, record, callback, error) => {

    // We ignore joinedId. It a pseudo Id

    // Does the record exist in th ejoin table
    // If not add it
    // If it does update it

    const selsql = `SELECT id FROM products_formats WHERE format_id=${record.format_id} AND product_id=${record.product_id}`;

    conn.query(selsql, (err, result, fields) => {
        if (err) return error(err);

        if (result.length == 0) {

            const insertsql = `INSERT INTO products_formats(format_id, product_id) VALUES ?`;
            conn.query(insertsql, [[[record.format_id, record.product_id]]], (err, result, fields) => {
                if (err) return error(err);
                callback(true);
            });
        }
        else {

            if (record.available) {
                const updatesql = `UPDATE products_formats SET ? WHERE ?`;
                const updateRec = {format_id:record.format_id, product_id: record.product_id};
                const where = { 'id': result[0].id };

                conn.query(updatesql, [updateRec, where], (err, result, fields) => {
                    if (err) return error(err);
                    callback(result.affectedRows == 1);
                });    
            }
            else {
                conn.query(`DELETE FROM products_formats WHERE id=${result[0].id}`, (err, result, fields) => {
                    if (err) return error(err);
                    callback(result.affectedRows == 1);
                });   
            }

        }

    });


    // delete obj.id;
    // let sql = `UPDATE products_formats SET ? WHERE ?`;

    // const record = {
    //     product_id: obj.product_id,
    //     format_id: obj.format_id
    // };

    // conn.query(sql, [record, { 'id': joinedId }], function (err, result, fields) {
    //     if (!err)
    //         callback(result.affectedRows);
    //     else
    //         error('Error while performing PUT: ' + err);
    // });

}
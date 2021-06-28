const express = require('express');
const { rootCertificates } = require('tls');
const router = express.Router();
const url = require('url');

module.exports = function (pool) {

  // pool.query('select * from users', (err, res) => {
  //   console.log(res.rows);

  // })
  router.get('/', function (req, res, next) {

    const id = req.query.id
    const string = req.query.string
    const integer = req.query.integer
    const float = req.query.float
    const start_date = req.query.start_date
    const end_date = req.query.end_date
    const boolean = req.query.boolean
    const checked_id = req.query.checked_id
    const checked_string = req.query.checked_string
    const checked_integer = req.query.checked_integer
    const checked_float = req.query.checkedfloat
    const checked_date = req.query.id
    const checked_boolean = req.query.id
    const per_page = 3;
    const page = req.params.page || 1;
    const queryObject = url.parse(req.url, true).search;
    let params = [];
    if (checked_id === "true" && id) {
      params.push(`id = ${id}`);
    }
    if (checked_string === "true" && string) {
      params.push(`string = '${string}'`);
    }
    if (checked_integer === "true" && integer) {
      params.push(`integer = ${integer}`);
    }
    if (checked_float === "true" && float) {
      params.push(`float = ${float}`);
    }
    if (checked_date === "true" && start_date && end_date) {
      params.push(`date between '${start_date}' and '${end_date}'`);
    }
    if (checked_boolean === "true" && boolean) {
      params.push(`boolean = '${boolean}'`);
    }

    var sql = `SELECT * FROM users`;
    if (params.length > 0) {
      sql += ` WHERE `;
      for (let i = 0; i < params.length; i++) {
        sql += `${params[i]}`;
        if (params.length != i + 1) {
          sql += ` OR `;
        }
      }
    }
    // const sql = 'SELECT * FROM users ORDER BY id ASC';
    pool.query(sql, (err, rows) => {
      if (err) { res.status(400).json({ "error": err.message }); return; }
      sql += ` ORDER BY id ASC LIMIT 3 OFFSET 0`;
      pool.query(sql, (err, data) => {
        if (err) { res.status(400).json({ "error": err.message }); return; }
        // res.json(rowsFilt.rows);
        console.log(queryObject)
        res.json({
          data: data.rows,
          current: page,
          filter: queryObject,
          next_page: parseInt(page) + 1,
          previous_page: parseInt(page) - 1,
          pages: Math.ceil(rows.rows.length / per_page)
        });
      });
    })
  });

  router.get('/:page', function (req, res, next) {
    const per_page = 3;
    const page = req.params.page || 1;
    const queryObject = url.parse(req.url, true).search;
    let params = [];
    if (req.query.checked_id === "true" && req.query.id) {
      params.push(`id = ${req.query.id}`);
    }
    if (req.query.checked_string === "true" && req.query.string) {
      params.push(`string = '${req.query.string}'`);
    }
    if (req.query.checked_integer === "true" && req.query.integer) {
      params.push(`integer = ${req.query.integer}`);
    }
    if (req.query.checked_float === "true" && req.query.float) {
      params.push(`float = ${req.query.float}`);
    }
    if (req.query.checkeddate === "true" && req.query.startdate && req.query.enddate) {
      params.push(`date between '${req.query.startdate}' and '${req.query.enddate}'`);
    }
    if (req.query.checkedboolean === "true" && req.query.boolean) {
      params.push(`boolean = '${req.query.boolean}'`);
    }

    var sql = `SELECT * FROM users`;
    if (params.length > 0) {
      sql += ` WHERE `;
      for (let i = 0; i < params.length; i++) {
        sql += `${params[i]}`;
        if (params.length != i + 1) {
          sql += ` OR `;
        }
      }
    }
  
    pool.query(sql, (err, rows) => {
      if (err) { res.status(400).json({ "error": err.message }); return; }
      
      sql += ` ORDER BY id ASC LIMIT 3 OFFSET ${(page - 1) * per_page}`;
      pool.query(sql, (err, rowsFilt) => {
        if (err) {res.status(400).json({ "error": err.message });return;}
        // res.json(rowsFilt.rows);
        res.json({
          data: rowsFilt.rows,
          current: page,
          filter: queryObject,
          next_page: parseInt(page) + 1,
          previous_page: parseInt(page) - 1,
            pages: Math.ceil(rows.rows.length / per_page)
          });
      });
    })
  });
  
  router.get('/edit/:id', (req, res) => {
    var sql = `SELECT * FROM users WHERE id = ${Number(req.params.id)}`;
    pool.query(sql, (err, row) => {
      if (err) {
        res.send({ message: "Gagal " + err.message })
      } else {
        res.json({ data: row.rows });
      }
    });
  });

  router.put('/edit/:id', (req, res) => {
    const string = req.body.string
    const date = req.body.date;
    const integer = Number(req.body.integer);
    const float = Number(req.body.float);
    const boolean = req.body.boolean;

    var sql = `UPDATE users SET string = '${string}', integer = ${integer}, float = ${float}, date = '${date}', boolean = '${boolean}' WHERE id = ${req.body.id}`;
    console.log(sql);
    pool.query(sql, function (err) {
      if (err) {
        res.send({ message: err.message });
      } else {
        res.send({ message: "Berhasil" });
      }
    })
  });


  router.post('/add', (req, res) => {
    console.log(req.body.string)
    let string = req.body.string;
    let integer = parseInt(req.body.integer);
    let float = parseFloat(req.body.float);
    let date = req.body.date;
    let boolean = req.body.boolean;
    pool.query(`INSERT INTO users(string, integer, float, boolean, date) VALUES ('${string}',${integer},${float},${boolean},'${date}')`, (err) => {
      if (err) {
        console.error(err);
        return res.send(err)
      } else {
        res.send({ messsage: 'Berhasil' })
      }
    })
  })

  router.delete('/delete/:id', function (req, res, next) {
    pool.query(`DELETE from users WHERE id= ${Number(req.params.id)}`,
      req.body.id, (err) => {
        if (err) {
          console.error(err.messsage);
        } else {
          res.send({ messsage: 'Berhasil' })
        }

      })
  });
  return router
}

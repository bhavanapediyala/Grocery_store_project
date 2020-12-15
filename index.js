const express = require('express')
const app = express()
const port = 3000
const path = require("path");
const sqlite3 = require("sqlite3").verbose();


// Server configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
// <--- middleware configuration
// Connection to the SQlite database
// did not define cost while creating table
// made qty as integer and Cost as Float and NOT NULL
const db_name = path.join(__dirname, "data", "grocery_store.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) return console.error(err.message);
  console.log('Successful connection to the database \'grocery_store.db\'');
});
const sql_create = `CREATE TABLE Products (
  Product_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Name TEXT NOT NULL,
  Price FLOAT NOT NULL,
  Quantity INTEGER,
  Cost FLOAT NOT NULL
);`;
let run = db.run(sql_create, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the table");
});


//added cost for population of db
//// Database seeding
const sql_insert = `INSERT INTO Products (Product_ID, Name, Price, Quantity, Cost) VALUES
(1, 'Tomato', 5.0, 1, 5.0),
(2, 'Flour', 16.0, 3, 48.0),
(3, 'Dry-Fruits', 15.0, 2, 30.0);`;
db.run(sql_insert, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of 3 entries");
});

// GET /
app.get('/', (req, res) => {
  // res.send('Hello World!')
  res.render("index");
})

// Starting the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// GET data

// app.get("/items", (req, res) => {
// const test = {
// title: "Items",
//items: ["Tomatoes", "Flour", "Dry-Fruits"]
//};
//res.render("items", { model: test });
//});

//read the list of items stored in the database and display this list in the view.
app.get("/items", (req, res) => {
  const sql = "SELECT * FROM Products ORDER BY Product_ID"
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("items", { model: rows });
  });
});

app.get("/create", (req, res) => {
  res.render("create", { model: {} });
});

// POST /create
app.post("/create", (req, res) => {
  const sql = "INSERT INTO Products (Name, Price, Quantity, Cost) VALUES (?, ?, ?, ?)";
  
  const cost = req.body.Quantity * req.body.Price;
  const Products = [req.body.Name, req.body.Price, req.body.Quantity, cost];
  db.run(sql, Products, err => {
    if (err) console.log(err);
    res.redirect("/items");
  });
});

//GET edit 5
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Products WHERE Product_ID = ?";
  db.get(sql, id, (err, row) => {
    // if (err) ...
    res.render("edit", { model: row });
  });
});

// POST edit 5
app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const cost = req.body.Price * req.body.Quantity;
  const Products = [req.body.Quantity, cost, id];
  const sql = "UPDATE Products SET Quantity = ?, Cost = ? WHERE (Product_ID = ?)";
  db.run(sql, Products, err => {
    // if (err) ...
    res.redirect("/items");
  });
});

// GET delete5
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Products WHERE Product_ID = ?";
  db.get(sql, id, (err, row) => {
    // if (err) ...
    res.render("delete", { model: row });
  });
});

// POST delete 5
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM Products WHERE Product_ID = ?";
  db.run(sql, id, err => {
    // if (err) ...
    res.redirect("/items");
  });
});

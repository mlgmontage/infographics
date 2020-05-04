const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const Datastore = require("nedb");
const db = new Datastore({ filename: "database.json" });
const schedule = require("node-schedule");
require("dotenv").config();

db.loadDatabase();
const fetch = require("node-fetch");
const rule = new schedule.RecurrenceRule();

rule.minute = 45;

global.Headers = fetch.Headers;

// Allow CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Authorization
const api_login = process.env.API_LOGIN;
const api_password = process.env.API_PASSWORD;
let headers = new Headers();
headers.set(
  "Authorization",
  "Basic " + Buffer.from(api_login + ":" + api_password).toString("base64")
);

// Обноволение базы данных
function updateDB() {
  const pathToDBFile = "./database.json";

  // Удаление преведущей файла базы данных

  db.remove({}, { multi: true }, function (err, numRemoved) {
    console.log("database has been erased ");
  });

  const api_url = `https://app.aqtau109.kz/api/v2/tickets/`;
  fetch(api_url, {
    method: "GET",
    headers: headers,
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      console.log(json);

      // iteration through pages
      for (let i = 1; i <= json.pagination.total_pages; i++) {
        // new url
        const api_url = `https://app.aqtau109.kz/api/v2/tickets/?page=${i}`;
        // fetching data from new url
        fetch(api_url, {
          method: "GET",
          headers: headers,
        })
          .then((response) => {
            return response.json();
          })
          .then((json) => {
            for (let record of Object.keys(json.data)) {
              db.insert(json.data[record], function (error, newDoc) {
                console.log("data has been successfully saved");
              });
            }
          });
      }
    });
}

// updateDB();

// База обновляется
let j = schedule.scheduleJob(rule, function () {
  updateDB();
  console.log("Database has been updated");
});

// закрытые заявки
app.get("/api/v1/tickets/closed", async (request, response) => {
  const api_url = `https://app.aqtau109.kz/api/v2/tickets/?status_list=closed`;
  console.log(request.params);
  const fetch_response = await fetch(api_url, {
    method: "GET",
    headers: headers,
  });
  const json = await fetch_response.json();
  response.json(json);
});

// Просроченные заявки

// Счет открытых заявок
app.get("/api/v1/tickets/opentickets", async (request, response) => {
  db.count({ status_id: "open" }, function (error, count) {
    response.json(count);
  });
});

// Счет закрытых заявок
app.get("/api/v1/tickets/closedtickets", async (request, response) => {
  db.count({ status_id: "closed" }, function (error, count) {
    response.json(count);
  });
});

// Счет просроченных заявок
app.get("/api/v1/tickets/prosrochenotickets", async (request, response) => {
  db.count({ status_id: "prosrocheno" }, function (error, count) {
    response.json(count);
  });
});

// proxy
app.get("/api/v1/:query", async (request, response) => {
  const api_url = `https://app.aqtau109.kz/api/v2/${request.params.query}`;

  const fetch_response = await fetch(api_url, {
    method: "GET",
    headers: headers,
  });
  const json = await fetch_response.json();
  response.json(json);
});

app.listen(port, function () {
  console.log(`Server listenning on port ${port}`);
});

app.use(express.static("public"));

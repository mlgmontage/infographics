const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const Datastore = require("nedb");
const db = new Datastore({ filename: "database.json" });
const schedule = require("node-schedule");
const cors = require("cors");
require("dotenv").config();

db.loadDatabase();
const fetch = require("node-fetch");
const rule = new schedule.RecurrenceRule();

rule.minute = 45;

global.Headers = fetch.Headers;

// Allow CORS
app.use(cors());

// Authorization
const api_login = process.env.API_LOGIN;
const api_password = process.env.API_PASSWORD;
let headers = new Headers();
headers.set(
  "Authorization",
  "Basic " + Buffer.from(api_login + ":" + api_password).toString("base64")
);

// const helpdesk_host = "https://app.aqtau109.kz/api/v2";
const helpdesk_host = "https://lama.helpdeskeddy.com/api/v2";

// Обноволение базы данных
function updateDB() {
  // Удаление преведущей файла базы данных

  db.remove({}, { multi: true }, function (err, numRemoved) {
    console.log("database has been erased ");
  });

  const api_url = `${helpdesk_host}/tickets/`;
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
        const api_url = `${helpdesk_host}/tickets/?page=${i}`;
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

// Counting tickets 2.0
app.get("/api/v1/count_tickets", async (request, response) => {
  db.count({}, (error, all) => {
    db.count({ status_id: "open" }, (error, open) => {
      db.count({ status_id: "closed" }, (error, closed) => {
        db.count({ status_id: "prosrocheno" }, (error, prosrocheno) => {
          response.json({ all, open, closed, prosrocheno });
        });
      });
    });
  });
});

// Counting tickets by deparment 2.0
app.get("/api/v1/count_tickets/:department_id", async (request, response) => {
  const department_id = parseInt(request.params.department_id);

  db.count({ department_id }, (error, all) => {
    db.count({ status_id: "open", department_id }, (error, open) => {
      db.count({ status_id: "closed", department_id }, (error, closed) => {
        db.count(
          { status_id: "prosrocheno", department_id },
          (error, prosrocheno) => {
            response.json({ all, open, closed, prosrocheno });
          }
        );
      });
    });
  });
});

// sum rating
app.get("/api/v1/rating", async (request, response) => {
  db.count({}, (error, all) => {
    db.count({ rate: "like" }, (error, like) => {
      db.count({ rate: "dislike" }, (error, dislike) => {
        response.json({ all, like, dislike });
      });
    });
  });
});

// rating by departments
app.get("/api/v1/rating/:department_id", async (request, response) => {
  const department_id = parseInt(request.params.department_id);

  db.count({ department_id }, (error, all) => {
    db.count({ rate: "like", department_id }, (error, like) => {
      db.count({ rate: "dislike", department_id }, (error, dislike) => {
        response.json({ all, like, dislike });
      });
    });
  });
});

// proxy
app.get("/api/v1/:query", async (request, response) => {
  const api_url = `${helpdesk_host}/${request.params.query}`;

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

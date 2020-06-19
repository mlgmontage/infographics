const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const NeDbPromise = require("nedb-promise");
const dbpromise = NeDbPromise({ filename: "database.json", autoload: true });
const schedule = require("node-schedule");
const _ = require("lodash");
const cors = require("cors");
require("dotenv").config();

const fetch = require("node-fetch");
const { request, response } = require("express");
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

const helpdesk_host = "https://pasha.helpdeskeddy.com/api/v2";

// Обноволение базы данных
async function updateDB() {
  // Удаление преведущей файла базы данных

  await dbpromise.remove({}, { multi: true });

  const api_url = `${helpdesk_host}/tickets/`;
  const response = await fetch(api_url, { headers });
  const json = await response.json();
  console.log(json);

  // iteration through pages
  for (let i = 1; i <= json.pagination.total_pages; i++) {
    // new url
    const api_url_page = `${helpdesk_host}/tickets/?page=${i}`;
    // fetching data from new url
    const page_response = await fetch(api_url_page, { headers });
    const page_json = await page_response.json();

    for (let record of Object.keys(page_json.data)) {
      dbpromise.insert(page_json.data[record]);
    }
  }
}

updateDB();

// База обновляется
let j = schedule.scheduleJob(rule, async function () {
  await updateDB();
  console.log("Database has been updated");
});

// Counting tickets 3.0
app.get("/api/v1/count_tickets", async (request, response) => {
  const all = await dbpromise.count({});
  const open = await dbpromise.count({ status_id: "open" });
  const closed = await dbpromise.count({ status_id: "closed" });
  const prosrocheno = await dbpromise.count({ status_id: "prosrocheno" });
  const like = await dbpromise.count({ rate: "like" });
  const dislike = await dbpromise.count({ rate: "dislike" });
  response.json({ all, open, closed, prosrocheno, like, dislike });
});

// count category
app.get("/api/v1/category", async (request, response) => {
  let categories = [];
  let data = [];

  // query to DB
  const tickets = await dbpromise.find({
    custom_fields: {
      $elemMatch: { field_type: "hierarchy" },
    },
  });

  tickets.map((category) => {
    if (!category.custom_fields[0].field_value[1].name) return;
    let category_name = category.custom_fields[0].field_value[1].name.ru;
    // let subcategory_name = category.custom_fields[0].field_value[2].name.ru;
    console.log(category.custom_fields[0].field_value[1]);

    categories.push({
      category_name,
    });
  });

  categories = _.countBy(categories, "category_name");
  for (let key in categories) {
    data.push({
      category_name: key,
      length: categories[key],
    });
  }

  response.json(data);
});

// count category by department
app.get("/api/v1/category/:department_id", async (request, response) => {
  const department_id = parseInt(request.params.department_id);
  let categories = [];
  let data = [];

  // query to DB
  const tickets = await dbpromise.find({
    custom_fields: { $elemMatch: { field_type: "hierarchy" } },
    department_id,
  });

  tickets.map((category) => {
    if (!category.custom_fields[0].field_value[1].name) return;
    let category_name = category.custom_fields[0].field_value[1].name.ru;
    // let subcategory_name = category.custom_fields[0].field_value[2].name.ru;

    categories.push({
      category_name,
    });
  });

  categories = _.countBy(categories, "category_name");
  for (let key in categories) {
    data.push({
      category_name: key,
      length: categories[key],
    });
  }

  response.json(data);
});

// Counting tickets by deparment 3.0
app.get("/api/v1/count_tickets/:department_id", async (request, response) => {
  const department_id = parseInt(request.params.department_id);

  const all = await dbpromise.count({ department_id });
  const open = await dbpromise.count({ status_id: "open", department_id });
  const closed = await dbpromise.count({ status_id: "closed", department_id });
  const prosrocheno = await dbpromise.count({
    status_id: "prosrocheno",
    department_id,
  });
  const like = await dbpromise.count({ rate: "like", department_id });
  const dislike = await dbpromise.count({ rate: "dislike", department_id });
  response.json({ all, open, closed, prosrocheno, like, dislike });
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

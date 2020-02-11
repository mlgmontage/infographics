const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const Datastore = require('nedb')
const db = new Datastore({ filename: 'database.json'})
const fs = require('fs')
require('dotenv').config();

db.loadDatabase()

const fetch = require('node-fetch')

global.Headers = fetch.Headers;

// Authorization
const api_login = process.env.API_LOGIN;
const api_password = process.env.API_PASSWORD;
let headers = new Headers();
headers.set('Authorization', 'Basic ' + Buffer.from(api_login + ":" + api_password).toString('base64'));

// Обноволение базы данных
async function updateDB() {
	const pathToDBFile = './database.json';

	// Удаление преведущей файла базы данных
	try {
		fs.unlinkSync(pathToDBFile)
	} catch(error) {
		console.error(error)
	}

	let temp = []

	const api_url = `https://app.aqtau109.kz/api/v2/tickets/?status_list=open,closed`;
	const fetch_response = await fetch(api_url, {
		method: 'GET',
		headers: headers
	});
	const json = await fetch_response.json();

	for(let i = 1; i <= json.pagination.total_pages; i++) {

		const api_url = `https://app.aqtau109.kz/api/v2/tickets/?page=${i}&status_list=open,closed`;
		
		fetch(api_url, {
			method: 'GET',
			headers: headers
		}).then((response) => {

			return response.json();

		}).then((json) => {
			for(let record of Object.keys(json.data)) {
				temp.push(json.data[record])
			}

			// saving to database
			temp.forEach(async value => {
				await db.insert(value, function(error, newDoc) {
					console.log('data has been successfully saved')
				})
			})

			// console.log(json)

		})
	}


	console.log(json.pagination);
}

// интервал 24 часа
const interval = 1000 * 60 * 60 * 24;

// База обновляется каждые 24 часа
setInterval(updateDB, interval);

// Заявки
app.get('/api/v1/tickets', async (request, response) => {
	const api_url = `https://app.aqtau109.kz/api/v2/tickets/?status_list=open,closed`;
	console.log(request.params)
	const fetch_response = await fetch(api_url, {
		method: 'GET',
		headers: headers
	});
	const json = await fetch_response.json();


	let temp = []
	for(let record of Object.keys(json.data)) {
		temp.push(json.data[record])
	}

	// console.log(...temp)
	// saving to database
	// temp.forEach(async value => {
	// 	await db.insert(value, function(error, newDoc) {
	// 		console.log('data has been successfully saved')
	// 	})
	// })
	response.json(json);
})


// открытые заявки
app.get('/api/v1/tickets/open', async (request, response) => {
	const api_url = `https://app.aqtau109.kz/api/v2/tickets/?status_list=open`;
	console.log(request.params)
	const fetch_response = await fetch(api_url, {
		method: 'GET',
		headers: headers
	});
	const json = await fetch_response.json();
	response.json(json);
})

// Счет открытых заявок
app.get('/api/v1/tickets/opentickets', async (request, response) => {
	db.count({"status_id": "open"}, function(error, count) {
		response.json(count)
	})
})

// Счет закрытых заявок
app.get('/api/v1/tickets/closedtickets', async (request, response) => {
	db.count({"status_id": "closed"}, function(error, count) {
		response.json(count)
	})
})

// закрытые заявки
app.get('/api/v1/tickets/closed', async (request, response) => {
	const api_url = `https://app.aqtau109.kz/api/v2/tickets/?status_list=closed`;
	console.log(request.params)
	const fetch_response = await fetch(api_url, {
		method: 'GET',
		headers: headers
	});
	const json = await fetch_response.json();
	response.json(json);
})

// Организации

app.get('/api/v1/organizations', async (request, response) => {
	const api_url = `https://app.aqtau109.kz/api/v2/organizations/`;
	const fetch_response = await fetch(api_url, {
		method: 'GET',
		headers: headers
	});
	const json = await fetch_response.json();
	response.json(json);
})

// Департаменты
app.get('/api/v1/departments', async (request, response) => {
	const api_url = `https://app.aqtau109.kz/api/v2/departments`;
	console.log(request.params)
	const fetch_response = await fetch(api_url, {
		method: 'GET',
		headers: headers
	});
	const json = await fetch_response.json();
	response.json(json);
})

app.listen(port, function() {
	console.log(`Server listenning on port ${port}`)
})

app.use(express.static('public'))
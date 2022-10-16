import dateFormat, { masks } from "dateformat";
import express from "express";
import fs from "fs";
import cors from "cors";
import * as dotenv from 'dotenv';
//import redis from "redis";
import Redis from "ioredis";
import RedisMock from 'ioredis-mock';

dotenv.config({ path: '/app/nodejs/node-work-apis2/.env' })
if(process.env != null) {	console.log("env properties initialized") }

const app = express()


// TODO host e pass su env esterna, aggiungere versione redis-mock node js
const redisclientReal = new Redis(
			{
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        database: 0
      });

const redisclientMock = new RedisMock({
  // `options.data` does not exist in `ioredis`, only `ioredis-mock`
  data: {
		'IFRANCESCO_WORK_ITEMS_INIT': [
			'{ "name":"Allianz Bank", "position":"Senior Consultant", "location":"Milan, IT", "image":{"icon":"./assets/logos/avanade.png"}, "date":{"start":"2014-02-01","end":"2015-02-28"} }'
		]
	},
});

// default redis mock implementation enabled
const redisclient = redisclientMock;

// APIs
app.all('/', (req, res) => {
    console.log("[Work] Request parsed succesfully")
    res.send('[Work] express application is now up and running.')
});

// work api and custom cors apply
app.all('/allWorkItems',
  cors(
      { origin: ['https://ifrancesco.web.app'] },
      { methods: ['GET'] } ),
  (req, res) => {
    let rawdata = fs.readFileSync('assets/data-works.json');
  	let workData = JSON.parse(rawdata);

  	// Logs
  	let dateNow = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
  	let dateLogPrefix = "[" + dateNow + "] - ";
  	let workStr = JSON.stringify(workData);
  	console.log(dateLogPrefix + 'Work data read : ' + workStr);

  	res.send(workData)
});

// REDIS
app.all('/allWorkItemsRedis',
  cors(
      { origin: ['https://ifrancesco.web.app'] },
      { methods: ['GET'] } ),
  (req, res) => {
    console.log('retrieving redis ..');

    (async () => {
				let worksKey = 'IFRANCESCO_WORK_ITEMS'
        const rawdata = await redisclient.lrange(worksKey, 0, -1);
				const jsonWorksData = "["+rawdata+"]"
        console.log("jsonWorksData result: ", jsonWorksData);
		  	let workData = JSON.parse(jsonWorksData);
				res.send(workData)
    })();
});

app.all('/fillInitialRedisData',
  cors(
      { origin: ['https://ifrancesco.web.app'] },
      { methods: ['GET'] } ),
  (req, res) => {

    fillInitialRedisData();

});

function fillInitialRedisData() {
	console.log('fillInitialRedisData ..');

	(async () => {
		let worksKey = 'IFRANCESCO_WORK_ITEMS'

		// pre-clean:
		const delWorkData = await redisclient.del(worksKey);
		console.log('delWorkData done ' + delWorkData);

		const workData0 = await redisclient.lrange(worksKey, 0, -1)
		console.log('initial get ' + workData0);

		/*var aTest = { name : 'Kyle Davis', address : '123 Main Street'  };
		var aTest2 = { name : 'Frank Dans', address : '123 Second Street' };
		const workTests = [JSON.stringify(aTest), JSON.stringify(aTest2)];*/
		let worksJsonDataByFile = fs.readFileSync('assets/data-works.json');
		let workDataByFile = JSON.parse(worksJsonDataByFile);
		console.log('workDataByFile item map ' + workDataByFile.itemMap);
		let workItemMap = new Map(Object.entries(workDataByFile.itemMap));

		for (var workDataItem of workItemMap.values()) {
			 let workItemStr = JSON.stringify(workDataItem);
			 //console.log('### workItemStr ' + workItemStr);
			 const pushresult = await redisclient.lpush(worksKey, workItemStr);
			 console.log('pushresult ... ' + pushresult);
		}

		const listData = await redisclient.llen(worksKey);
		console.log('listData done ' + listData);
		const workData = await redisclient.lrange(worksKey, 0, -1);
		console.log('set and get done ' + workData);

		// clean:
		//const delWorkData = await redisclient.del(worksKey);
		//console.log('delWorkData done ' + delWorkData);
	})();
};


async function initializeData() {
	console.log("async init data");
	fillInitialRedisData();
}

async function boot() {
  await initializeData();
	console.log("asyn boot app listen");
	app.listen(process.env.PORT || 3000)
}

boot();

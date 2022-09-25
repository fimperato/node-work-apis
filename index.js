import dateFormat, { masks } from "dateformat";
import express from "express";
import fs from "fs";
import cors from "cors";

const app = express()

// APIs
app.all('/', (req, res) => {
    console.log("[Work] Request parsed succesfully")

    res.send('[Work] express application is now up and running.')
})

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
})



app.listen(process.env.PORT || 3000)

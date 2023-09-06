const express = require("express");
const axios = require("axios");
const fs = require("fs");
const app = express();
const port = 3000;
require('dotenv').config();
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

const pipedriveApiToken = process.env.PIPEDRIVE_API_TOKEN;

const countries = [
    { id: 1, name: "Zimbabwe" },
    { id: 2, name: "India" },
    { id: 3, name: "Zimbabwe" },
    { id: 4, name: "Zimbabwe" },
    { id: 5, name: "Zimbabwe" },
    { id: 6, name: "South Africa"},
    { id: 7, name: "Zimbabwe"},
    { id: 8, name: "India"},
    { id: 9, name: "South Africa"},
];

const contactsWithAges = [
    { id: 1, age: 24 },
    { id: 2, age: 30 },
    { id: 3, age: 25 },
    { id: 4, age: 34 },
    { id: 5, age: 48 },
    { id: 6, age: 19 },
    { id: 7, age: 28 },
    { id: 8, age: 27 },
    { id: 9, age: 22 },
];

function logMessage(message) {
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFile("app.log", logEntry, (err) => {
        if (err) {
            console.error("Error writing to log file:", err);
        }
    });
    console.log(logEntry);
}

app.get("/contacts", async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.pipedrive.com/v1/persons?api_token=${pipedriveApiToken}`
        );
        const data = response.data.data;

        const formattedContacts = data.map(contact => {
            const contactWithAge = contactsWithAges.find(c => c.id === contact.id);
            const contactCountry = countries.find(c => c.id === contact.id);

            return {
                profilePicture: contact.picture_id.pictures['128'],
                firstName: contact.first_name,
                lastName: contact.last_name,
                email: contact.email[0] ? contact.email[0].value : "",
                id: contact.id,
                phone: contact.phone[0] ? contact.phone[0].value : "",
                label: contact.label ? contact.label : "",
                organization: contact.org_name ? contact.org_name : "",
                country: contactCountry ? contactCountry.name : getRandomCountry(),
                age: contactWithAge ? contactWithAge.age : 0,
            };
        });

        function getRandomCountry() {
            const randomIndex = Math.floor(Math.random() * countries.length);
            return countries[randomIndex].name;
        }

        const numberOfRecords = formattedContacts.length;

        logMessage(`Successfully fetched ${numberOfRecords} records from Pipedrive.`);

        res.render("index", { formattedContacts });
    } catch (error) {
        const errorMessage = `Error fetching data from Pipedrive: ${error.message}`;
        logMessage(errorMessage);
        res.status(500).send("Error fetching data");
    }
});

app.listen(port, function () {
    console.log(`Server running on http://localhost:${port}`);
});

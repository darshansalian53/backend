const dotenv = require('dotenv');
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


const app = express();

dotenv.config({ path: './config.env' });
require('./db/conn');
const port = process.env.PORT;

const Users = require('./models/userSchema');
const Message = require('./models/msgSchema');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send("Hello World");
})

app.post('/register', async (req, res) => {
    try {
        // Get body or Data
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        const createUser = new Users({
            username: username,
            email: email,
            password: password
        });

        // Save Method is Used to Create User or Insert User
        // But Before Saving or Inserting, Password will Hash 
        // Because of Hashing. After Hash, It will save to DB
        const created = await createUser.save();
        console.log(created);
        res.status(200).send("Registered");

    } catch (error) {
        res.status(400).send(error)
    }
})

app.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        // Find User if Exist
        const user = await Users.findOne({ email: email });
        if (user) {
            // Verify Password
            const isMatch = await bcryptjs.compare(password, user.password);

            if (isMatch) {
                // Generate Token Which is Define in User Schema
                const token = await user.generateToken();
                res.cookie("jwt", token, {
                    // Expires Token in 24 Hours
                    expires: new Date(Date.now() + 86400000),
                    httpOnly: true
                })
                res.status(200).send("LoggedIn")
            } else {
                res.status(400).send("Invalid Credentials");
            }
        } else {
            res.status(400).send("Invalid Credentials");

        }

    } catch (error) {
        res.status(400).send(error);
    }
})
app.post('/message', async (req, res) => {
    try {
        // Get body or Data
        const name = req.body.name;
        const email = req.body.email;
        const message = req.body.message;

        const sendMsg = new Message({
            name: name,
            email: email,
            message: message
        });

        // Save Method is Used to Create User or Insert User
        // But Before Saving or Inserting, Password will Hash 
        // Because of Hashing. After Hash, It will save to DB
        const created = await sendMsg.save();
        console.log(created);
        res.status(200).send("Sent");

    } catch (error) {
        res.status(400).send(error)
    }
})
app.get('/logout', (req, res) => {
    res.clearCookie("jwt", { path: '/' })
    res.status(200).send("User Logged Out")
})




app.listen(port, () => {
    console.log("server is up and running")
})
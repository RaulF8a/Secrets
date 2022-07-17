import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import mongoose from 'mongoose';
// import md5 from 'md5';
import bcryptjs from 'bcryptjs';
// import encryption from 'mongoose-encryption';

const saltRounds = 10;

// App Configuration.
const app = express ();

app.use (bodyParser.urlencoded ({extended: true}));
app.use (express.static ("public"));
app.set ("view engine", "ejs");

// Database setup.
mongoose.connect ("mongodb://localhost:27017/userDB");

// Schema, encryption, and model creation.
const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

// Encryption
// userSchema.plugin(encryption, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = mongoose.model ("user", userSchema);

// Home page operations.
app.get ("/", (req, res) => {
    res.render ("home");
});

// Login page operations.
app.route ("/login")
.get ((req, res) => {
    res.render ("login", {username: "", password: "", errorMessage: ""});
})
.post ((req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne ({email: username}, (err, document) => {
        if (err){
            console.log (err);

            return;
        }
        if (!document){
            res.render ("login", {username: username, password: password, errorMessage: "Email incorrect."});

            return;
        }

        bcryptjs.compare (password, document.password, (err, response) => {
            if (err){
                console.log (err);
                return;
            }

            if (response === true){
                res.render ("secrets");
                return;
            }
            else{
                res.render ("login", {username: username, password: password, errorMessage: "Password incorrect."});
                return;
            }
        });
    });
});

// Register page operations.
app.route ("/register")
.get ((req, res) => {
    res.render ("register");
})
.post ((req, res) => {
    bcryptjs.hash (req.body.password, saltRounds, (err, hash) => {
        const newUser = new User ({
            email: req.body.username,
            password: hash
        });
    
        newUser.save ((err) => {
            if (!err){
                res.render ("secrets");
    
                return;
            }
    
            console.log (err);
        });
    });
});

// App listen in port 3000.
app.listen (process.env.PORT || 3000, () => {
    console.log ("Server running on port 3000.");
});
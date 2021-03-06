const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

//VALIDATION OF USER INPUTS PREREQUISITES
const Joi = require("@hapi/joi");

const mongodb = require("mongodb")
const objectId = mongodb.ObjectID

const registerSchema = Joi.object({
  fname: Joi.string().min(3).required(),
  lname: Joi.string().min(3).required(),
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

//ADMIN VERIFY TOKEN

const adminVerify = require("../adminauth/adminverfiy");

//SIGNUP USER
router.post("/register", adminVerify, async (req, res) => {
  //CHECKING IF USER EMAIL ALREADY EXISTS
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) res.status(400).send("Email already exists");

  //HASHING THE PASSWORD

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //ON PROCESS OF ADDING NEW USER

  const user = new User({
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    password: hashedPassword,
    type: "manager",
  });

  try {
    //VALIDATION OF USER INPUTS

    const { error } = await registerSchema.validateAsync(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    else {
      //NEW USER IS ADDED

      const saveUser = await user.save();
      //   res.send({ user: user._id });
      res.send("user created");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//SIGNIN USER

router.post("/login", async (req, res) => {
  //CHECKING IF USER EMAIL EXISTS

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json("Incorrect Email- ID");

  //CHECKING IF USER PASSWORD MATCHES

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Incorrect Password");

  try {
    //VALIDATION OF USER INPUTS

    const { error } = await loginSchema.validateAsync(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    else {
      console.log(user.type);
      if (user.type === "manager") {
        const token = jwt.sign(
          { _id: user._id },
          process.env.MANAGER_TOKEN_SECRET
        );
        res.status(200).header("auth-token", token).send(token);
      } else {
        res.status(200).json({ message: "seems like you are not a manager" });
      }
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Change Password functionality
router.put("/changePassword", async (req, res) => {
  try{
    let data = await (await User.findOne({ email: req.body.email }));
    let salt = await bcrypt.genSalt(8);
    if (data) {
      // let randomStringData = {randomString : salt}
      let tempData = {data};
      tempData.data.randomString = salt;
      data.set(tempData.data);
      const result = await data.save();
      
      let resetURL = process.env.baseURL + '/manager/passwordreset';
      resetURL = resetURL+"?id="+data._id+"&rs="+salt
          try {
            const sendMail = require('../services/mailService');
            console.log("email is:" + req.body.email);
            sendMail({
              from: "sukritippl@gmail.com",
              to: req.body.email,
              subject: 'CRM Reset Password',
              text: `${resetURL}`,
              html: `${resetURL}`,
            })
            .then(() => {
              return res.json({success: true});
            })
            .catch(err => {  
              return res.status(500).json({error: 'Error in email sending.'});
            });
        } 
        catch(err) {
          return res.status(500).send({ error: 'Something went wrong.'});
        }
      }
      else {
        res.status(400).json({
          message: "User is not registered"
        });
      }
  }
  catch(error){
    console.log("error is:" + error);
    res.status(500).json({
        message: "Internal Server Error"
    })
}
});

// Update Password functionality
router.post("/verifyPasswordChange", async (req, res) => {
  try {
    
    let data = await User.findOne({ _id: objectId(req.body.objectId) });
    if (data.randomString === req.body.randomString) {
      res.status(200).json({ message: "Verification success" });
    } 
    else {
      console.log("radnomString isL:" + data.randomString + " but it should be:" + req.body.randomString);
      console.log("YOu are not authirse is: ");
      res.status(401).json({
        message: "You are not authorized",
      });
    }
  } 
  catch (error) {
    console.log("error is: " + error);
    res.status(500).json({
        message: "Internal Server Error"
    });
  }    
});

// updateDBWithPassword
router.put("/updatePassword", async (req, res) => {
  try{
    let salt = await bcrypt.genSalt(10); 
    
    let hash = await bcrypt.hash(req.body.password, salt);
    req.body.password = hash;
    let data = await User.findOne({ _id: objectId(req.body.objectId) });
    
    data.password = hash;
    await data.save();
    data1 = await User.findOne({ _id: objectId(req.body.objectId) });
    
    res.status(200).json({
        message : "Password Changed Successfully"
    })
  }
  catch(error){
    res.status(500).json({
        message: "Error while changing the password"
    })
  }
});
module.exports = router;

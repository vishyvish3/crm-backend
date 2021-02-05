//EMPLOYEE DASHBOARD

//EMPLOYEE CAN VIEW

const router = require("express").Router();
const verify = require("./employeeverify");
const ServiceRequest = require("../../models/ServiceRequest");
const Lead = require("../../models/Lead");
const Contact = require("../../models/Contact");
const sendMail = require("../../sampleMail");

//VALIDATION OF USER INPUTS PREREQUISITES
const Joi = require("@hapi/joi");

const serviceRequestSchema = Joi.object({
  title: Joi.string().min(3).required(),
  client: Joi.string().min(3).required(),
  manager: Joi.string().min(3).required(),
  expected_revenue: Joi.number().min(2).required(),
  probability: Joi.number().required(),
  status: Joi.string().min(2).required(),
  expected_closing: Joi.date().required(),
  priority: Joi.string().min(2).required(),
  senderEmail: Joi.string().min(2),
});

//SERVICE REQUEST API'S

//POST
router.post("/servicerequest", verify, async (req, res) => {
  console.log("inside serviceRequest initially mail of person adding req is: "+ req.body.senderEmail);
  const ticket = new ServiceRequest({
    title: req.body.title,
    client: req.body.client,
    manager: req.body.manager,
    expected_revenue: req.body.expected_revenue,
    probability: req.body.probability,
    status: req.body.status,
    expected_closing: req.body.expected_closing,
    priority: req.body.priority,
  });

  try {
    //VALIDATION OF USER INPUTS

    const { error } = await serviceRequestSchema.validateAsync(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    else {
      //NEW SERVICE REQUEST  IS ADDED

      const saveTicket = await ticket.save();
      
      const email = req.body.senderEmail;
      const mailData = {
        subject: "New Service Request Added by Employee",
        message: "has created a new service request",
        email:  email
      }
      // let mailResponse = {};
      const sendEmailResponse = await sendMail(mailData);

      if(sendEmailResponse.resMsg=== "Verification mail sent"){
        res.send("service request created");
      }
      else {
        // console.log("mail sending error "+ sendEmailResponse.resMsg);
        res.status(400).send(sendEmailResponse.resMsg);
      }
    }
  } catch (error) {
    // console.log("error in catch is: "+ error);
    res.status(400).send(error);
  }
});


//GET

router.get("/servicerequest", verify, async (req, res) => {
  try {
    const tickets = await ServiceRequest.find().exec();
    res.status(200).send(tickets);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//PUT

router.put("/servicerequest/:id", async (req, res) => {
  try {
    const tickets = await ServiceRequest.findById(req.params.id).exec();
    tickets.set(req.body);
    const result = await tickets.save();
    const email = req.body.senderEmail;
      const mailData = {
        subject: "Service Request Updated by Employee",
        message: "has updated a service request",
        email:  email
      }
      // let mailResponse = {};
      const sendEmailResponse = await sendMail(mailData);
      // console.log("email sending response is "+ JSON.stringify(sendEmailResponse));
      if(sendEmailResponse.resMsg=== "Verification mail sent"){
        res.send(result);
      }
      else {
        // console.log("mail sending error "+ sendEmailResponse.resMsg);
        res.status(400).send(sendEmailResponse.resMsg);
      }
    
  } catch (error) {
    res.status(500).send(error);
  }
});

//VALIDATION OF USER INPUTS PREREQUISITES

const LeadSchema = Joi.object({
  title: Joi.string().min(3).required(),
  client: Joi.string().min(3).required(),
  number: Joi.number().min(3).required(),
  status: Joi.string().min(2).required(),
  senderEmail: Joi.string().min(2),
});

//LEAD API'S

//POST

router.post("/lead", verify, async (req, res) => {
  const lead = new Lead({
    title: req.body.title,
    client: req.body.client,
    number: req.body.number,
    status: req.body.status,
  });

  try {
    //VALIDATION OF USER INPUTS

    const { error } = await LeadSchema.validateAsync(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    else {
      //NEW LEAD IS ADDED

      const leads = await lead.save();
      const email = req.body.senderEmail;
      const mailData = {
        subject: "New Lead Added by Employee",
        message: "has created a new Lead",
        email:  email
      }
      // let mailResponse = {};
      const sendEmailResponse = await sendMail(mailData);
      // console.log("email sending response is "+ JSON.stringify(sendEmailResponse));
      if(sendEmailResponse.resMsg=== "Verification mail sent"){
        res.send("Lead created");
      }
      else {
        // console.log("mail sending error "+ sendEmailResponse.resMsg);
        res.status(400).send(sendEmailResponse.resMsg);
      }
    
      
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//GET

router.get("/lead", verify, async (req, res) => {
  try {
    const leads = await Lead.find().exec();
    res.status(200).send(leads);
  } catch (error) {
    console.log(error);
  }
});

//PUT

router.put("/lead/:id", async (req, res) => {
  try {
    const leads = await Lead.findById(req.params.id).exec();
    leads.set(req.body);
    const result = await leads.save();

    const email = req.body.senderEmail;
    console.log(" lead sender email from req body is: "+ email);
    const mailData = {
      subject: "Lead Updated by Employee",
      message: "has updated a Lead",
      email:  email
    }
    // let mailResponse = {};
    const sendEmailResponse = await sendMail(mailData);
    // console.log("email sending response is "+ JSON.stringify(sendEmailResponse));
    if(sendEmailResponse.resMsg=== "Verification mail sent"){
      res.send(result);
    }
    else {
      // console.log("mail sending error "+ sendEmailResponse.resMsg);
      res.status(400).send(sendEmailResponse.resMsg);
    }
  
  } catch (error) {
    res.status(500).send(error);
  }
});

//VALIDATION OF USER INPUTS PREREQUISITES

const ContactSchema = Joi.object({
  title: Joi.string().min(3).required(),
  client: Joi.string().min(3).required(),
  email: Joi.string().min(2).required().email(),
  number: Joi.number().min(3).required(),
  address: Joi.string().min(2).required(),
});

//CONTACT API'S

//POST

router.post("/contact", verify, async (req, res) => {
  const contact = new Contact({
    title: req.body.title,
    client: req.body.client,
    email: req.body.email,
    number: req.body.number,
    address: req.body.address,
  });

  try {
    //VALIDATION OF USER INPUTS

    const { error } = await ContactSchema.validateAsync(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    else {
      //NEW CONTACT IS ADDED

      const contacts = await contact.save();
      res.send("Contact created");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//GET

router.get("/contact", verify, async (req, res) => {
  try {
    const contacts = await Contact.find().exec();
    res.status(200).send(contacts);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//PUT

router.put("/contact/:id", async (req, res) => {
  try {
    const contacts = await Contact.findById(req.params.id).exec();
    contacts.set(req.body);
    const result = await contacts.save();

    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});


// API TO GET COUNT OF SEVICE-REQUEST, LEAD AND COUNT


router.get("/getCount", verify, async (req, res) => {
  try {
    const tickets = await ServiceRequest.find().exec();
    const leads = await Lead.find().exec();
    const contacts = await Contact.find().exec();
    const serviceRequestCount= tickets.length;
    const leadCount = leads.length;
    const contactCount = contacts.length;
    const count = {
      serviceRequestCount,
      leadCount,
      contactCount
    }
    res.status(200).send(count);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});


module.exports = router;


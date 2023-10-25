import express from "express";
import util from "util";
import fs from "fs";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import readline from "readline";
import { OAuth2Client } from "google-auth-library";
// import pdf from 'pdf-parse'
// import extractImages from 'pdf-image-extract'
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
];

export const app = express();
app.use(express.json());
app.listen(4000, () => {
  console.log(`server is working on port 4000 `);
});

app.get("/", (req, res) => {
  res.send("hello anirudh sir ");
});

//   1. PDF Parsing
//   - Write a program to parse PDFs attached to emails received on Gmail.n
//   - The emails will have varying sender email addresses but will contain a specific subject line indicating that   the attached PDF is a bank statement.
//   - Extract text, images from PDFs.

/*
    For write this programe i have to access my gmail through tokens provided by google 
    there are other some  steps to access gmail but they are not a part of programing 
    This step usually involves opening a URL in a browser and granting permission then retrieving the token

    after accesing Gmail i will  search  for emails with a specific subject line
    If these emails have attached PDF files i will Extract text and images   from the PDFs.
    my programe is below 


*/

const readFileAsync = util.promisify(fs.readFile);
// secrets
const TOKEN_PATH = "token.json";
const CREDENTIALS_PATH = "your-credentials.json";

async function main() {
  const credentials = require("./your-credentials.json");

  // Authorize Gmail access using OAuth 2.0
  const token = await authorize(credentials);

  // Create a Gmail transporter with OAuth2 credentials
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      type: "OAuth2",
      user: "your-email@gmail.com", // Your Gmail address
      clientId: credentials.installed.client_id,
      clientSecret: credentials.installed.client_secret,
      refreshToken: token.refresh_token,
      accessToken: token.access_token,
    },
  });

  const subject = "statement Specific Subject";

  // Search for emails with the specific subject
  const emails = await searchEmails(transporter, subject);

  for (const email of emails) {
    const attachments = email.attachments;

    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.contentType === "application/pdf") {
          // Extract text content from the PDF
          const pdfText = await extractTextFromPDF(attachment.body.data);
          console.log(`Text from PDF: ${pdfText}`);

          // Extract images from the PDF
          const imagePaths = await extractImagesFromPDF(attachment.body.data);

          for (const imagePath of imagePaths) {
            console.log(`Image Path: ${imagePath}`);
          }
        }
      }
    }
  }
}

async function authorize(credentials) {
  try {
    return JSON.parse(await readFileAsync(TOKEN_PATH));
  } catch (err) {
    console.error("Error reading token file:", err);
    return null;
  }
}

// Function to search for emails with a specific subject line
async function searchEmails(transporter, subject) {
  const emails = [];

  const searchCriteria = {
    subject: subject,
  };

  const searchQuery = `in:inbox is:unread ${
    searchCriteria.subject ? `subject:"${searchCriteria.subject}"` : ""
  }`;

  const emailIds = await listEmails(transporter, searchQuery);

  for (const emailId of emailIds) {
    const email = await fetchEmail(transporter, emailId);
    emails.push(email);
  }

  return emails;
}

// Function to list email IDs matching search criteria
async function listEmails(transporter, searchQuery) {
  const searchResponse = await transporter.search(searchQuery);

  if (searchResponse) {
    return searchResponse;
  }

  return [];
}

// Function to fetch email content
async function fetchEmail(transporter, emailId) {
  const email = await transporter.getEmail(emailId);

  if (email) {
    return email;
  }

  return null;
}

// Function to extract text content from a PDF
async function extractTextFromPDF(pdfData) {
  const pdfBuffer = Buffer.from(pdfData, "base64");
  const pdfText = await pdf(pdfBuffer);

  return pdfText.text;
}

// Function to extract images from a PDF
async function extractImagesFromPDF(pdfData) {
  const pdfBuffer = Buffer.from(pdfData, "base64");

  return new Promise((resolve, reject) => {
    extractImages(pdfBuffer, { separateFiles: true }, (error, images) => {
      if (error) {
        reject(error);
      } else {
        resolve(images.map((image) => image.pageFilePath));
      }
    });
  });
}

//   2. API Integration
//  1 =  Implement APIs that interact with the parsed bank statement data./
//  2 =  Implement an API endpoint to retrieve a list of parsed transactions.
//  3 = Implement an API endpoint to search for transactions within a specific date range.
//   - Implement an API endpoint to get the total balance as of a specific date.

/* 1 =   i am considering that interact mean get all data  , get data by specific id  , or post new data
so i implement this 3 apis 
i consider that bank statement data is in json file which is in array  so i make demo data 
 */

const bankStatementData = [
  {
    accountHolder: "anirudh sir",
    description: "salary  received from valyx ",
    amount: 120000,
    date: "2023-10-26",
  },
  {
    accountHolder: "Pankaj Kewat",
    description: "salary  received  from valyx",
    amount: 22000,
    date: "2023-11-26",
  },
];

//get all data of statement
app.get("/api/all-statement", (req, res) => {
  res.json(bankStatementData);
});

// Add a new bank statement
app.post("/api/new-transaction ", (req, res) => {
  const newEntry = req.body;
  bankStatementData.push(newEntry);
  res.status(201).json(newEntry);
});
// Get a specific bank statement entry by index
app.get("/api/bank-statement/:index", (req, res) => {
  const index = parseInt(req.params.index);
  if (index >= 0 && index < bankStatementData.length) {
    res.json(bankStatementData[index]);
  } else {
    res.status(404).json({ error: "Entry not found" });
  }
});

// 2 = Implement an API endpoint to retrieve a list of parsed transactions.
/*
 */

app.get("/api/all-statement", (req, res) => {
  /*
    for better use of this api i need major schema of bank transaction which contain all details of each account so i can query on data for get specific transaction
    */

  return res.status(200).json({
    success: true,
    massage: "data get succesfully ",
    data: bankStatementData,
  });
});

// Implement an API endpoint to search for transactions within a specific date range.
//  app.use(bodyParser.json());

app.get("/api/date-wise-transactions", (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Both startDate and endDate are required." });
  }

  const filteredTransactions = bankStatementData.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      //selecting transactios greater than start date and under the enddate
      transactionDate >= new Date(startDate) &&
      transactionDate <= new Date(endDate)
    );
  });

  res.status(200).json(filteredTransactions);
});

//  3 = Implement an API endpoint to search for transactions within a specific date range.
//
app.get("/api/total-balance", (req, res) => {
  const { targetdate } = req.query;

  if (!targetdate) {
    return res.status(400).json({ error: "targetdate is  required." });
  }

  const balance = calculateBalance(bankStatementData, targetdate);

  res.json({ balance });
});

function calculateBalance(bankStatementData, targetdate) {
  const asOfDateObj = new Date(targetdate);

  // Filter transactions that occurred on or before the target  date
  const relevantTransactions = bankStatementData.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate <= asOfDateObj;
  });

  // Calculate the total balance
  const totalBalance = relevantTransactions.reduce(
    (total, bankStatementData) => {
      return total + bankStatementData.amount;
    },
    0
  );

  return totalBalance;
}

//   - Utilize the Gmail API or any other suitable method to programmatically fetch emails with the specified subject line.
//    - Retrieve the PDF attachments from these emails for parsing.
// As We Know that we already setup for Gmail Auth and get credintials and subject for get specific email

async function createOAuthClient() {
  const credentials = require("./your-credentials.json");
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  try {
    const token = await fs.promises.readFile(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    listMessages(oAuth2Client);
  } catch (err) {
    getNewToken(oAuth2Client);
  }
}

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this URL:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, async (err, token) => {
      if (err)
        return console.error(
          "Error while trying to retrieve the access token",
          err
        );
      oAuth2Client.setCredentials(token);

      // Store the token to disk for later program executions
      try {
        await fs.promises.writeFile(TOKEN_PATH, JSON.stringify(token));
        listMessages(oAuth2Client);
      } catch (err) {
        console.error(err);
      }
    });
  });
}

function listMessages(auth) {
  const gmail = google.gmail({ version: "v1", auth });

  gmail.users.messages.list(
    {
      userId: "me",
      q: "subject:YOUR_SUBJECT_LINE",
    },
    (err, res) => {
      if (err) return console.error("The API returned an error:", err);

      const messages = res.data.messages;
      if (messages.length === 0) {
        console.log("No messages found.");
      } else {
        messages.forEach((message) => {
          getMessage(gmail, message.id);
        });
      }
    }
  );
}

function getMessage(gmail, messageId) {
  gmail.users.messages.get(
    {
      userId: "me",
      id: messageId,
    },
    (err, res) => {
      if (err) return console.error("Error while fetching message:", err);

      const message = res.data;

      if (message.payload && message.payload.parts) {
        message.payload.parts.forEach((part) => {
          if (part.filename && part.filename.endsWith(".pdf")) {
            const body = part.body;
            const data = body.attachmentId
              ? gmail.users.messages.attachments.get({
                  userId: "me",
                  messageId,
                  id: body.attachmentId,
                })
              : body.data;

            const buff = Buffer.from(data, "base64");

            // Do something with the PDF attachment, e.g., save it to a file
            fs.promises
              .writeFile(`${message.subject}.pdf`, buff)
              .then(() => {
                console.log(`Saved ${message.subject}.pdf`);
              })
              .catch((err) => {
                console.error(err);
              });
          }
        });
      }
    }
  );
}

// createOAuthClient();

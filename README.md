# backend-assignment
 Requirements

1. PDF Parsing
   - Write a program to parse PDFs attached to emails received on Gmail.
   - The emails will have varying sender email addresses but will contain a specific subject line indicating that the attached PDF is a bank statement.
   - Extract text, images from PDFs.

2. API Integration
   - Implement APIs that interact with the parsed bank statement data.
   - Implement an API endpoint to retrieve a list of parsed transactions.
   - Implement an API endpoint to search for transactions within a specific date range.
   - Implement an API endpoint to get the total balance as of a specific date.

3. Email Retrieval
   - Utilize the Gmail API or any other suitable method to programmatically fetch emails with the specified subject line.
   - Retrieve the PDF attachments from these emails for parsing.

hello sir i am pankaj kewat MERN stack developer 
so i use nodejs as a backend framework for solve this assignments 
in first question of assignment first i give access of my gmail   to programe  for read all mails than i filter unread massasges and find mails by specific subject and extract pdf from and than extract images and text from pdf using libraries  , using this  method PDF parsing's 3 question are solve 

but i need some token and credintials for access Gmail so below i explain how can we get 
steps are : - 
Set up a Project in the Google Cloud Console
Go to the Google Cloud Console (https://console.cloud.google.com/).
Create a new project or select an existing one.
In the sidebar, go to "APIs & Services" > "Credentials."
 Click the "Create credentials" button and select "OAuth client ID."
 Select "Web application" as the application type.
Add authorized JavaScript origins and redirect URIs. For development, you can use your local host server  as the redirect URI.
Click "Create" to create the OAuth client ID.
Download the JSON file containing your client ID and client secret. You'll use this in your Node.js application.
In the Google Cloud Console, go to "APIs & Services" > "Library."

After solve First Part of assignment 
the second is playing with apis 
so i create demo database which is nosql and based on mongodb 
and create some dummy data which is generaly use in bank statements 
than i utilize apis which are interact with database 

and than Last Question Of assignment is similar with First question so just give access of gmail to programe and than follow steps are done with this programe to solve this question 

use gmail api It provides various methods for accessing Gmail features, including reading and sending emails.
than Use OAuth2 for access gmail 
chacking already have token or not 
than listing massages with specific subject
after listing find that they have pdf files or not i has then extract 

                                                                          THANKYOU SIR 

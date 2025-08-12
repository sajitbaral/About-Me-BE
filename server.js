// Import necessary modules
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000; // Define server port, defaulting to 5000

// Configure CORS to allow requests from specific origins
// Allows your frontend (local or deployed) to communicate with this backend
const allowedOrigins = [
    'http://localhost:3000',   // local frontend
    'https://about-me-fe-git-main-sajit-barals-projects.vercel.app'  // production frontend
];

app.use(cors({
    origin: function(origin, callback){
        // Allow requests with no origin (like Postman, curl)
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

// Enable parsing of JSON request bodies
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Portfolio backend API is running!' });
});

// POST endpoint to handle email sending requests
app.post('/send-email', async (req, res) => {
    // Destructure name, email, and message from the request body
    const { name, email, message } = req.body;

    // Basic input validation: check if email and message are present and not empty
    if (!email || !email.trim() || !message || !message.trim()) {
        return res.status(400).json({ message: 'Email and message cannot be empty.' });
    }

    try {
        // Create a Nodemailer transporter using Gmail service
        // GMAIL_USER and GMAIL_PASS are environment variables
        // GMAIL_PASS should be an App Password, not your regular Gmail password
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER, // Your Gmail address (sender)
                pass: process.env.GMAIL_PASS // Your Gmail App Password
            }
        });

        // Define email options
        const mailOptions = {
            from: process.env.GMAIL_USER, // The actual sending email address from your Gmail account
            to: process.env.RECEIVING_EMAIL || process.env.GMAIL_USER, // Where you want to receive the messages
            subject: `New Contact Message from ${name || 'Anonymous'} - Portfolio Site`, // Email subject
            replyTo: email, // Set the reply-to address to the sender's email for easy response
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        /* Basic inline styles for email client compatibility */
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            width: 100%;
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            border: 1px solid #dddddd;
                        }
                        h3 {
                            color: #3f51b5;
                            border-bottom: 1px solid #eeeeee;
                            padding-bottom: 10px;
                            margin-top: 20px;
                        }
                        p {
                            margin-bottom: 10px;
                        }
                        strong {
                            color: #555555;
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 15px;
                            border-top: 1px solid #eeeeee;
                            font-size: 0.9em;
                            color: #888888;
                            text-align: center;
                        }
                        a {
                            color: #3f51b5;
                            text-decoration: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h3>New Contact Message from Your Portfolio</h3>
                        
                        <p><strong>Name:</strong> ${name || 'Not provided'}</p>
                        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        
                        <h3>Message:</h3>
                        <p>${message}</p>
                        
                        <div class="footer">
                            <p>This message was sent from your portfolio contact form.</p>
                            <p>&copy; ${new Date().getFullYear()} Sajit Baral. All rights reserved.</p> </div>
                    </div>
                </body>
                </html>
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Send success response
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        // Log any errors that occur during email sending
        console.error('Error sending email:', error);
        // Send error response
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
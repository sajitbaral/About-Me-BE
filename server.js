const express = require('express');
const nodemailer = require('nodemailer');
// const path = require('path'); // We don't need 'path' for the backend server
const cors = require('cors'); // <--- ADD THIS LINE: Import the CORS middleware
require('dotenv').config();

const app = express();
// IMPORTANT: Render uses process.env.PORT, which it sets to 10000.
// Locally, it will default to 5000 as per your original code.
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Remove this line: app.use(express.static(path.join(__dirname, 'Public')));
// Vercel will serve your 'Public' frontend folder independently.
// The backend server should only handle API requests.

// CORS Configuration - IMPORTANT!
// For local development: 'http://localhost:5000' (your frontend's local server address)
// For deployment: Your Vercel frontend URL (e.g., 'https://yourprojectname.vercel.app' or 'https://yourname.com.np')
app.use(cors({
    origin: 'https://about-me-4fo9hh7ly-sajit-barals-projects.vercel.app/' 
}));


// POST route to receive contact form data and send email
// Changed endpoint from '/send' to '/send-email' for consistency with script.js discussions
app.post('/send-email', async (req, res) => {
    const { name, email, message } = req.body;

    // Basic validation
    if (!email || !email.trim() || !message || !message.trim()) {
        return res.status(400).json({ message: 'Email and message cannot be empty.' }); // Changed 'error' to 'message' for consistency with frontend
    }

    try {
        // Setup nodemailer transporter (Gmail SMTP)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER, // your gmail
                pass: process.env.GMAIL_PASS // app password
            }
        });

        // Email content
        const mailOptions = {
            from: email, // This will show the sender's email in the 'From' field of the email client
            to: process.env.RECEIVING_EMAIL || process.env.GMAIL_USER, // Use RECEIVING_EMAIL if set, otherwise GMAIL_USER
            subject: `New Contact Message from ${name || 'Anonymous'} - Portfolio Site`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
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
                            <p>&copy; ${new Date().getFullYear()} Your Name. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Message sent successfully!' }); // Changed 'success' to 'message' for consistency with frontend
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send message. Please try again later.' }); // Changed 'error' to 'message' for consistency with frontend
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
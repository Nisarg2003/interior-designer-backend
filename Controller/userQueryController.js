import nodemailer from "nodemailer";
import userQueryModel from "../Model/userQueryModel.js";
import dotenv from 'dotenv'


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendMail = async (subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to:'21csnis006@ldce.ac.in',
            subject,
            text,
        });
        console.log("Email sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export const createUserQuery = async(req,res) => {
    
    try {
        const {contactNo, emailId, postId} = req.body;

        if (!emailId) {
            return res.status(400).json({ message: "Email ID is required" });
        }
        const userQuery = new userQueryModel({
            contactNo,
            emailId,
            post: postId,
            query:req.body.query||"Want to Contact your firm",

        });
        await userQuery.save();

        const subject = "New Query on Your Site";
        const text = `
            You have received a new query through your website:
            
            Contact No: ${contactNo}
            Email ID: ${emailId}
            Query: ${req.body.query || "Want to Contact your firm"}
            
            Please log in to your account to view the details.
        `;
        try{
            await sendMail(subject,text);
        }catch (emailError) {
            return res.status(500).json({ message: "Query submitted, but failed to send email."});
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error });
    }
}
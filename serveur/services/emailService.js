import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export const envoyerEmail = async (to, subject, templatePath, variables) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let html = fs.readFileSync(templatePath, "utf8");

    Object.keys(variables).forEach((key) => {
        html = html.replaceAll(`{{${key}}}`, variables[key]);
    });

    await transporter.sendMail({
        from: `"Mon App" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });
};

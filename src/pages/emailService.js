


import emailjs from 'emailjs-com';

const sendEmail = async (emailParams) => {
    try {
        const response = await emailjs.send(
            emailParams.service_id,      // Your EmailJS service ID
            emailParams.template_id,     // Your EmailJS template ID
            {
                to_email: emailParams.to_email,
                subject: emailParams.subject,
                coursename: emailParams.coursename,
                message: emailParams.message

            },
            emailParams.user_id          // Your EmailJS user ID
        );
        console.log('Email sent successfully:', response);
        return response;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

export default sendEmail;
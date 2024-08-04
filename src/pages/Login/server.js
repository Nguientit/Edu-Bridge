const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Vui lòng cung cấp địa chỉ email' });
  }

  // Tạo mã xác nhận
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Thiết lập transporter cho Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Sử dụng dịch vụ email của bạn
    auth: {
      user: 'your-email@gmail.com', // Thay bằng email của bạn
      pass: 'your-email-password', // Thay bằng mật khẩu email của bạn
    },
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Mã xác nhận đặt lại mật khẩu',
    text: `Mã xác nhận của bạn là ${verificationCode}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Mã xác nhận đã được gửi tới email của bạn.' });
  } catch (error) {
    res.status(500).json({ message: 'Gửi mã xác nhận thất bại. Vui lòng thử lại.' });
  }
});

app.listen(port, () => {
  console.log(`Máy chủ đang chạy tại http://localhost:${port}`);
});

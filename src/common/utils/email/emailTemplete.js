export const emailTemplate = (otp) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OTP Verification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      font-family: Arial, sans-serif;
    }
    .container {
      max-width: 500px;
      margin: 40px auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .otp-box {
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 6px;
      margin: 20px 0;
      color: #333;
    }
    .footer {
      font-size: 12px;
      color: #888;
      margin-top: 20px;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      margin-top: 15px;
      background-color: #4CAF50;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
    }
  </style>
</head>
<body>

  <div class="container">
    <h2>Verify Your Account</h2>
    <p>Your One-Time Password (OTP) is:</p>

    <div class="otp-box">
      ${otp}
    </div>

    <p>This code is valid for 5 minutes. Please do not share it with anyone.</p>

    <a href="#" class="btn">Verify Now</a>

    <div class="footer">
      <p>If you didn’t request this, you can ignore this email.</p>
    </div>
  </div>

</body>
</html>
`}
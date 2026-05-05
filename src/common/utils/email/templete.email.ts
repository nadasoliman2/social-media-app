export const emailTemplete = ({ title, otp }: { title: string; otp: number }): string => {
  return `
  <div style="font-family:Arial, sans-serif; background:#f4f4f4; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:10px; text-align:center;">
      
      <h2 style="color:#333;">
        ${title}
      </h2>

      <p style="font-size:16px; color:#555;">
        Use the following OTP to complete your request:
      </p>

      <div style="
        font-size:30px;
        letter-spacing:6px;
        font-weight:bold;
        background:#f2f2f2;
        padding:15px;
        border-radius:8px;
        margin:20px 0;
        display:inline-block;
      ">
        ${otp}
      </div>

      <p style="font-size:14px; color:#999;">
        This OTP is valid for a limited time.
      </p>

    </div>
  </div>
  `;
};
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset Password - Jejak Liqo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #4DABFF 0%, #2563eb 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f8fafc;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .button {
            display: inline-block;
            background: #4DABFF;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reset Password</h1>
        <p>Jejak Liqo - Sistem Shaf Pembangunan</p>
    </div>
    
    <div class="content">
        <p>Halo {{ $name }},</p>
        
        <p>Kami menerima permintaan untuk mereset password akun Anda di sistem Jejak Liqo.</p>
        
        <p>Klik tombol di bawah ini untuk mereset password Anda:</p>
        
        <p style="text-align: center;">
            <a href="{{ $reset_url }}" class="button">Reset Password</a>
        </p>
        
        <p>Atau salin dan tempel link berikut di browser Anda:</p>
        <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px;">
            {{ $reset_url }}
        </p>
        
        <p><strong>Catatan penting:</strong></p>
        <ul>
            <li>Link ini akan kedaluwarsa dalam 1 jam</li>
            <li>Jika Anda tidak meminta reset password, abaikan email ini</li>
            <li>Jangan bagikan link ini kepada siapa pun</li>
        </ul>
        
        <p>Jika Anda mengalami kesulitan, hubungi administrator sistem.</p>
        
        <p>Terima kasih,<br>
        Tim Jejak Liqo</p>
    </div>
    
    <div class="footer">
        <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
        <p>&copy; {{ date('Y') }} Jejak Liqo. All rights reserved.</p>
    </div>
</body>
</html>
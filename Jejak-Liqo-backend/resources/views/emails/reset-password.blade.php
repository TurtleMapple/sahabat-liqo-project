<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Jejak Liqo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1f2937;
        }
        
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #4b5563;
            line-height: 1.7;
        }
        
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        
        .reset-button:hover {
            transform: translateY(-2px);
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .alternative-link {
            background-color: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 4px solid #3b82f6;
        }
        
        .alternative-link p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 10px;
        }
        
        .alternative-link a {
            color: #3b82f6;
            word-break: break-all;
            text-decoration: none;
        }
        
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        
        .warning-icon {
            color: #f59e0b;
            font-size: 20px;
            margin-right: 10px;
        }
        
        .warning p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }
        
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 10px;
        }
        
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
        
        .social-links {
            margin-top: 20px;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #6b7280;
            text-decoration: none;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 30px 20px;
            }
            
            .reset-button {
                display: block;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🕌 Jejak Liqo</div>
            <div class="subtitle">Platform Manajemen Mentoring</div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Halo{{ $userName ? ', ' . $userName : '' }}!
            </div>
            
            <div class="message">
                Kami menerima permintaan untuk mereset password akun Jejak Liqo Anda. 
                Jika Anda yang melakukan permintaan ini, silakan klik tombol di bawah untuk membuat password baru.
            </div>
            
            <div class="button-container">
                <a href="{{ $resetUrl }}" class="reset-button">
                    🔐 Reset Password Saya
                </a>
            </div>
            
            <div class="alternative-link">
                <p><strong>Tidak bisa klik tombol di atas?</strong></p>
                <p>Salin dan tempel link berikut ke browser Anda:</p>
                <a href="{{ $resetUrl }}">{{ $resetUrl }}</a>
            </div>
            
            <div class="warning">
                <p>
                    <span class="warning-icon">⚠️</span>
                    <strong>Penting:</strong> Link ini hanya berlaku selama 1 jam dan hanya bisa digunakan sekali. 
                    Jika Anda tidak meminta reset password, abaikan email ini.
                </p>
            </div>
            
            <div class="message">
                Jika Anda mengalami kesulitan atau tidak meminta reset password ini, 
                silakan hubungi tim support kami segera.
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>Tim Jejak Liqo</strong></p>
            <p>Platform Manajemen Mentoring Islami</p>
            <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
            
            <div class="social-links">
                <a href="#">📧 Support</a>
                <a href="#">🌐 Website</a>
                <a href="#">📱 WhatsApp</a>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                © {{ date('Y') }} Jejak Liqo. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Mail;

try {
    Mail::raw('This is a test email from your Laboratory System. If you receive this, your email configuration is working correctly!', function ($message) {
        $message->to('mattpogibeltran12@gmail.com')
                ->subject('Test Email - Laboratory System');
    });
    
    echo "\n✅ Email sent successfully!\n";
    echo "Check your inbox at: mattpogibeltran12@gmail.com\n";
    echo "Also check spam/junk folder if not in inbox.\n\n";
    
} catch (\Exception $e) {
    echo "\n❌ Error sending email:\n";
    echo $e->getMessage() . "\n\n";
    echo "Stack trace:\n";
    echo $e->getTraceAsString() . "\n\n";
}

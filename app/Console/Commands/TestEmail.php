<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'email:test {email}';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Send a test email to verify Brevo SMTP configuration';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    $email = $this->argument('email');

    $this->info("Attempting to send test email to: {$email}");
    $this->info("Using Brevo SMTP configuration...");
    $this->newLine();

    try {
      Mail::raw('This is a test email from BP Diagnostic Laboratory. If you receive this, your Brevo SMTP configuration is working correctly!', function ($message) use ($email) {
        $message->to($email)
          ->subject('BP Diagnostic - Test Email');
      });

      $this->newLine();
      $this->info('✓ Test email sent successfully!');
      $this->info("✓ Check {$email} for the test message.");
      $this->newLine();
      $this->comment('Configuration used:');
      $this->line('  MAIL_MAILER: ' . config('mail.default'));
      $this->line('  MAIL_HOST: ' . config('mail.mailers.smtp.host'));
      $this->line('  MAIL_PORT: ' . config('mail.mailers.smtp.port'));
      $this->line('  MAIL_USERNAME: ' . config('mail.mailers.smtp.username'));
      $this->line('  MAIL_FROM: ' . config('mail.from.address'));

      return Command::SUCCESS;
    } catch (\Exception $e) {
      $this->newLine();
      $this->error('✗ Failed to send test email!');
      $this->newLine();
      $this->error('Error: ' . $e->getMessage());
      $this->newLine();
      $this->comment('Please check your Brevo SMTP credentials in .env file:');
      $this->line('  - MAIL_USERNAME should be your SMTP login');
      $this->line('  - MAIL_PASSWORD should be your SMTP password (not API key)');
      $this->line('  - MAIL_FROM_ADDRESS should be a verified sender email');

      return Command::FAILURE;
    }
  }
}

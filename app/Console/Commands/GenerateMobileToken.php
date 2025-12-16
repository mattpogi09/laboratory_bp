<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class GenerateMobileToken extends Command
{
    protected $signature = 'mobile:generate-token {user_id=1}';
    protected $description = 'Generate a new mobile access token for a user';

    public function handle()
    {
        $userId = $this->argument('user_id');
        $user = User::find($userId);

        if (!$user) {
            $this->error("User with ID {$userId} not found");
            return 1;
        }

        // Delete existing tokens for this user
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('mobile-admin');

        $this->info('Token generated successfully!');
        $this->line('');
        $this->line('Token: ' . $token->plainTextToken);
        $this->line('');
        $this->line('Use this token in your mobile app Authorization header as:');
        $this->line('Bearer ' . $token->plainTextToken);

        return 0;
    }
}

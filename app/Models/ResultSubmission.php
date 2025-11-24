<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResultSubmission extends Model
{
  use HasFactory;

  protected $fillable = [
    'transaction_id',
    'sent_by',
    'sent_at',
    'documents',
  ];

  protected $casts = [
    'sent_at' => 'datetime',
    'documents' => 'array',
  ];

  /**
   * Get the transaction that this result submission belongs to
   */
  public function transaction()
  {
    return $this->belongsTo(Transaction::class);
  }

  /**
   * Get the user who sent the results
   */
  public function sentBy()
  {
    return $this->belongsTo(User::class, 'sent_by');
  }
}

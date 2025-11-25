<?php

namespace App\Mail;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class SendResultsMail extends Mailable
{
  use Queueable, SerializesModels;

  /**
   * Create a new message instance.
   */
  public function __construct(
    public Transaction $transaction,
    public array $documentPaths = []
  ) {
  }

  /**
   * Get the message envelope.
   */
  public function envelope(): Envelope
  {
    return new Envelope(
      subject: 'Your Lab Test Results - BP Diagnostic',
    );
  }

  /**
   * Get the message content definition.
   */
  public function content(): Content
  {
    return new Content(
      view: 'emails.send-results',
    );
  }

  /**
   * Get the attachments for the message.
   *
   * @return array<int, \Illuminate\Mail\Mailables\Attachment>
   */
  public function attachments(): array
  {
    $attachments = [];

    try {
      // Generate encrypted PDF with test results
      $patient = $this->transaction->patient;
      $patientLastName = $patient
        ? strtoupper($patient->last_name)
        : strtoupper(explode(' ', $this->transaction->patient_full_name)[1] ?? 'PATIENT');

      // Generate PDF (without embedded images to avoid encoding issues)
      $pdf = Pdf::loadView('pdf.test-results', [
        'transaction' => $this->transaction,
        'documentPaths' => [] // Don't embed images in PDF to avoid errors
      ]);

      // Set PDF options
      $pdf->setPaper('a4', 'portrait');

      // Set encryption (password protection)
      $pdf->getDomPDF()->getCanvas()->get_cpdf()->setEncryption(
        $patientLastName,  // User password (patient's surname)
        $patientLastName,  // Owner password (same)
        ['print', 'copy']  // Permissions
      );

      // Save temporarily and attach
      $pdfPath = storage_path('app/temp/results_' . $this->transaction->transaction_number . '.pdf');

      // Create temp directory if it doesn't exist
      if (!file_exists(storage_path('app/temp'))) {
        mkdir(storage_path('app/temp'), 0755, true);
      }

      $pdf->save($pdfPath);

      $attachments[] = Attachment::fromPath($pdfPath)
        ->as('Lab_Results_' . $this->transaction->transaction_number . '.pdf')
        ->withMime('application/pdf');

      // Attach uploaded images separately as additional attachments
      foreach ($this->documentPaths as $document) {
        $attachments[] = Attachment::fromStorageDisk('public', $document['path'])
          ->as($document['name']);
      }
    } catch (\Exception $e) {
      \Log::error('Failed to generate PDF for results email', [
        'transaction_id' => $this->transaction->id,
        'error' => $e->getMessage()
      ]);

      // If PDF generation fails, at least attach the uploaded documents
      foreach ($this->documentPaths as $document) {
        try {
          $attachments[] = Attachment::fromStorageDisk('public', $document['path'])
            ->as($document['name']);
        } catch (\Exception $docError) {
          \Log::error('Failed to attach document', [
            'document' => $document['name'],
            'error' => $docError->getMessage()
          ]);
        }
      }
    }

    return $attachments;
  }
}

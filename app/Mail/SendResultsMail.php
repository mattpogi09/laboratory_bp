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
      // Get patient's last name for password
      $patient = $this->transaction->patient;
      $patientLastName = $patient
        ? strtoupper($patient->last_name)
        : strtoupper(explode(' ', $this->transaction->patient_full_name)[1] ?? 'PATIENT');

      // Create temp directory if it doesn't exist
      if (!file_exists(storage_path('app/temp'))) {
        mkdir(storage_path('app/temp'), 0755, true);
      }

      // ============================================
      // PDF 1: Test Results (values and remarks)
      // ============================================
      $resultsPdf = Pdf::loadView('pdf.test-results', [
        'transaction' => $this->transaction,
        'documentPaths' => [] // No images embedded
      ]);

      $resultsPdf->setPaper('a4', 'portrait');

      // Encrypt with patient's surname
      $resultsPdf->getDomPDF()->getCanvas()->get_cpdf()->setEncryption(
        $patientLastName,  // User password
        $patientLastName,  // Owner password
        ['print', 'copy']  // Permissions
      );

      $resultsPdfPath = storage_path('app/temp/results_' . $this->transaction->transaction_number . '.pdf');
      $resultsPdf->save($resultsPdfPath);

      $attachments[] = Attachment::fromPath($resultsPdfPath)
        ->as('Lab_Results_' . $this->transaction->transaction_number . '.pdf')
        ->withMime('application/pdf');

      // ============================================
      // PDF 2: Result Images (uploaded documents)
      // ============================================
      if (!empty($this->documentPaths)) {
        \Log::info('Generating images PDF', [
          'document_count' => count($this->documentPaths),
          'documents' => $this->documentPaths
        ]);

        $imagesPdf = Pdf::loadView('pdf.result-images', [
          'transaction' => $this->transaction,
          'documentPaths' => $this->documentPaths
        ]);

        $imagesPdf->setPaper('a4', 'portrait');

        // Encrypt with patient's surname
        $imagesPdf->getDomPDF()->getCanvas()->get_cpdf()->setEncryption(
          $patientLastName,  // User password
          $patientLastName,  // Owner password
          ['print', 'copy']  // Permissions
        );

        $imagesPdfPath = storage_path('app/temp/images_' . $this->transaction->transaction_number . '.pdf');
        $imagesPdf->save($imagesPdfPath);

        \Log::info('Images PDF generated successfully', [
          'path' => $imagesPdfPath,
          'file_exists' => file_exists($imagesPdfPath),
          'file_size' => file_exists($imagesPdfPath) ? filesize($imagesPdfPath) : 0
        ]);

        $attachments[] = Attachment::fromPath($imagesPdfPath)
          ->as('Lab_Result_Images_' . $this->transaction->transaction_number . '.pdf')
          ->withMime('application/pdf');
      }

    } catch (\Exception $e) {
      \Log::error('Failed to generate PDF for results email', [
        'transaction_id' => $this->transaction->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      // If PDF generation fails, attach uploaded documents as fallback
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

<?php

use App\Models\Patient;

$patient = Patient::first();

if (!$patient) {
  echo "No patients found\n";
  exit;
}

echo "ID: " . $patient->id . "\n";
echo "First Name: " . $patient->first_name . "\n";
echo "Middle Name: " . ($patient->middle_name ?? 'NULL') . "\n";
echo "Last Name: " . $patient->last_name . "\n";
echo "Full Name: " . $patient->full_name . "\n";

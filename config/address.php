<?php

use Yajra\Address\Entities\Barangay;
use Yajra\Address\Entities\City;
use Yajra\Address\Entities\Province;
use Yajra\Address\Entities\Region;

return [

    /*
     * --------------------------------------------------------------------------
     * API Route Prefix
     * --------------------------------------------------------------------------
     */
    'prefix' => '/api/address',

    /*
     * --------------------------------------------------------------------------
     * API Route Middleware
     * --------------------------------------------------------------------------
     * Using api middleware with sanctum for mobile API token authentication
     */
    'middleware' => [
        'api',
        'auth:sanctum',
    ],

    /*
     * --------------------------------------------------------------------------
     * PSA Official PSGC publication
     * --------------------------------------------------------------------------
     * @see https://psa.gov.ph/classification/psgc/
     */
    'publication' => [
        'path' => base_path('vendor/yajra/laravel-address/database/seeders/publication/PSGC-4Q-2024-Publication-Datafile.xlsx'),
        'sheet' => 4,
    ],

    /*
     * --------------------------------------------------------------------------
     * Models mapping
     * --------------------------------------------------------------------------
     */
    'models' => [
        'region' => Region::class,
        'province' => Province::class,
        'city' => City::class,
        'barangay' => Barangay::class,
    ],
];

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
     * Set to null to disable automatic route registration since we define
     * our own routes in routes/api.php and routes/web.php
     */
    'prefix' => null,

    /*
     * --------------------------------------------------------------------------
     * API Route Middleware
     * --------------------------------------------------------------------------
     * Empty array disables automatic route registration
     * We use our own routes in routes/api.php and routes/web.php instead
     */
    'middleware' => ['__disabled__'],

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

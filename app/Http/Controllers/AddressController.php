<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Yajra\Address\Entities\Region;
use Yajra\Address\Entities\Province;
use Yajra\Address\Entities\City;
use Yajra\Address\Entities\Barangay;

class AddressController extends Controller
{
    /**
     * Get all regions
     */
    public function getRegions(Request $request)
    {
        // Log for debugging
        \Log::info('AddressController::getRegions called', [
            'user' => $request->user()?->id,
            'has_auth' => $request->user() !== null,
            'headers' => $request->headers->all(),
        ]);
        
        $regions = Region::orderBy('name')->get(['id', 'name', 'code', 'region_id']);
        
        return response()->json($regions);
    }

    /**
     * Get provinces by region_id (PSGC code)
     */
    public function getProvinces($regionId)
    {
        // regionId is the PSGC code string like "09" for Region IX
        $provinces = Province::where('region_id', $regionId)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'region_id', 'province_id']);
        
        return response()->json($provinces);
    }

    /**
     * Get cities by province_id (PSGC code)
     */
    public function getCities($provinceId)
    {
        // provinceId is the PSGC code string like "09072" for Zamboanga del Norte
        $cities = City::where('province_id', $provinceId)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'province_id', 'city_id']);
        
        return response()->json($cities);
    }

    /**
     * Get barangays by city_id (PSGC code)
     */
    public function getBarangays($cityId)
    {
        // cityId is the PSGC code string like "097201" for specific city
        $barangays = Barangay::where('city_id', $cityId)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'city_id']);
        
        return response()->json($barangays);
    }

    /**
     * Get address details by PSGC codes
     */
    public function getAddressDetails(Request $request)
    {
        $data = [];
        
        if ($request->region_id) {
            $data['region'] = Region::where('region_id', $request->region_id)->first(['id', 'name', 'code', 'region_id']);
        }
        
        if ($request->province_id) {
            $data['province'] = Province::where('province_id', $request->province_id)->first(['id', 'name', 'code', 'province_id']);
        }
        
        if ($request->city_id) {
            $data['city'] = City::where('city_id', $request->city_id)->first(['id', 'name', 'code', 'city_id']);
        }
        
        if ($request->barangay_code) {
            $data['barangay'] = Barangay::where('code', $request->barangay_code)->first(['id', 'name', 'code']);
        }
        
        return response()->json($data);
    }
}

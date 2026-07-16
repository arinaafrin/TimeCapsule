<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CityResource;
use App\Models\City;
use Illuminate\Http\Request;

class CityController extends Controller
{
    public function index(Request $request)
    {
        $query = City::query();

        if ($search = $request->query('search')) {
            $query->where('name', 'ilike', "%{$search}%");
        }

        $cities = $query->orderBy('name')->limit(50)->get();

        return CityResource::collection($cities);
    }

    public function show(string $id)
    {
        $city = City::findOrFail($id);

        return new CityResource($city);
    }
}

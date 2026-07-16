<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class DemoCitiesSeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            ['name' => 'Paris', 'country' => 'France', 'latitude' => 48.8566, 'longitude' => 2.3522, 'google_place_id' => 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ'],
            ['name' => 'Rome', 'country' => 'Italy', 'latitude' => 41.9028, 'longitude' => 12.4964, 'google_place_id' => 'ChIJu46S-ZZhLxMROG5lkwZ3D7k'],
            ['name' => 'Cairo', 'country' => 'Egypt', 'latitude' => 30.0444, 'longitude' => 31.2357, 'google_place_id' => 'ChIJx8mHsWlaWBQR2diySWJn2ZM'],
            ['name' => 'Kyoto', 'country' => 'Japan', 'latitude' => 35.0116, 'longitude' => 135.7681, 'google_place_id' => 'ChIJqcJIvC7lAWARvUcyJCA9yzM'],
            ['name' => 'New York City', 'country' => 'United States', 'latitude' => 40.7128, 'longitude' => -74.0060, 'google_place_id' => 'ChIJOwg_06VPwokRYv534QaPC8g'],
            ['name' => 'Istanbul', 'country' => 'Turkey', 'latitude' => 41.0082, 'longitude' => 28.9784, 'google_place_id' => 'ChIJawx4jHfNyhQR-cvNsN5-Ycc'],
        ];

        foreach ($cities as $city) {
            City::updateOrCreate(['google_place_id' => $city['google_place_id']], $city);
        }
    }
}

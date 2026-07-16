<?php

namespace App\Services\Maps;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class GoogleMapsService
{
    protected Client $http;

    public function __construct(?Client $http = null)
    {
        $this->http = $http ?? new Client(['base_uri' => 'https://maps.googleapis.com/maps/api/']);
    }

    /**
     * Search Google Places for a city by free-text query.
     * Used by partner/admin flows to look up and import new cities —
     * the public /cities endpoint searches our own indexed table instead,
     * so this never runs on the hot visitor path.
     *
     * @return array<int, array<string, mixed>>
     */
    public function searchPlaces(string $query): array
    {
        $apiKey = config('services.google_maps.server_api_key');

        if (blank($apiKey)) {
            Log::warning('GoogleMapsService: GOOGLE_MAPS_SERVER_API_KEY is not configured.');

            return [];
        }

        try {
            $response = $this->http->get('place/textsearch/json', [
                'query' => [
                    'query' => $query,
                    'type' => 'locality',
                    'key' => $apiKey,
                ],
            ]);

            $body = json_decode($response->getBody()->getContents(), true);

            return $body['results'] ?? [];
        } catch (\Throwable $e) {
            Log::error('GoogleMapsService::searchPlaces failed', ['message' => $e->getMessage()]);

            return [];
        }
    }

    public function buildMapsLink(float $latitude, float $longitude): string
    {
        return "https://www.google.com/maps/search/?api=1&query={$latitude},{$longitude}";
    }
}

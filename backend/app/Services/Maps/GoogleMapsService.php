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

    /**
     * Resolve a partner-supplied Google Maps link into coordinates (and,
     * where possible, a human-readable place name), so AI story generation
     * can be grounded in the actual pinned location rather than just the
     * city name.
     *
     * Supports:
     * - Standard browser address-bar links containing "@lat,lng"
     * - Share links containing "?q=lat,lng"
     * - Our own generated "?api=1&query=lat,lng" links (see buildMapsLink())
     * - Shortened links (maps.app.goo.gl, goo.gl/maps/...) by following the
     *   HTTP redirect to find coordinates in the final destination URL
     *
     * Returns null if no coordinates could be extracted at all (dead link,
     * unrecognized format, or a redirect target with no encoded location).
     *
     * @return array{latitude: float, longitude: float, place_name: ?string}|null
     */
    public function resolveLink(string $url): ?array
    {
        $coordinates = $this->extractCoordinates($url);

        if ($coordinates === null) {
            $finalUrl = $this->followRedirect($url);

            if ($finalUrl !== null) {
                $coordinates = $this->extractCoordinates($finalUrl);
            }
        }

        if ($coordinates === null) {
            return null;
        }

        return [
            'latitude' => $coordinates[0],
            'longitude' => $coordinates[1],
            'place_name' => $this->reverseGeocode($coordinates[0], $coordinates[1]),
        ];
    }

    /**
     * @return array{0: float, 1: float}|null
     */
    protected function extractCoordinates(string $url): ?array
    {
        $patterns = [
            '/@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/',
            '/[?&]q=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/',
            '/[?&]query=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return [(float) $matches[1], (float) $matches[2]];
            }
        }

        return null;
    }

    /**
     * Follow a (likely shortened) link's HTTP redirect chain and return the
     * final destination URL, or null if the request fails or there was no
     * redirect history to inspect.
     */
    protected function followRedirect(string $url): ?string
    {
        try {
            $response = $this->http->get($url, [
                'allow_redirects' => ['track_redirects' => true, 'max' => 5],
            ]);

            $history = $response->getHeader('X-Guzzle-Redirect-History');

            return empty($history) ? null : end($history);
        } catch (\Throwable $e) {
            Log::error('GoogleMapsService::followRedirect failed', ['message' => $e->getMessage()]);

            return null;
        }
    }

    protected function reverseGeocode(float $latitude, float $longitude): ?string
    {
        $apiKey = config('services.google_maps.server_api_key');

        if (blank($apiKey)) {
            return null;
        }

        try {
            $response = $this->http->get('geocode/json', [
                'query' => [
                    'latlng' => "{$latitude},{$longitude}",
                    'key' => $apiKey,
                ],
            ]);

            $body = json_decode($response->getBody()->getContents(), true);

            return $body['results'][0]['formatted_address'] ?? null;
        } catch (\Throwable $e) {
            Log::error('GoogleMapsService::reverseGeocode failed', ['message' => $e->getMessage()]);

            return null;
        }
    }

    public function buildMapsLink(float $latitude, float $longitude): string
    {
        return "https://www.google.com/maps/search/?api=1&query={$latitude},{$longitude}";
    }
}

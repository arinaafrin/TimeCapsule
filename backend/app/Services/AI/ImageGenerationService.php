<?php

namespace App\Services\AI;

use App\Models\Experience;
use App\Services\AI\Contracts\ImageGeneratorInterface;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class ImageGenerationService implements ImageGeneratorInterface
{
    protected Client $http;

    public function __construct(?Client $http = null)
    {
        $this->http = $http ?? new Client(['base_uri' => 'https://api.stability.ai/']);
    }

    public function generatePanorama(Experience $experience): array
    {
        $apiKey = config('services.ai_image.api_key');

        if (blank($apiKey)) {
            throw new RuntimeException('AI_IMAGE_API_KEY is not configured.');
        }

        $city = $experience->city;
        $prompt = $this->buildPrompt($city->name, $experience->year, $experience->era_label);

        try {
            $response = $this->http->post('v2beta/stable-image/generate/core', [
                'headers' => [
                    'Authorization' => "Bearer {$apiKey}",
                    'Accept' => 'image/*',
                ],
                'multipart' => [
                    ['name' => 'prompt', 'contents' => $prompt],
                    ['name' => 'aspect_ratio', 'contents' => '21:9'],
                    ['name' => 'output_format', 'contents' => 'jpeg'],
                ],
            ]);

            return [
                'binary' => (string) $response->getBody(),
                'content_type' => $response->getHeaderLine('Content-Type') ?: 'image/jpeg',
            ];
        } catch (\Throwable $e) {
            Log::error('ImageGenerationService::generatePanorama failed', ['message' => $e->getMessage()]);
            throw $e;
        }
    }

    protected function buildPrompt(string $cityName, int $year, ?string $eraLabel): string
    {
        // Security: same rationale as StoryGenerationService::sanitizeForPrompt
        // — cityName/eraLabel are partner-supplied and get sanitized before
        // being interpolated into a prompt sent to a third-party image API.
        $cityName = $this->sanitizeForPrompt($cityName);
        $eraContext = $eraLabel ? ' during the '.$this->sanitizeForPrompt($eraLabel).' period' : '';

        return "A photorealistic, historically accurate wide-angle panoramic view of {$cityName} "
            ."in the year {$year}{$eraContext}. Ground-level perspective as if standing in a public "
            .'square or street, natural lighting consistent with the period, no modern anachronisms, '
            .'no text or watermarks, suitable for a 360-degree panoramic photo sphere.';
    }

    protected function sanitizeForPrompt(string $value): string
    {
        $value = str_replace(['<', '>'], ['‹', '›'], $value);

        return trim(preg_replace('/\s+/', ' ', $value));
    }
}

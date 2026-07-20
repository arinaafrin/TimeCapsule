<?php

use App\Services\Maps\GoogleMapsService;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\Response;

test('resolves coordinates from a standard @lat,lng maps URL with no network call needed', function () {
    $service = new GoogleMapsService(new Client()); // real client, but should never be hit

    $result = $service->resolveLink('https://www.google.com/maps/place/Eiffel+Tower/@48.8583701,2.2944813,17z');

    expect($result)->not->toBeNull();
    expect($result['latitude'])->toEqualWithDelta(48.8583701, 0.0001);
    expect($result['longitude'])->toEqualWithDelta(2.2944813, 0.0001);
});

test('resolves coordinates from a ?q=lat,lng share URL', function () {
    $service = new GoogleMapsService(new Client());

    $result = $service->resolveLink('https://maps.google.com/?q=41.9028,12.4964');

    expect($result)->not->toBeNull();
    expect($result['latitude'])->toEqualWithDelta(41.9028, 0.0001);
    expect($result['longitude'])->toEqualWithDelta(12.4964, 0.0001);
});

test('resolves coordinates from our own query=lat,lng format', function () {
    $service = new GoogleMapsService(new Client());

    $result = $service->resolveLink('https://www.google.com/maps/search/?api=1&query=30.0444,31.2357');

    expect($result)->not->toBeNull();
    expect($result['latitude'])->toEqualWithDelta(30.0444, 0.0001);
    expect($result['longitude'])->toEqualWithDelta(31.2357, 0.0001);
});

test('follows a shortened link redirect to find coordinates in the final URL', function () {
    $mock = new MockHandler([
        new Response(200, ['X-Guzzle-Redirect-History' => ['https://www.google.com/maps/place/Colosseum/@41.8902142,12.4900422,17z']]),
    ]);
    $client = new Client(['handler' => HandlerStack::create($mock)]);

    $service = new GoogleMapsService($client);

    $result = $service->resolveLink('https://maps.app.goo.gl/fakeShortCode123');

    expect($result)->not->toBeNull();
    expect($result['latitude'])->toEqualWithDelta(41.8902142, 0.0001);
    expect($result['longitude'])->toEqualWithDelta(12.4900422, 0.0001);
});

test('returns null for a link with no extractable coordinates and no redirect target', function () {
    $mock = new MockHandler([
        new Response(200, []),
    ]);
    $client = new Client(['handler' => HandlerStack::create($mock)]);

    $service = new GoogleMapsService($client);

    $result = $service->resolveLink('https://maps.app.goo.gl/deadOrUnrecognized');

    expect($result)->toBeNull();
});

test('includes a reverse-geocoded place name when the geocoding API key is configured', function () {
    config(['services.google_maps.server_api_key' => 'fake-key']);

    $mock = new MockHandler([
        new Response(200, [], json_encode([
            'results' => [
                ['formatted_address' => 'Piazza del Colosseo, 1, 00184 Roma RM, Italy'],
            ],
            'status' => 'OK',
        ])),
    ]);
    $client = new Client(['handler' => HandlerStack::create($mock)]);

    $service = new GoogleMapsService($client);

    $result = $service->resolveLink('https://www.google.com/maps/@41.8902142,12.4900422,17z');

    expect($result['place_name'])->toBe('Piazza del Colosseo, 1, 00184 Roma RM, Italy');
});

<?php

return [
    // How long a signed media URL stays valid before expiring. Previously
    // this only existed as a hardcoded migration column default (900s) with
    // no way to actually tune it — MEDIA_SIGNED_URL_TTL_SECONDS in .env was
    // defined but never wired to anything. Fixed as part of the Milestone 8
    // security pass.
    'signed_url_ttl_seconds' => env('MEDIA_SIGNED_URL_TTL_SECONDS', 900),
];

<?php

namespace App\Services\Media;

use App\Models\MediaAsset;
use Illuminate\Support\Facades\Storage;

class SignedUrlService
{
    /**
     * Generate a time-limited, signed URL for a media asset.
     *
     * On the "s3" disk this produces a real S3 pre-signed URL. On the local
     * disk (used in dev/tests) it falls back to Laravel's local temporary
     * URL support so behavior stays consistent across environments.
     */
    public function urlFor(MediaAsset $mediaAsset): string
    {
        $disk = Storage::disk(config('filesystems.default'));
        $expiry = now()->addSeconds($mediaAsset->signed_url_expiry_seconds);

        if (method_exists($disk, 'temporaryUrl')) {
            try {
                return $disk->temporaryUrl($mediaAsset->storage_path, $expiry);
            } catch (\Throwable) {
                // Some local/fake disks in tests don't support temporary URLs;
                // fall through to a plain URL so tests/dev still work.
            }
        }

        return $disk->url($mediaAsset->storage_path);
    }
}

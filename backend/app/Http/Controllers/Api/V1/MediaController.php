<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadMediaRequest;
use App\Http\Resources\MediaAssetResource;
use App\Jobs\GenerateMediaJob;
use App\Models\AiGenerationJob;
use App\Models\Experience;
use App\Models\MediaAsset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function index(Experience $experience)
    {
        $assets = $experience->mediaAssets()->orderByDesc('created_at')->get();

        return MediaAssetResource::collection($assets);
    }

    public function store(UploadMediaRequest $request, Experience $experience)
    {
        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $path = "media/experiences/{$experience->id}/".Str::uuid().".{$extension}";

        Storage::disk(config('filesystems.default'))->put($path, file_get_contents($file->getRealPath()));

        $asset = MediaAsset::create([
            'experience_id' => $experience->id,
            'type' => $request->validated('type'),
            'storage_path' => $path,
            'signed_url_expiry_seconds' => config('media.signed_url_ttl_seconds'),
            'source_type' => $request->validated('source_type'),
            'attribution_text' => $request->validated('attribution_text'),
        ]);

        return (new MediaAssetResource($asset))->response()->setStatusCode(201);
    }

    public function generate(Request $request, Experience $experience)
    {
        // Reuses the "update" policy rule: only the owning partner or an
        // admin may request media generation for an experience.
        if (! $request->user()->can('update', $experience)) {
            abort(403, 'You are not authorized to generate media for this experience.');
        }

        $job = AiGenerationJob::create([
            'experience_id' => $experience->id,
            'requested_by' => $request->user()->id,
            'status' => AiGenerationJob::STATUS_QUEUED,
            'job_type' => 'image',
        ]);

        GenerateMediaJob::dispatch($job);

        return response()->json([
            'job_id' => $job->id,
            'status' => $job->status,
        ], 202);
    }
}

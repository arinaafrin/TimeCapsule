<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExperienceResource;
use App\Models\Experience;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $experiences = $request->user()
            ->favorites()
            ->with('city')
            ->orderByDesc('favorites.created_at')
            ->paginate(20);

        return ExperienceResource::collection($experiences);
    }

    public function store(Request $request, Experience $experience)
    {
        $favorite = Favorite::firstOrCreate([
            'user_id' => $request->user()->id,
            'experience_id' => $experience->id,
        ]);

        return response()->json([
            'data' => [
                'id' => $favorite->id,
                'experience_id' => $favorite->experience_id,
            ],
        ], 201);
    }

    public function destroy(Request $request, Experience $experience)
    {
        Favorite::where('user_id', $request->user()->id)
            ->where('experience_id', $experience->id)
            ->delete();

        return response()->noContent();
    }
}

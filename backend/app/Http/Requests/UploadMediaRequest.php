<?php

namespace App\Http\Requests;

use App\Models\Experience;
use Illuminate\Foundation\Http\FormRequest;

class UploadMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Experience $experience */
        $experience = $this->route('experience');

        return $this->user()?->can('update', $experience) ?? false;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'in:panorama_360,still_image,thumbnail,3d_model'],
            'source_type' => ['required', 'in:ai_generated,archival,partner_upload'],
            'attribution_text' => ['nullable', 'string', 'max:255'],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,glb,gltf', 'max:51200'],
        ];
    }
}

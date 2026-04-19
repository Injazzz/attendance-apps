<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends BaseController
{
    /**
     * Stream media file from storage
     * Route: /api/v1/media/{id}
     */
    public function show(int $id)
    {
        $media = Media::findOrFail($id);
        
        // Verify auth can access this media (optional - remove if all media public)
        // $this->authorize('view', $media);
        
        $disk = Storage::disk($media->disk);
        $path = $media->getPath();
        
        if (!$disk->exists($path)) {
            return response()->json(['error' => 'File not found'], 404);
        }
        
        return Response::file(
            $disk->path($path),
            ['Content-Type' => $media->mime_type]
        );
    }
    
    /**
     * Get media URL for a model
     * Route: /api/v1/media/download/{modelType}/{modelId}/{collection}
     */
    public function download(string $modelType, int $modelId, string $collection = 'photo')
    {
        $modelClass = "App\\Models\\{$modelType}";
        
        if (!class_exists($modelClass)) {
            return response()->json(['error' => 'Invalid model'], 400);
        }
        
        $model = $modelClass::findOrFail($modelId);
        $media = $model->getFirstMedia($collection);
        
        if (!$media) {
            return response()->json(['error' => 'Media not found'], 404);
        }
        
        return redirect()->to(
            route('api.media.direct', ['id' => $media->id], false)
        );
    }
}

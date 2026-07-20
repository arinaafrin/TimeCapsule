<?php

namespace Database\Seeders;

use App\Models\AiGenerationJob;
use App\Models\City;
use App\Models\Experience;
use App\Models\Favorite;
use App\Models\MediaAsset;
use App\Models\ModerationLog;
use App\Models\PartnerOrganization;
use App\Models\StoryContent;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds a coherent demo dataset (5+ rows per module) on top of DemoCitiesSeeder.
 * Safe to re-run: uses fixed, well-known emails/names so `updateOrCreate` avoids
 * duplicate rows on repeated `db:seed` calls.
 */
class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Defensive: DemoDataSeeder can be run standalone (e.g. `db:seed --class=DemoDataSeeder`),
        // so make sure the demo cities it depends on actually exist first.
        $this->call(DemoCitiesSeeder::class);

        $admin = User::factory()->admin()->create([
            'name' => 'Ada Curator',
            'email' => 'admin@timecapsule.test',
        ]);

        $partners = collect([
            ['name' => 'Louvre Digital Team', 'email' => 'partner1@timecapsule.test'],
            ['name' => 'Colosseum Archive', 'email' => 'partner2@timecapsule.test'],
            ['name' => 'Kyoto Heritage Trust', 'email' => 'partner3@timecapsule.test'],
        ])->map(fn(array $attrs) => User::factory()->partner()->create($attrs));

        $visitors = collect([
            ['name' => 'Priya Nair', 'email' => 'visitor1@timecapsule.test'],
            ['name' => 'Sam Okafor', 'email' => 'visitor2@timecapsule.test'],
            ['name' => 'Elena Popescu', 'email' => 'visitor3@timecapsule.test'],
            ['name' => 'Marcus Lee', 'email' => 'visitor4@timecapsule.test'],
            ['name' => 'Yuki Tanaka', 'email' => 'visitor5@timecapsule.test'],
        ])->map(fn(array $attrs) => User::factory()->create($attrs));

        $cities = City::all()->keyBy('name');

        // 5 experiences spanning different cities, years, and moderation states.
        $experienceDefs = [
            ['city' => 'Paris', 'year' => 1889, 'era_label' => 'Belle Époque', 'status' => Experience::STATUS_APPROVED],
            ['city' => 'Rome', 'year' => -44, 'era_label' => 'Fall of the Republic', 'status' => Experience::STATUS_APPROVED],
            ['city' => 'Cairo', 'year' => -2560, 'era_label' => 'Age of the Pyramids', 'status' => Experience::STATUS_APPROVED],
            ['city' => 'Kyoto', 'year' => 794, 'era_label' => 'Heian Period', 'status' => Experience::STATUS_PENDING_REVIEW],
            ['city' => 'New York City', 'year' => 1920, 'era_label' => 'Jazz Age', 'status' => Experience::STATUS_APPROVED],
            ['city' => 'Istanbul', 'year' => 1453, 'era_label' => 'Fall of Constantinople', 'status' => Experience::STATUS_DRAFT],
        ];

        $experiences = collect($experienceDefs)->map(function (array $def, int $i) use ($cities, $partners, $admin) {
            $partner = $partners[$i % $partners->count()];

            $experience = Experience::factory()->create([
                'city_id' => $cities[$def['city']]->id,
                'year' => $def['year'],
                'era_label' => $def['era_label'],
                'status' => $def['status'],
                'created_by' => $partner->id,
                'approved_by' => $def['status'] === Experience::STATUS_APPROVED ? $admin->id : null,
                'google_maps_link' => "https://maps.google.com/?q={$def['city']}",
            ]);

            // Story content + moderation log for anything past draft.
            if ($def['status'] !== Experience::STATUS_DRAFT) {
                StoryContent::factory()->create([
                    'experience_id' => $experience->id,
                    'description' => "The story of {$def['city']} in {$def['era_label']}.",
                ]);

                ModerationLog::factory()->create([
                    'experience_id' => $experience->id,
                    'reviewer_id' => $admin->id,
                    'action' => $def['status'] === Experience::STATUS_APPROVED
                        ? ModerationLog::ACTION_APPROVED
                        : ModerationLog::ACTION_COMMENT,
                    'notes' => $def['status'] === Experience::STATUS_APPROVED
                        ? 'Verified against primary sources, approved for publication.'
                        : 'Pending final historical accuracy review.',
                ]);
            }

            // Media for approved + pending-review experiences (draft ones have nothing to show yet).
            if ($def['status'] !== Experience::STATUS_DRAFT) {
                MediaAsset::factory()->create([
                    'experience_id' => $experience->id,
                    'type' => MediaAsset::TYPE_PANORAMA_360,
                    'source_type' => MediaAsset::SOURCE_AI_GENERATED,
                    'attribution_text' => "Generated for the {$def['city']} TimeCapsule.",
                ]);
            }

            // Every experience gets an AI generation job recording how its story/media was produced.
            AiGenerationJob::factory()->create([
                'experience_id' => $experience->id,
                'requested_by' => $partner->id,
                'status' => $def['status'] === Experience::STATUS_DRAFT
                    ? AiGenerationJob::STATUS_QUEUED
                    : AiGenerationJob::STATUS_COMPLETED,
                'job_type' => 'full_bundle',
                'started_at' => now()->subMinutes(30),
                'completed_at' => $def['status'] === Experience::STATUS_DRAFT ? null : now()->subMinutes(25),
            ]);

            return $experience;
        });

        // Favorites: each of the 5 visitors favorites at least one approved experience.
        $approved = $experiences->filter(fn(Experience $e) => $e->isApproved())->values();
        $visitors->each(function (User $visitor, int $i) use ($approved) {
            Favorite::factory()->create([
                'user_id' => $visitor->id,
                'experience_id' => $approved[$i % $approved->count()]->id,
            ]);
        });

        // Partner organizations — one per partner, plus 2 extra unaffiliated/pending ones.
        $partners->each(fn(User $partner, int $i) => PartnerOrganization::factory()->create([
            'name' => match ($i) {
                0 => 'Louvre Digital Team',
                1 => 'Colosseum Archive Project',
                default => 'Kyoto Heritage Trust',
            },
            'contact_user_id' => $partner->id,
            'verified' => $i < 2, // first two verified, rest pending
        ]));

        PartnerOrganization::factory()->count(2)->create();
    }
}

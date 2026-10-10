<?php

namespace Tests\Feature;

use App\Models\Feedback;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeedbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_submit_feedback(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)->post('/feedback', [
            'title' => 'Pohon di jalur pedestrian perlu pemangkasan',
            'message' => 'Ranting pohon sudah mulai menutupi lampu jalan.',
        ]);

        $response->assertRedirect('/feedback');

        $this->assertDatabaseHas('feedback', [
            'user_id' => $user->id,
            'title' => 'Pohon di jalur pedestrian perlu pemangkasan',
            'status' => 'Menunggu',
        ]);
    }

    public function test_admin_can_update_feedback_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);

        $feedback = Feedback::create([
            'user_id' => $user->id,
            'title' => 'Usulan Tempat Sampah',
            'message' => 'Tambahkan tempat sampah di taman.',
            'status' => 'Menunggu',
        ]);

        $response = $this->actingAs($admin)->patch("/feedback/{$feedback->id}/status", [
            'status' => 'Selesai',
        ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('feedback', [
            'id' => $feedback->id,
            'status' => 'Selesai',
        ]);
    }
}

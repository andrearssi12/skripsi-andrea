<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_access_public_landing_page(): void
    {
        $response = $this->get('/');
        $response->assertOk();
    }

    public function test_guest_is_redirected_to_login_on_protected_routes(): void
    {
        $response = $this->get('/dashboard');
        $response->assertRedirect('/login');

        $response = $this->get('/map');
        $response->assertRedirect('/login');

        $response = $this->get('/feedback');
        $response->assertRedirect('/login');
    }

    public function test_standard_user_cannot_access_admin_routes_including_dashboard(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
        ]);

        $this->actingAs($user)->get('/dashboard')->assertStatus(403);
        $this->actingAs($user)->get('/campuses')->assertStatus(403);
        $this->actingAs($user)->get('/land-use-categories')->assertStatus(403);
        $this->actingAs($user)->get('/land-uses/create')->assertStatus(403);
        $this->actingAs($user)->get('/activity-logs')->assertStatus(403);
    }

    public function test_admin_can_access_dashboard_and_admin_routes(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $this->actingAs($admin)->get('/dashboard')->assertOk();
        $this->actingAs($admin)->get('/campuses')->assertOk();
        $this->actingAs($admin)->get('/land-use-categories')->assertOk();
        $this->actingAs($admin)->get('/land-uses')->assertOk();
        $this->actingAs($admin)->get('/activity-logs')->assertOk();
    }
}

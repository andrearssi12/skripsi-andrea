<?php

namespace App\Http\Controllers;

use App\Models\Campus;
use App\Models\CampusSpatialPlan;
use App\Models\LandUse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CampusSpatialPlanController extends Controller
{
    /**
     * One-click ACC / Toggle Approval for a spatial recommendation plan.
     */
    public function toggleApproval(Request $request): RedirectResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            abort(403, 'Hanya Administrator yang memiliki akses untuk menyetujui (ACC) rencana pengembangan.');
        }

        $validated = $request->validate([
            'campus_id'             => 'required|exists:campuses,id',
            'land_use_id'           => 'nullable|exists:land_uses,id',
            'title'                 => 'required|string|max:255',
            'pillar_type'           => 'required|string|max:50',
            'description'           => 'nullable|string',
            'target_year'           => 'nullable|string|max:50',
            'area_size'             => 'nullable|numeric',
            'potential_gain_percent'=> 'nullable|numeric',
            'notes'                 => 'nullable|string',
        ]);

        $landUseId = $validated['land_use_id'] ?? null;
        $campusId = (int) $validated['campus_id'];

        $plan = null;
        if ($landUseId) {
            $plan = CampusSpatialPlan::where('campus_id', $campusId)
                ->where('land_use_id', $landUseId)
                ->first();
        }

        if (!$plan) {
            $lu = $landUseId ? LandUse::find($landUseId) : null;

            // Create as Approved (ACC)
            $plan = CampusSpatialPlan::create([
                'campus_id'             => $campusId,
                'land_use_id'           => $landUseId,
                'geometry'              => $lu?->geometry,
                'title'                 => $validated['title'],
                'pillar_type'           => $validated['pillar_type'],
                'description'           => $validated['description'] ?? null,
                'target_year'           => $validated['target_year'] ?? date('Y') . '-' . (date('Y') + 2),
                'area_size'             => (float) ($validated['area_size'] ?? 0),
                'potential_gain_percent'=> (float) ($validated['potential_gain_percent'] ?? 0),
                'status'                => 'approved',
                'approved_by'           => Auth::id(),
                'approved_at'           => now(),
                'notes'                 => $validated['notes'] ?? 'Disetujui oleh Administrator untuk dipublikasikan ke Civitas Kampus.',
            ]);

            return back()->with('success', "Rencana '{$plan->title}' berhasil di-ACC dan dipublikasikan ke Perencanaan Kampus Kedepannya.");
        }

        // If exists, toggle status
        if ($plan->status === 'approved') {
            $plan->update([
                'status'      => 'draft',
                'approved_by' => null,
                'approved_at' => null,
            ]);

            return back()->with('info', "Persetujuan rencana '{$plan->title}' telah dibatalkan (kembali ke Draft).");
        } else {
            $plan->update([
                'status'      => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            return back()->with('success', "Rencana '{$plan->title}' berhasil di-ACC dan dipublikasikan.");
        }
    }

    /**
     * Update target year / notes of a spatial plan.
     */
    public function update(Request $request, CampusSpatialPlan $spatialPlan): RedirectResponse
    {
        $validated = $request->validate([
            'target_year' => 'nullable|string|max:50',
            'notes'       => 'nullable|string',
            'status'      => 'required|in:draft,approved,implemented',
        ]);

        $updateData = [
            'target_year' => $validated['target_year'],
            'notes'       => $validated['notes'],
            'status'      => $validated['status'],
        ];

        if ($validated['status'] === 'approved' && $spatialPlan->status !== 'approved') {
            $updateData['approved_by'] = Auth::id();
            $updateData['approved_at'] = now();
        }

        $spatialPlan->update($updateData);

        return back()->with('success', 'Rencana spasial berhasil diperbarui.');
    }

    /**
     * Delete a spatial plan.
     */
    public function destroy(CampusSpatialPlan $spatialPlan): RedirectResponse
    {
        $spatialPlan->delete();
        return back()->with('success', 'Rencana spasial berhasil dihapus.');
    }
}

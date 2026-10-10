<?php

namespace App\Http\Controllers;

use App\Models\FeedbackHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $user      = $request->user();
        $isManager = $user->canManageFeedback();

        $search    = $request->query('search');
        $action    = $request->query('action'); // 'status_changed' | 'deleted'

        $query = FeedbackHistory::with(['user:id,name,email', 'actor:id,name,role'])
            ->latest('created_at');

        // User biasa hanya bisa lihat riwayat feedback miliknya
        if (!$isManager) {
            $query->where('user_id', $user->id);
        }

        $query
            ->when($action, fn ($q) => $q->where('action', $action))
            ->when($search, fn ($q) => $q->where('feedback_title', 'like', "%{$search}%"));

        $histories = $query->paginate(20)->withQueryString();

        return Inertia::render('Feedback/History', [
            'histories'  => $histories,
            'filters'    => [
                'search' => $search,
                'action' => $action,
            ],
            'isAdmin'    => $user->isAdmin(),
            'canManage'  => $isManager,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->query('user_id');
        $module = $request->query('module');
        $action = $request->query('action');
        $search = $request->query('search');
        $date = $request->query('date');

        $logs = ActivityLog::with('user')
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->when($module, fn ($q) => $q->where('module', $module))
            ->when($action, fn ($q) => $q->where('action', $action))
            ->when($date, fn ($q) => $q->whereDate('created_at', $date))
            ->when($search, function ($q, $search) {
                $q->where('description', 'like', "%{$search}%");
            })
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString();

        $users = User::select('id', 'name', 'email', 'role')->get();

        $modules = ActivityLog::select('module')->distinct()->pluck('module');
        $actions = ActivityLog::select('action')->distinct()->pluck('action');

        return Inertia::render('ActivityLogs/Index', [
            'logs' => $logs,
            'users' => $users,
            'modules' => $modules,
            'actions' => $actions,
            'filters' => [
                'user_id' => $userId,
                'module' => $module,
                'action' => $action,
                'search' => $search,
                'date' => $date,
            ],
        ]);
    }
}

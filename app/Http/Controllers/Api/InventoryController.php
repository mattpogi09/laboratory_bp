<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->input('status');
        $search = $request->input('search');

        $itemsQuery = InventoryItem::query()->orderBy('name');

        if ($status) {
            $itemsQuery->where('status', $status);
        }

        if ($search) {
            $itemsQuery->where('name', 'ILIKE', "%{$search}%");
        }

        $items = $itemsQuery->get()->map(function (InventoryItem $item) {
            $percentage = $item->minimum_stock > 0
                ? round(($item->current_stock / $item->minimum_stock) * 100)
                : 0;

            return [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category,
                'current_stock' => $item->current_stock,
                'minimum_stock' => $item->minimum_stock,
                'unit' => $item->unit,
                'status' => $item->status,
                'is_active' => $item->is_active,
                'percentage' => max(0, min(100, $percentage)),
            ];
        });

        $summary = [
            'total_items' => InventoryItem::count(),
            'good' => InventoryItem::where('status', 'good')->count(),
            'low_stock' => InventoryItem::where('status', 'low_stock')->count(),
            'out_of_stock' => InventoryItem::where('status', 'out_of_stock')->count(),
        ];

        return response()->json([
            'summary' => $summary,
            'items' => $items,
        ]);
    }

    public function transactions(Request $request)
    {
        $transactions = InventoryTransaction::with(['item', 'user'])
            ->latest()
            ->paginate(20);

        $data = $transactions->map(function ($transaction) {
            return [
                'id' => $transaction->id,
                'date' => $transaction->created_at->format('M d, Y h:i A'),
                'transaction_code' => $transaction->transaction_code,
                'item' => $transaction->item->name,
                'type' => strtoupper($transaction->type),
                'quantity' => (int) $transaction->quantity,
                'previous_stock' => $transaction->previous_stock !== null ? (int) $transaction->previous_stock : null,
                'new_stock' => $transaction->new_stock !== null ? (int) $transaction->new_stock : null,
                'reason' => $transaction->reason,
                'performed_by' => $transaction->user->name,
            ];
        });

        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }
}


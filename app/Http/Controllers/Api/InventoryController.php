<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'initial_stock' => 'required|integer|min:0',
            'minimum_stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
        ], [
            'name.required' => 'Item name is required.',
            'category.required' => 'Category is required.',
            'initial_stock.required' => 'Initial stock is required.',
            'initial_stock.integer' => 'Initial stock must be a whole number.',
            'initial_stock.min' => 'Initial stock cannot be negative.',
            'minimum_stock.required' => 'Minimum stock level is required.',
            'minimum_stock.integer' => 'Minimum stock must be a whole number.',
            'minimum_stock.min' => 'Minimum stock cannot be negative.',
            'unit.required' => 'Unit of measurement is required.',
        ]);

        DB::beginTransaction();
        try {
            $item = InventoryItem::create([
                'name' => $validated['name'],
                'category' => $validated['category'],
                'current_stock' => $validated['initial_stock'],
                'minimum_stock' => $validated['minimum_stock'],
                'unit' => $validated['unit'],
            ]);

            $item->updateStatus();

            if ($validated['initial_stock'] > 0) {
                InventoryTransaction::create([
                    'item_id' => $item->id,
                    'user_id' => $request->user()->id,
                    'type' => 'in',
                    'quantity' => $validated['initial_stock'],
                    'previous_stock' => 0,
                    'new_stock' => $validated['initial_stock'],
                    'transaction_code' => $this->generateTransactionCode(),
                    'reason' => 'Initial stock',
                ]);
            }

            app(AuditLogger::class)->logInventoryCreated([
                'id' => $item->id,
                'name' => $item->name,
                'quantity' => $item->current_stock,
                'unit' => $item->unit,
                'min_level' => $item->minimum_stock,
                'category' => $item->category,
            ]);

            DB::commit();
            return response()->json(['message' => 'Item created successfully'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create item'], 500);
        }
    }

    public function stockIn(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'item_id' => 'required|exists:inventory_items,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string',
        ], [
            'item_id.required' => 'Please select an item.',
            'item_id.exists' => 'Selected item does not exist.',
            'quantity.required' => 'Quantity is required.',
            'quantity.integer' => 'Quantity must be a whole number.',
            'quantity.min' => 'Quantity must be at least 1.',
            'reason.required' => 'Reason is required.',
        ]);

        DB::beginTransaction();
        try {
            $item = InventoryItem::findOrFail($validated['item_id']);
            $previousStock = $item->current_stock;
            $item->current_stock += $validated['quantity'];
            $newStock = $item->current_stock;
            $item->save();
            $item->updateStatus();

            InventoryTransaction::create([
                'item_id' => $item->id,
                'user_id' => $request->user()->id,
                'type' => 'in',
                'quantity' => $validated['quantity'],
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'transaction_code' => $this->generateTransactionCode(),
                'reason' => $validated['reason'],
            ]);

            app(AuditLogger::class)->logInventoryStockIn(
                $item->name,
                $validated['quantity'],
                $previousStock,
                $newStock,
                null,
                $validated['reason']
            );

            DB::commit();
            return response()->json(['message' => 'Stock added successfully'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to add stock'], 500);
        }
    }

    public function stockOut(Request $request)
    {
        // Admin and Lab Staff can stock out
        if (!in_array($request->user()->role, ['admin', 'lab_staff'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'item_id' => 'required|exists:inventory_items,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string',
        ], [
            'item_id.required' => 'Please select an item.',
            'item_id.exists' => 'Selected item does not exist.',
            'quantity.required' => 'Quantity is required.',
            'quantity.integer' => 'Quantity must be a whole number.',
            'quantity.min' => 'Quantity must be at least 1.',
            'reason.required' => 'Reason is required.',
        ]);

        DB::beginTransaction();
        try {
            $item = InventoryItem::findOrFail($validated['item_id']);

            if ($item->current_stock < $validated['quantity']) {
                return response()->json(['message' => 'Insufficient stock'], 400);
            }

            $previousStock = $item->current_stock;
            $item->current_stock -= $validated['quantity'];
            $newStock = $item->current_stock;
            $item->save();
            $item->updateStatus();

            InventoryTransaction::create([
                'item_id' => $item->id,
                'user_id' => $request->user()->id,
                'type' => 'out',
                'quantity' => $validated['quantity'],
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'transaction_code' => $this->generateTransactionCode(),
                'reason' => $validated['reason'],
            ]);

            app(AuditLogger::class)->logInventoryStockOut(
                $item->name,
                $validated['quantity'],
                $previousStock,
                $newStock,
                $validated['reason'],
                null
            );

            DB::commit();
            return response()->json(['message' => 'Stock removed successfully'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to remove stock'], 500);
        }
    }

    private function generateTransactionCode()
    {
        $prefix = 'INV';
        $date = now()->format('Ymd');
        $random = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 4));
        return "{$prefix}-{$date}-{$random}";
    }
}


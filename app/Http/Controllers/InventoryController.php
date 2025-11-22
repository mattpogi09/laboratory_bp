<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        // Admin and Lab Staff can access
        if (!in_array($request->user()->role, ['admin', 'lab_staff'])) {
            abort(403, 'Unauthorized access.');
        }

        $search = $request->input('search', '');

        $items = InventoryItem::when($search, function ($query, $search) {
            $query->where('name', 'ILIKE', "%{$search}%")
                ->orWhere('category', 'ILIKE', "%{$search}%");
        })
            ->orderBy('name')
            ->get();

        $transactions = InventoryTransaction::with(['item', 'user'])
            ->latest()
            ->limit(50)
            ->get();

        $stats = [
            'total' => InventoryItem::count(),
            'out_of_stock' => InventoryItem::where('status', 'out_of_stock')->count(),
            'low_stock' => InventoryItem::where('status', 'low_stock')->count(),
            'in_stock' => InventoryItem::where('status', 'good')->count(),
        ];

        $lowStockAlerts = InventoryItem::where('status', '!=', 'good')
            ->orderBy('current_stock')
            ->get();

        return Inertia::render('Configuration/Inventory/Index', [
            'items' => $items,
            'transactions' => $transactions,
            'stats' => $stats,
            'lowStockAlerts' => $lowStockAlerts,
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'initial_quantity' => 'required|integer|min:0',
            'minimum_stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
        ]);

        DB::beginTransaction();
        try {
            $item = InventoryItem::create([
                'name' => $validated['name'],
                'category' => $validated['category'],
                'current_stock' => $validated['initial_quantity'],
                'minimum_stock' => $validated['minimum_stock'],
                'unit' => $validated['unit'],
            ]);

            $item->updateStatus();

            if ($validated['initial_quantity'] > 0) {
                InventoryTransaction::create([
                    'item_id' => $item->id,
                    'user_id' => $request->user()->id,
                    'type' => 'in',
                    'quantity' => $validated['initial_quantity'],
                    'previous_stock' => 0,
                    'new_stock' => $validated['initial_quantity'],
                    'transaction_code' => $this->generateTransactionCode(),
                    'reason' => 'Initial stock',
                ]);
            }

            DB::commit();
            return back()->with('success', 'Item created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create item');
        }
    }

    public function stockIn(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'item_id' => 'required|exists:inventory_items,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string',
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

            DB::commit();
            return back()->with('success', 'Stock added successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to add stock');
        }
    }

    public function stockOut(Request $request)
    {
        // Admin and Lab Staff can stock out
        if (!in_array($request->user()->role, ['admin', 'lab_staff'])) {
            abort(403);
        }

        $validated = $request->validate([
            'item_id' => 'required|exists:inventory_items,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            $item = InventoryItem::findOrFail($validated['item_id']);

            if ($item->current_stock < $validated['quantity']) {
                return back()->with('error', 'Insufficient stock');
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

            DB::commit();
            return back()->with('success', 'Stock removed successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to remove stock');
        }
    }

    private function generateTransactionCode()
    {
        $prefix = 'INV';
        $date = now()->format('Ymd');
        $random = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 4));
        return "{$prefix}-{$date}-{$random}";
    }

    public function adjust(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'new_quantity' => 'required|integer|min:0',
            'reason' => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            $item = InventoryItem::findOrFail($id);
            $oldQuantity = $item->current_stock;
            $item->current_stock = $validated['new_quantity'];
            $item->save();
            $item->updateStatus();

            $difference = $validated['new_quantity'] - $oldQuantity;
            InventoryTransaction::create([
                'item_id' => $item->id,
                'user_id' => $request->user()->id,
                'type' => $difference >= 0 ? 'in' : 'out',
                'quantity' => abs($difference),
                'previous_stock' => $oldQuantity,
                'new_stock' => $validated['new_quantity'],
                'transaction_code' => $this->generateTransactionCode(),
                'reason' => $validated['reason'],
            ]);

            DB::commit();
            return back()->with('success', 'Stock adjusted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to adjust stock');
        }
    }
}

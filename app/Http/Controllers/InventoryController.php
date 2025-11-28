<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Services\AuditLogger;
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

        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $perPage = $request->input('per_page', 20);

        $items = InventoryItem::when($search, function ($query, $search) {
            $query->where('name', 'ILIKE', "%{$search}%")
                ->orWhere('category', 'ILIKE', "%{$search}%");
        })
            // Lab staff only sees active items, admin sees all
            ->when($request->user()->role === 'lab_staff', function ($query) {
                $query->where('is_active', true);
            })
            ->orderBy($sortBy, $sortOrder)
            ->paginate($perPage, ['*'], 'items_page');

        $transactions = InventoryTransaction::with(['item', 'user'])
            ->latest()
            ->paginate(10, ['*'], 'transactions_page');

        $stats = [
            'total' => InventoryItem::when($request->user()->role === 'lab_staff', function ($query) {
                $query->where('is_active', true);
            })->count(),
            'out_of_stock' => InventoryItem::where('status', 'out_of_stock')
                ->when($request->user()->role === 'lab_staff', function ($query) {
                    $query->where('is_active', true);
                })->count(),
            'low_stock' => InventoryItem::where('status', 'low_stock')
                ->when($request->user()->role === 'lab_staff', function ($query) {
                    $query->where('is_active', true);
                })->count(),
            'in_stock' => InventoryItem::where('status', 'good')
                ->when($request->user()->role === 'lab_staff', function ($query) {
                    $query->where('is_active', true);
                })->count(),
        ];

        $lowStockAlerts = InventoryItem::where('status', '!=', 'good')
            ->when($request->user()->role === 'lab_staff', function ($query) {
                $query->where('is_active', true);
            })
            ->orderBy('current_stock')
            ->get();

        return Inertia::render('Configuration/Inventory/Index', [
            'items' => $items,
            'transactions' => $transactions,
            'stats' => $stats,
            'lowStockAlerts' => $lowStockAlerts,
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
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
        ], [
            'name.required' => 'Item name is required.',
            'category.required' => 'Category is required.',
            'initial_quantity.required' => 'Initial quantity is required.',
            'initial_quantity.integer' => 'Initial quantity must be a whole number.',
            'initial_quantity.min' => 'Initial quantity cannot be negative.',
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

            app(AuditLogger::class)->logInventoryCreated([
                'id' => $item->id,
                'name' => $item->name,
                'quantity' => $item->current_stock,
                'unit' => $item->unit,
                'min_level' => $item->minimum_stock,
                'category' => $item->category,
            ]);

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

            app(AuditLogger::class)->logInventoryStockOut(
                $item->name,
                $validated['quantity'],
                $previousStock,
                $newStock,
                $validated['reason'],
                null
            );

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
        ], [
            'new_quantity.required' => 'New quantity is required.',
            'new_quantity.integer' => 'New quantity must be a whole number.',
            'new_quantity.min' => 'New quantity cannot be negative.',
            'reason.required' => 'Reason is required.',
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

            app(AuditLogger::class)->logInventoryAdjustment(
                $item->name,
                $oldQuantity,
                $validated['new_quantity'],
                $validated['reason'],
                null
            );

            DB::commit();
            return back()->with('success', 'Stock adjusted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to adjust stock');
        }
    }

    public function toggleActive($id, AuditLogger $auditLogger)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $item = InventoryItem::findOrFail($id);

        $item->update([
            'is_active' => !$item->is_active
        ]);

        $auditLogger->logInventoryToggled($item->id, $item->name, $item->is_active);

        $status = $item->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Item {$status} successfully");
    }
}

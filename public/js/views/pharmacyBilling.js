// public/js/views/pharmacyBilling.js

let pharmacyInventory = [];
let billingInvoices = [];
let pharmacyPatients = [];
let currentPharmTab = 'inventory';

async function renderPharmacyBilling(container) {
  try {
    const [invRes, billsRes, patRes] = await Promise.all([
      api.getPharmacy(),
      api.getInvoices(),
      api.getPatients()
    ]);

    pharmacyInventory = invRes.inventory || [];
    billingInvoices = billsRes.invoices || [];
    pharmacyPatients = patRes.patients || [];

    const totalRevenue = billingInvoices
      .filter(i => i.status === 'PAID')
      .reduce((sum, i) => sum + (Number(i.total) || 0), 0);

    const pendingRevenue = billingInvoices
      .filter(i => i.status === 'PENDING')
      .reduce((sum, i) => sum + (Number(i.total) || 0), 0);

    const lowStockItems = pharmacyInventory.filter(m => m.stock < 150).length;

    container.innerHTML = `
      <div class="space-y-4">
        
        <!-- Mobile Header Card -->
        <div class="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div class="flex items-center space-x-1.5 text-purple-200 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span>💊 Medical Store & Cashier</span>
          </div>
          <h2 class="text-lg font-extrabold tracking-tight">Pharmacy & Billing</h2>
          <p class="text-purple-100/90 text-xs mt-0.5">
            Dispense medicines, track stocks, and settle hospital bills in INR (₹).
          </p>

          <div class="mt-3">
            <button onclick="openDispenseModal()" class="w-full py-2 bg-white text-purple-800 text-xs font-bold rounded-xl shadow transition flex items-center justify-center space-x-1 touch-btn">
              <span>💊</span>
              <span>Dispense Medicine</span>
            </button>
          </div>
        </div>

        <!-- 2x2 Metric Grid -->
        <div class="grid grid-cols-2 gap-2.5">
          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
              📦
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Drugs</span>
              <span class="text-lg font-extrabold text-slate-900">${pharmacyInventory.length}</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
              ⚠️
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Low Stock</span>
              <span class="text-lg font-extrabold text-amber-600">${lowStockItems}</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              💵
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Paid (₹)</span>
              <span class="text-sm font-extrabold text-emerald-600 font-mono">₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
              ⏳
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Pending</span>
              <span class="text-sm font-extrabold text-rose-600 font-mono">₹${pendingRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

        <!-- Segmented Tab Bar -->
        <div class="bg-slate-200/80 p-1 rounded-2xl flex items-center space-x-1 text-xs">
          <button onclick="switchPharmTab('inventory')" class="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition text-center ${currentPharmTab === 'inventory' ? 'bg-white text-purple-800 shadow-sm' : 'text-slate-600'}">
            Inventory (${pharmacyInventory.length})
          </button>
          <button onclick="switchPharmTab('invoices')" class="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition text-center ${currentPharmTab === 'invoices' ? 'bg-white text-purple-800 shadow-sm' : 'text-slate-600'}">
            Bills (${billingInvoices.length})
          </button>
        </div>

        <!-- Content Area -->
        <div id="pharmTabContent" class="space-y-3"></div>

      </div>
    `;

    renderPharmCurrentTab();
  } catch (err) {
    container.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-2xl text-xs">Error loading pharmacy: ${err.message}</div>`;
  }
}

function switchPharmTab(tab) {
  currentPharmTab = tab;
  renderPharmCurrentTab();
}

function renderPharmCurrentTab() {
  const content = document.getElementById('pharmTabContent');
  if (!content) return;

  if (currentPharmTab === 'inventory') {
    renderPharmacyInventoryCards(content);
  } else if (currentPharmTab === 'invoices') {
    renderInvoicesCards(content);
  }
}

// ----------------------------------------------------
// INVENTORY CARDS
// ----------------------------------------------------
function renderPharmacyInventoryCards(target) {
  target.innerHTML = `
    <div class="space-y-2.5">
      ${pharmacyInventory.map(m => {
        const isLow = m.stock < 150;
        return `
          <div class="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-sm space-y-2">
            <div class="flex items-start justify-between">
              <div>
                <div class="font-bold text-xs text-slate-900">${m.name}</div>
                <div class="text-[10px] text-slate-400 font-mono">${m.category} • ${m.dosageForm}</div>
              </div>
              <div class="text-right">
                <span class="font-mono font-extrabold text-sm text-slate-900">₹${m.unitPrice.toFixed(2)}</span>
                <span class="text-[9px] text-slate-400 block">/ unit</span>
              </div>
            </div>

            <div class="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl">
              <div>
                <span class="text-slate-500">Stock:</span>
                <span class="font-bold font-mono ${isLow ? 'text-amber-600' : 'text-slate-800'}">${m.stock} units</span>
                ${isLow ? `<span class="px-1 py-0.5 rounded text-[8px] bg-amber-100 text-amber-800 font-bold ml-1">Low</span>` : ''}
              </div>
              <div class="font-mono text-[10px] text-slate-400">Exp: ${m.expiry}</div>
            </div>

            <button onclick="openDispenseForMedicine('${m.id}')" class="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold transition touch-btn">
              Dispense Formulation
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ----------------------------------------------------
// INVOICES CARDS
// ----------------------------------------------------
function renderInvoicesCards(target) {
  target.innerHTML = `
    <div class="space-y-2.5">
      ${billingInvoices.map(inv => {
        const isPaid = inv.status === 'PAID';
        return `
          <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-2.5">
            <div class="flex items-start justify-between">
              <div>
                <div class="font-bold text-xs text-slate-900">${inv.patientName}</div>
                <div class="text-[10px] font-mono text-purple-700">${inv.id} • ${inv.date}</div>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 animate-pulse'}">
                ${inv.status}
              </span>
            </div>

            <div class="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl truncate">
              ${(inv.items || []).map(i => i.desc).join(', ')}
            </div>

            <div class="flex items-center justify-between pt-1 border-t border-slate-100">
              <div>
                <span class="text-[10px] text-slate-400 block">Total Amount</span>
                <span class="text-base font-extrabold text-slate-900 font-mono">₹${Number(inv.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div class="flex items-center space-x-1.5">
                ${!isPaid ? `
                  <button onclick="openPayInvoiceModal('${inv.id}')" class="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition touch-btn">
                    Settle Bill
                  </button>
                ` : ''}
                <button onclick="viewInvoiceReceipt('${inv.id}')" class="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition touch-btn">
                  Receipt
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ----------------------------------------------------
// MODAL: DISPENSE MEDICINE (BOTTOM SHEET)
// ----------------------------------------------------
function openDispenseModal(preselectedMedId = '') {
  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
      <div class="absolute inset-0" onclick="closeModal()"></div>
      <div class="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 space-y-3">
        
        <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>
        
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-sm font-extrabold text-slate-900">Dispense Medicine</h3>
          <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">✕</button>
        </div>

        <form onsubmit="submitDispense(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Select Patient *</label>
            <select id="dispPatientId" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50">
              <option value="">-- Choose patient --</option>
              ${pharmacyPatients.map(p => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Select Medicine *</label>
            <select id="dispMedId" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50">
              <option value="">-- Choose formulation --</option>
              ${pharmacyInventory.map(m => `<option value="${m.id}" ${m.id === preselectedMedId ? 'selected' : ''}>${m.name} (₹${m.unitPrice.toFixed(2)})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Quantity (Units) *</label>
            <input type="number" id="dispQty" required min="1" max="100" value="10" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs">
          </div>

          <div class="pt-2 flex items-center space-x-2">
            <button type="button" onclick="closeModal()" class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold transition shadow-sm touch-btn">
              Dispense & Bill
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}

function openDispenseForMedicine(medId) {
  openDispenseModal(medId);
}

async function submitDispense(e) {
  e.preventDefault();
  const patientId = document.getElementById('dispPatientId').value;
  const medicineId = document.getElementById('dispMedId').value;
  const quantity = parseInt(document.getElementById('dispQty').value) || 1;

  try {
    const res = await api.dispenseMedicine({ medicineId, quantity, patientId });
    closeModal();
    showToast(res.message, 'success');
    renderPharmacyBilling(document.getElementById('viewContainer'));
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// ----------------------------------------------------
// MODAL: SETTLE BILL (BOTTOM SHEET WITH UPI)
// ----------------------------------------------------
function openPayInvoiceModal(invId) {
  const inv = billingInvoices.find(i => i.id === invId);
  if (!inv) return;

  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
      <div class="absolute inset-0" onclick="closeModal()"></div>
      <div class="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 space-y-3">
        
        <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>

        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-sm font-extrabold text-slate-900">Settle Hospital Bill</h3>
          <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">✕</button>
        </div>

        <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
          <div>
            <span class="text-slate-400 block text-[10px]">PATIENT</span>
            <span class="font-bold text-slate-900">${inv.patientName}</span>
          </div>
          <div class="text-right">
            <span class="text-slate-400 block text-[10px]">AMOUNT DUE</span>
            <span class="font-mono font-extrabold text-emerald-700 text-base">₹${Number(inv.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <form onsubmit="submitPayInvoice(event, '${inv.id}')" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Payment Method *</label>
            <select id="payMethod" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50">
              <option value="UPI / Google Pay / PhonePe">Instant UPI / QR (GPay, PhonePe, Paytm)</option>
              <option value="Cash at Counter">Cash at Billing Counter</option>
              <option value="RuPay / Credit / Debit Card">RuPay / Visa / MasterCard</option>
              <option value="Ayushman Bharat / PM-JAY Claim">PM-JAY / TPA Insurance Claim</option>
            </select>
          </div>

          <div class="pt-2 flex items-center space-x-2">
            <button type="button" onclick="closeModal()" class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm touch-btn">
              Confirm Received
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}

async function submitPayInvoice(e, invId) {
  e.preventDefault();
  const paymentMethod = document.getElementById('payMethod').value;
  try {
    const res = await api.payInvoice(invId, paymentMethod);
    closeModal();
    showToast(res.message, 'success');
    renderPharmacyBilling(document.getElementById('viewContainer'));
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

function viewInvoiceReceipt(invId) {
  const inv = billingInvoices.find(i => i.id === invId);
  if (!inv) return;

  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
      <div class="absolute inset-0" onclick="closeModal()"></div>
      <div class="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 space-y-3">
        
        <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>

        <div class="border-b border-slate-200 pb-2 flex items-center justify-between">
          <div>
            <h3 class="font-extrabold text-sm text-slate-900">Hospital Bill Receipt</h3>
            <p class="text-[10px] text-slate-400 font-mono">${inv.id} • ${inv.date}</p>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
            ${inv.status}
          </span>
        </div>

        <div class="text-xs space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div class="flex justify-between">
            <span class="text-slate-500">Patient:</span>
            <span class="font-bold text-slate-900">${inv.patientName}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Mode:</span>
            <span class="font-semibold text-slate-800">${inv.paymentMethod || 'UPI / Cash'}</span>
          </div>

          <div class="border-t border-slate-200 pt-2 space-y-1">
            ${(inv.items || []).map(i => `
              <div class="flex justify-between text-[11px] text-slate-600">
                <span class="truncate max-w-[200px]">${i.desc}</span>
                <span class="font-mono font-bold">₹${Number(i.amount).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>

          <div class="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total:</span>
            <span class="font-mono text-purple-800">₹${Number(inv.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div class="flex space-x-2 pt-1">
          <button onclick="closeModal()" class="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Done</button>
          <button onclick="window.print()" class="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Print Receipt</button>
        </div>

      </div>
    </div>
  `;
}

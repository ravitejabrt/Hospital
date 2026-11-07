// public/js/views/labDashboard.js

let currentLabTab = 'orders';
let labOrdersData = [];
let labCatalogData = [];
let labPackagesData = [];
let labPatientsData = [];

async function renderLabDashboard(container) {
  try {
    const [ordersRes, catalogRes, pkgsRes, patientsRes] = await Promise.all([
      api.getLabOrders(),
      api.getLabCatalog(),
      api.getLabPackages(),
      api.getPatients()
    ]);

    labOrdersData = ordersRes.orders || [];
    labCatalogData = catalogRes.catalog || [];
    labPackagesData = pkgsRes.packages || [];
    labPatientsData = patientsRes.patients || [];

    const totalOrders = labOrdersData.length;
    const awaitingSample = labOrdersData.filter(o => o.status === 'ORDERED').length;
    const inProcessing = labOrdersData.filter(o => o.status === 'PROCESSING' || o.status === 'SAMPLE_COLLECTED').length;
    const completed = labOrdersData.filter(o => o.status === 'COMPLETED').length;

    container.innerHTML = `
      <div class="space-y-4">
        
        <!-- Mobile Lab Header Card -->
        <div class="gradient-blood rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div class="relative z-10">
            <div class="flex items-center space-x-1.5 text-rose-200 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span class="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              <span>NABL Accredited • LIS Diagnostic Lab</span>
            </div>
            <h2 class="text-lg font-extrabold tracking-tight">Blood Diagnostic Center</h2>
            <p class="text-rose-100/90 text-xs mt-0.5">
              Phlebotomy queue, automated abnormal parameter flags & signed pathology reports.
            </p>
            
            <div class="mt-3 flex items-center space-x-2">
              <button onclick="openNewLabOrderModal()" class="flex-1 py-2 bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl shadow transition flex items-center justify-center space-x-1.5 touch-btn">
                <span>+</span>
                <span>Order Blood Test</span>
              </button>
              <button onclick="openAddTestModal()" class="py-2 px-3 bg-rose-800/80 text-white text-xs font-semibold rounded-xl border border-rose-400/30 transition touch-btn">
                + Catalog
              </button>
            </div>
          </div>
        </div>

        <!-- 2x2 on Mobile, 4-Cols on Desktop -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
              🩸
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Total Tests</span>
              <span class="text-lg font-extrabold text-slate-900">${totalOrders}</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
              🧪
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Need Sample</span>
              <span class="text-lg font-extrabold text-amber-600">${awaitingSample}</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg">
              ⚙️
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">In Analyzer</span>
              <span class="text-lg font-extrabold text-sky-600">${inProcessing}</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Completed</span>
              <span class="text-lg font-extrabold text-emerald-600">${completed}</span>
            </div>
          </div>
        </div>

        <!-- Segmented Tab Bar (Touch-friendly pill selector) -->
        <div class="bg-slate-200/80 p-1 rounded-2xl flex items-center space-x-1 text-xs overflow-x-auto no-scrollbar">
          <button onclick="switchLabTab('orders')" class="flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition text-center whitespace-nowrap ${currentLabTab === 'orders' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'}">
            Orders (${labOrdersData.length})
          </button>
          <button onclick="switchLabTab('phlebotomy')" class="flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition text-center whitespace-nowrap ${currentLabTab === 'phlebotomy' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'}">
            Phlebotomy (${awaitingSample})
          </button>
          <button onclick="switchLabTab('catalog')" class="flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition text-center whitespace-nowrap ${currentLabTab === 'catalog' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'}">
            Catalog (${labCatalogData.length})
          </button>
          <button onclick="switchLabTab('packages')" class="flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition text-center whitespace-nowrap ${currentLabTab === 'packages' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'}">
            Packages (${labPackagesData.length})
          </button>
        </div>

        <!-- Tab Content Area -->
        <div id="labTabContent" class="space-y-3"></div>

      </div>
    `;

    renderLabCurrentTab();
  } catch (err) {
    container.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-2xl text-xs">Error loading lab data: ${err.message}</div>`;
  }
}

function switchLabTab(tab) {
  currentLabTab = tab;
  renderLabCurrentTab();
}

function renderLabCurrentTab() {
  const content = document.getElementById('labTabContent');
  if (!content) return;

  if (currentLabTab === 'orders') {
    renderLabOrdersCards(content);
  } else if (currentLabTab === 'phlebotomy') {
    renderPhlebotomyStation(content);
  } else if (currentLabTab === 'catalog') {
    renderLabCatalogList(content);
  } else if (currentLabTab === 'packages') {
    renderLabPackagesGrid(content);
  }
}

// ----------------------------------------------------
// TAB 1: ALL LAB ORDERS (MOBILE CARD DESIGN)
// ----------------------------------------------------
function renderLabOrdersCards(target) {
  target.innerHTML = `
    <div class="space-y-3">
      
      <!-- Mobile Search Bar -->
      <div class="relative">
        <input type="text" id="labSearchInput" onkeyup="filterLabOrders()" placeholder="🔍 Search patient, order, test..." 
          class="w-full px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20">
      </div>

      <!-- Orders Responsive Cards Container -->
      <div id="labOrdersContainer" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        ${generateLabOrdersCards(labOrdersData)}
      </div>

    </div>
  `;
}

function generateLabOrdersCards(orders) {
  if (orders.length === 0) {
    return `<div class="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">No blood test orders found</div>`;
  }

  return orders.map(o => {
    let statusBadge = '';
    if (o.status === 'COMPLETED') {
      statusBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">✓ Done</span>`;
    } else if (o.status === 'PROCESSING') {
      statusBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-100 text-sky-800 animate-pulse">⚙️ Analyzer</span>`;
    } else if (o.status === 'SAMPLE_COLLECTED') {
      statusBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-800">🧪 Drawn</span>`;
    } else {
      statusBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">⏳ Need Sample</span>`;
    }

    let tubePill = `<span class="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-100 text-slate-700">${o.tubeColor || 'EDTA'}</span>`;
    if (o.tubeColor && (o.tubeColor.toLowerCase().includes('lavender') || o.tubeColor.toLowerCase().includes('purple'))) {
      tubePill = `<span class="tube-purple px-2 py-0.5 rounded text-[9px] font-mono">🟣 ${o.tubeColor.split(' ')[0]}</span>`;
    } else if (o.tubeColor && (o.tubeColor.toLowerCase().includes('red') || o.tubeColor.toLowerCase().includes('gold'))) {
      tubePill = `<span class="tube-red px-2 py-0.5 rounded text-[9px] font-mono">🔴 ${o.tubeColor.split(' ')[0]}</span>`;
    }

    return `
      <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-3">
        
        <!-- Card Top Bar -->
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center space-x-1.5">
              <span class="font-bold text-xs text-slate-900">${o.patientName}</span>
              <span class="text-[10px] text-slate-400 font-mono">(${o.patientId})</span>
            </div>
            <div class="text-[10px] text-slate-500 mt-0.5">Ref: ${o.referringDoctor || 'Dr. Priya Nair'}</div>
          </div>
          <div class="text-right">
            ${statusBadge}
            <div class="text-[9px] font-mono text-slate-400 mt-1">${o.id}</div>
          </div>
        </div>

        <!-- Investigation & Tube Badge -->
        <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
          <div>
            <div class="font-semibold text-slate-800 text-[11px]">${o.testName}</div>
            <div class="text-[10px] font-mono text-slate-400">${o.barcode || 'Barcoding pending'}</div>
          </div>
          <div>${tubePill}</div>
        </div>

        <!-- Thumb Action Buttons -->
        <div class="flex items-center space-x-2 pt-1 border-t border-slate-100">
          ${o.status === 'ORDERED' ? `
            <button onclick="openCollectSampleModal('${o.id}')" class="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm touch-btn">
              💉 Collect Specimen
            </button>
          ` : ''}

          ${o.status === 'SAMPLE_COLLECTED' ? `
            <button onclick="sendToAnalyzer('${o.id}')" class="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-sm touch-btn">
              ⚙️ Load to Analyzer
            </button>
          ` : ''}

          ${o.status === 'PROCESSING' || o.status === 'SAMPLE_COLLECTED' ? `
            <button onclick="openEnterResultsModal('${o.id}')" class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm touch-btn">
              📝 Enter Results
            </button>
          ` : ''}

          ${o.status === 'COMPLETED' ? `
            <button onclick="viewReport('${o.id}')" class="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 touch-btn">
              <span>📄 View / Print Report</span>
            </button>
          ` : ''}
        </div>

      </div>
    `;
  }).join('');
}

function filterLabOrders() {
  const q = (document.getElementById('labSearchInput')?.value || '').toLowerCase();
  const filtered = labOrdersData.filter(o => 
    !q || o.id.toLowerCase().includes(q) || o.patientName.toLowerCase().includes(q) || (o.barcode && o.barcode.toLowerCase().includes(q)) || o.testName.toLowerCase().includes(q)
  );
  const container = document.getElementById('labOrdersContainer');
  if (container) container.innerHTML = generateLabOrdersCards(filtered);
}

// ----------------------------------------------------
// TAB 2: PHLEBOTOMY STATION (MOBILE QUEUE)
// ----------------------------------------------------
function renderPhlebotomyStation(target) {
  const pending = labOrdersData.filter(o => o.status === 'ORDERED');

  target.innerHTML = `
    <div class="space-y-3">
      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center space-x-2.5 text-xs text-amber-900">
        <span class="text-xl">💉</span>
        <div class="flex-1">
          <div class="font-bold text-[11px]">Phlebotomy Blood Drawing Queue</div>
          <div class="text-[10px] text-amber-700">${pending.length} patient(s) waiting for sample collection</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        ${pending.length === 0 ? `
          <div class="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
            ✓ Phlebotomy queue is clear. All ordered samples drawn!
          </div>
        ` : pending.map(o => `
          <div class="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-xs text-slate-900">${o.patientName}</span>
              <span class="text-[9px] font-mono text-slate-400">${new Date(o.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            
            <div class="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl">
              <div class="font-semibold text-rose-700">${o.testName}</div>
              <div class="text-[10px] text-slate-500">Tube: <span class="font-bold text-slate-700">${o.tubeColor || 'EDTA'}</span></div>
            </div>

            <button onclick="openCollectSampleModal('${o.id}')" class="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm touch-btn">
              Collect Sample & Affix Barcode
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// TAB 3: TEST CATALOG (MOBILE LIST)
// ----------------------------------------------------
function renderLabCatalogList(target) {
  target.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      ${labCatalogData.map(t => `
        <div class="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm flex items-center justify-between">
          <div class="flex-1 pr-2">
            <div class="font-bold text-xs text-slate-900">${t.name}</div>
            <div class="text-[10px] text-slate-500 mt-0.5">
              ${t.category} • ${t.tubeColor} • ${(t.parameters || []).length} params
            </div>
          </div>
          <div class="text-right shrink-0">
            <span class="font-mono font-extrabold text-sm text-slate-900">₹${t.price.toFixed(2)}</span>
            <span class="text-[9px] text-slate-400 block">${t.tatHours}h TAT</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ----------------------------------------------------
// TAB 4: PACKAGES (MOBILE CARDS)
// ----------------------------------------------------
function renderLabPackagesGrid(target) {
  target.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
      ${labPackagesData.map(pkg => `
        <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[9px] font-bold rounded-full">${pkg.code}</span>
            <span class="text-[10px] text-slate-400 font-mono">${pkg.turnaroundTime}</span>
          </div>
          <div>
            <h3 class="font-extrabold text-sm text-slate-900">${pkg.name}</h3>
            <p class="text-[10px] text-slate-500 mt-0.5">${pkg.recommendedFor}</p>
          </div>

          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-600">
            <span class="font-bold text-slate-700 block mb-1">Includes ${pkg.totalTestsCount} Blood Tests:</span>
            <div class="grid grid-cols-2 gap-1">
              ${pkg.testIds.map(tId => {
                const t = labCatalogData.find(c => c.id === tId);
                return `<div class="truncate">✓ ${t ? t.name.split(' ')[0] : tId}</div>`;
              }).join('')}
            </div>
          </div>

          <div class="flex items-center justify-between pt-1">
            <div>
              <span class="text-xs text-slate-400 line-through">₹${pkg.originalPrice.toLocaleString('en-IN')}</span>
              <span class="text-base font-extrabold text-slate-900 font-mono ml-1.5">₹${pkg.discountedPrice.toLocaleString('en-IN')}</span>
            </div>
            <button onclick="openBookPackageModal('${pkg.id}')" class="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm touch-btn">
              Book Package
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ----------------------------------------------------
// MODAL: ORDER NEW BLOOD TEST (MOBILE BOTTOM SHEET)
// ----------------------------------------------------
function openNewLabOrderModal() {
  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
      <div class="absolute inset-0" onclick="closeModal()"></div>
      <div class="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 max-h-[88vh] flex flex-col">
        
        <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-2"></div>
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🩸</span>
            <h3 class="text-sm font-extrabold text-slate-900">Order Blood Test</h3>
          </div>
          <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">✕</button>
        </div>

        <form onsubmit="submitNewLabOrder(event)" class="space-y-3 text-xs overflow-y-auto no-scrollbar flex-1 pr-1">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Select Patient *</label>
            <select id="modalOrderPatientId" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none">
              <option value="">-- Choose patient --</option>
              ${labPatientsData.map(p => `<option value="${p.id}">${p.name} (${p.id} • ${p.age}y ${p.gender})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Investigation Test *</label>
            <select id="modalOrderTestId" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none">
              <option value="">-- Select blood investigation --</option>
              ${labCatalogData.map(t => `<option value="${t.id}">${t.name} (₹${t.price.toFixed(2)})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Referring Physician</label>
            <input type="text" id="modalOrderDoctor" value="Dr. Priya Nair (AIIMS)" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Clinical Notes</label>
            <textarea id="modalOrderNotes" rows="2" placeholder="e.g. Check fasting status..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"></textarea>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center space-x-2">
            <button type="button" onclick="closeModal()" class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-sm touch-btn">Confirm Order</button>
          </div>
        </form>

      </div>
    </div>
  `;
}

async function submitNewLabOrder(e) {
  e.preventDefault();
  const patientId = document.getElementById('modalOrderPatientId').value;
  const testId = document.getElementById('modalOrderTestId').value;
  const referringDoctor = document.getElementById('modalOrderDoctor').value;
  const notes = document.getElementById('modalOrderNotes').value;

  try {
    await api.createLabOrder({ patientId, testId, referringDoctor, notes });
    closeModal();
    showToast('Blood test ordered! Added to phlebotomy queue.', 'success');
    renderLabDashboard(document.getElementById('viewContainer'));
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

// ----------------------------------------------------
// MODAL: COLLECT BLOOD SAMPLE (PHLEBOTOMY BOTTOM SHEET)
// ----------------------------------------------------
function openCollectSampleModal(orderId) {
  const order = labOrdersData.find(o => o.id === orderId);
  if (!order) return;

  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
      <div class="absolute inset-0" onclick="closeModal()"></div>
      <div class="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 space-y-3">
        
        <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>
        
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-sm font-extrabold text-slate-900">Phlebotomy Sample Collection</h3>
          <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">✕</button>
        </div>

        <div class="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-[11px] space-y-1">
          <div><span class="text-slate-400">Patient:</span> <span class="font-bold text-slate-900">${order.patientName}</span></div>
          <div><span class="text-slate-400">Investigation:</span> <span class="font-semibold text-rose-700">${order.testName}</span></div>
          <div><span class="text-slate-400">Vacutainer:</span> <span class="font-semibold text-slate-800">${order.tubeColor || 'EDTA Whole Blood'}</span></div>
        </div>

        <form onsubmit="submitSampleCollection(event, '${order.id}')" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Phlebotomist Name *</label>
            <input type="text" id="modalPhlebName" required value="Suresh Verma (Chief Phlebotomist)" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Clinical Phlebotomy Notes</label>
            <input type="text" id="modalPhlebNotes" value="Fasting compliance checked. Clean venipuncture." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none">
          </div>

          <div class="pt-2 flex items-center space-x-2">
            <button type="button" onclick="closeModal()" class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition shadow-sm touch-btn">
              Affix Barcode Label
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}

async function submitSampleCollection(e, orderId) {
  e.preventDefault();
  const collectorName = document.getElementById('modalPhlebName').value;
  const notes = document.getElementById('modalPhlebNotes').value;

  try {
    const res = await api.collectSample(orderId, { collectorName, notes });
    closeModal();
    showToast(`Sample collected! Barcode: ${res.order.barcode}`, 'success');
    renderLabDashboard(document.getElementById('viewContainer'));
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

async function sendToAnalyzer(orderId) {
  try {
    await api.startProcessing(orderId);
    showToast('Loaded into automated analyzer.', 'info');
    renderLabDashboard(document.getElementById('viewContainer'));
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// ----------------------------------------------------
// MODAL: ENTER TEST RESULTS (MOBILE BOTTOM SHEET)
// ----------------------------------------------------
async function openEnterResultsModal(orderId) {
  const order = labOrdersData.find(o => o.id === orderId);
  if (!order) return;

  const testDef = labCatalogData.find(t => t.id === order.testId);
  const params = (testDef && testDef.parameters) ? testDef.parameters : [
    { key: "result", name: "Result", unit: "-", normalMin: 0, normalMax: 100 }
  ];

  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
      <div class="absolute inset-0" onclick="closeModal()"></div>
      <div class="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 max-h-[90vh] flex flex-col">
        
        <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-2"></div>
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <h3 class="text-sm font-extrabold text-slate-900">Enter Results</h3>
            <p class="text-[10px] text-slate-400">${order.testName} • ${order.patientName}</p>
          </div>
          <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">✕</button>
        </div>

        <form onsubmit="submitTestResults(event, '${order.id}')" class="space-y-3 text-xs overflow-y-auto no-scrollbar flex-1 pr-1">
          
          <div class="space-y-2">
            ${params.map(p => {
              const ref = p.normalMin !== undefined && p.normalMax !== undefined ? `${p.normalMin}-${p.normalMax}` : (p.normalMin || '-');
              return `
                <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span class="font-bold text-[11px] text-slate-900 block">${p.name}</span>
                    <span class="text-[9px] text-slate-400 font-mono">Ref: ${ref} ${p.unit || ''}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <input type="text" data-key="${p.key}" data-name="${p.name}" data-unit="${p.unit || ''}" required 
                      placeholder="${p.normalMin !== undefined ? p.normalMin : ''}" 
                      class="param-input w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-center font-mono font-bold text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none">
                    <span class="text-[9px] text-slate-400 font-mono">${p.unit || ''}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Pathologist Remarks</label>
            <input type="text" id="modalPathRemarks" value="Normocytic indices. Results clinically verified." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none">
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center space-x-2">
            <button type="button" onclick="closeModal()" class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-sm touch-btn">
              ✓ Sign & Release Report
            </button>
          </div>

        </form>

      </div>
    </div>
  `;
}

async function submitTestResults(e, orderId) {
  e.preventDefault();
  const inputEls = document.querySelectorAll('.param-input');
  const results = [];

  inputEls.forEach(inp => {
    results.push({
      key: inp.getAttribute('data-key'),
      name: inp.getAttribute('data-name'),
      value: inp.value,
      unit: inp.getAttribute('data-unit')
    });
  });

  const pathologistRemarks = document.getElementById('modalPathRemarks').value;
  const verifiedBy = 'Suresh Verma, MD (Pathology)';

  try {
    await api.submitResults(orderId, { results, pathologistRemarks, verifiedBy });
    closeModal();
    showToast('Report signed & published!', 'success');
    renderLabDashboard(document.getElementById('viewContainer'));
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// ----------------------------------------------------
// VIEW REPORT MODAL
// ----------------------------------------------------
async function viewReport(orderId) {
  try {
    const res = await api.getLabOrder(orderId);
    renderLabReportModal(res.order, res.testInfo, res.patient);
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

// ----------------------------------------------------
// BOOK PACKAGE MODAL (BOTTOM SHEET)
// ----------------------------------------------------
function openBookPackageModal(pkgId) {
  const pkg = labPackagesData.find(p => p.id === pkgId);
  if (!pkg) return;

  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
      <div class="absolute inset-0" onclick="closeModal()"></div>
      <div class="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 space-y-3">
        
        <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>
        
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 class="text-sm font-extrabold text-slate-900">Book Package</h3>
            <p class="text-[10px] text-slate-500">${pkg.name} (₹${pkg.discountedPrice.toLocaleString('en-IN')})</p>
          </div>
          <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">✕</button>
        </div>

        <form onsubmit="submitBookPackage(event, '${pkg.id}')" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Select Patient *</label>
            <select id="modalPkgPatientId" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none">
              <option value="">-- Choose patient --</option>
              ${labPatientsData.map(p => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('')}
            </select>
          </div>

          <div class="pt-2 flex items-center space-x-2">
            <button type="button" onclick="closeModal()" class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-sm touch-btn">
              Confirm & Book
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}

async function submitBookPackage(e, pkgId) {
  e.preventDefault();
  const patientId = document.getElementById('modalPkgPatientId').value;
  const referringDoctor = 'Dr. Priya Nair (AIIMS)';

  try {
    const res = await api.createLabOrder({
      patientId,
      referringDoctor,
      isPackage: true,
      packageId: pkgId
    });
    closeModal();
    showToast(res.message, 'success');
    renderLabDashboard(document.getElementById('viewContainer'));
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// ----------------------------------------------------
// MODAL: ADD CUSTOM TEST (BOTTOM SHEET)
// ----------------------------------------------------
function openAddTestModal() {
  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
      <div class="absolute inset-0" onclick="closeModal()"></div>
      <div class="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 space-y-3">
        
        <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>
        
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-sm font-extrabold text-slate-900">+ Add Investigation</h3>
          <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">✕</button>
        </div>

        <form onsubmit="submitAddCatalogTest(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Test Name *</label>
            <input type="text" id="catName" required placeholder="e.g. Serum Ferritin" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs">
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Category</label>
              <select id="catCategory" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs">
                <option value="Biochemistry">Biochemistry</option>
                <option value="Hematology">Hematology</option>
                <option value="Serology">Serology</option>
                <option value="Endocrinology">Endocrinology</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Fee (₹) *</label>
              <input type="number" id="catPrice" required value="450" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs">
            </div>
          </div>

          <div class="pt-2 flex items-center space-x-2">
            <button type="button" onclick="closeModal()" class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-sm touch-btn">Save Test</button>
          </div>
        </form>

      </div>
    </div>
  `;
}

async function submitAddCatalogTest(e) {
  e.preventDefault();
  const name = document.getElementById('catName').value;
  const category = document.getElementById('catCategory').value;
  const price = parseFloat(document.getElementById('catPrice').value) || 350;

  try {
    await api.addLabTest({ name, category, price, tubeColor: "Red / Gold (SST)", tatHours: 4 });
    closeModal();
    showToast(`Test '${name}' added!`, 'success');
    renderLabDashboard(document.getElementById('viewContainer'));
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

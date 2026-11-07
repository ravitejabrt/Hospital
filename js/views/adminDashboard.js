// public/js/views/adminDashboard.js

let adminStats = null;
let adminUsers = [];
let adminBeds = [];

async function renderAdminDashboard(container) {
  try {
    const [analyticsRes, usersRes, bedsRes] = await Promise.all([
      api.getAnalytics(),
      api.getUsers(),
      api.getBeds()
    ]);

    adminStats = analyticsRes.stats || {};
    adminUsers = usersRes.users || [];
    adminBeds = bedsRes.beds || [];

    const occ = adminStats.bedOccupancy || { rate: 0, occupied: 0, total: 10 };
    const lab = adminStats.bloodLab || { total: 0, completed: 0, pending: 0 };
    const fin = adminStats.finances || { collectedRevenue: 0, pendingRevenue: 0, totalBilled: 0 };

    container.innerHTML = `
      <div class="space-y-4">
        
        <!-- Mobile Admin Header Card -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div class="flex items-center space-x-1.5 text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Hospital Administration Console</span>
          </div>
          <h2 class="text-lg font-extrabold tracking-tight">Sanjeevani Executive Dashboard</h2>
          <p class="text-slate-400 text-xs mt-0.5">
            NABH/NABL governance, staff permissions, and revenue metrics in ₹ INR.
          </p>

          <div class="mt-3 flex items-center space-x-2">
            <button onclick="openAddStaffModal()" class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center space-x-1 touch-btn">
              <span>+</span>
              <span>Add Staff</span>
            </button>
            <button onclick="triggerResetSystem()" class="py-2 px-3 bg-slate-800 text-rose-300 text-xs font-semibold rounded-xl border border-slate-700 transition touch-btn">
              🔄 Reset DB
            </button>
          </div>
        </div>

        <!-- 2x2 Metric Grid -->
        <div class="grid grid-cols-2 gap-2.5">
          <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Patients</span>
            <div class="flex items-baseline space-x-1.5">
              <span class="text-lg font-extrabold text-slate-900">${adminStats.totalPatients || 0}</span>
              <span class="text-[9px] text-emerald-600 font-bold">+12%</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Lab Tests</span>
            <div class="flex items-baseline space-x-1.5">
              <span class="text-lg font-extrabold text-rose-600">${lab.total}</span>
              <span class="text-[9px] text-slate-500 font-mono">(${lab.completed} done)</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Bed Occupancy</span>
            <div class="flex items-baseline space-x-1.5">
              <span class="text-lg font-extrabold text-amber-600">${occ.rate}%</span>
              <span class="text-[9px] text-slate-500 font-mono">(${occ.occupied}/${occ.total})</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Revenue (₹)</span>
            <div class="flex items-baseline space-x-1.5">
              <span class="text-sm font-extrabold text-emerald-600 font-mono">₹${(fin.collectedRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

        <!-- Staff Accounts Section -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Medical & Clinical Staff</h3>
            <span class="text-[10px] text-indigo-600 font-bold">${adminUsers.length} Staff</span>
          </div>

          <div class="space-y-2">
            ${adminUsers.map(u => {
              let roleBadge = '';
              if (u.role === 'admin') roleBadge = `<span class="px-2 py-0.5 bg-slate-900 text-white rounded text-[8px] font-bold">Admin</span>`;
              else if (u.role === 'doctor') roleBadge = `<span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[8px] font-bold">Doctor</span>`;
              else if (u.role === 'lab_technician') roleBadge = `<span class="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[8px] font-bold">Pathologist</span>`;
              else if (u.role === 'receptionist') roleBadge = `<span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[8px] font-bold">Reception</span>`;
              else if (u.role === 'pharmacist') roleBadge = `<span class="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[8px] font-bold">Pharmacy</span>`;
              else roleBadge = `<span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[8px] font-bold">Patient</span>`;

              return `
                <div class="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-sm flex items-center justify-between">
                  <div class="flex items-center space-x-2.5">
                    <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}" class="w-9 h-9 rounded-full object-cover">
                    <div>
                      <div class="font-bold text-xs text-slate-900">${u.name}</div>
                      <div class="text-[10px] text-slate-400">${u.specialty || u.department || 'Hospital Core'}</div>
                    </div>
                  </div>
                  <div class="text-right flex flex-col items-end space-y-1">
                    ${roleBadge}
                    <button onclick="switchRoleAndNavigate('${u.role}', '${u.email}')" class="text-[10px] font-bold text-indigo-600 hover:underline">
                      Switch As ➔
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Ward Occupancy Grid -->
        <div class="space-y-2.5 pt-1">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Hospital Ward Beds</h3>
            <span class="text-[10px] text-slate-400 font-mono">${occ.occupied}/${occ.total} Occupied</span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            ${adminBeds.slice(0, 6).map(b => {
              const isOcc = b.status === 'OCCUPIED';
              return `
                <div class="p-2.5 rounded-2xl border ${isOcc ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white'} text-xs">
                  <div class="flex items-center justify-between mb-0.5">
                    <span class="font-mono font-extrabold text-[11px] text-slate-900">${b.number}</span>
                    <span class="text-[8px] font-bold px-1.5 py-0.5 rounded ${isOcc ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
                      ${isOcc ? 'Occupied' : 'Ready'}
                    </span>
                  </div>
                  <div class="text-[10px] text-slate-500 truncate">${b.ward}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-2xl text-xs">Error loading admin console: ${err.message}</div>`;
  }
}

// ----------------------------------------------------
// MODAL: ADD STAFF (MOBILE BOTTOM SHEET)
// ----------------------------------------------------
function openAddStaffModal() {
  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
      <div class="absolute inset-0" onclick="closeModal()"></div>
      <div class="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 space-y-3">
        
        <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>

        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-sm font-extrabold text-slate-900">Add Hospital Staff</h3>
          <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">✕</button>
        </div>

        <form onsubmit="submitAddStaff(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input type="text" id="staffName" required placeholder="Dr. Ananya Roy" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Email *</label>
            <input type="email" id="staffEmail" required placeholder="ananya.roy@hospital.com" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs">
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Role *</label>
              <select id="staffRole" class="w-full px-2 py-2 border border-slate-200 rounded-xl text-xs">
                <option value="doctor">Doctor</option>
                <option value="lab_technician">Lab Pathologist</option>
                <option value="receptionist">Receptionist</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Department</label>
              <input type="text" id="staffDept" placeholder="Pathology" class="w-full px-2 py-2 border border-slate-200 rounded-xl text-xs">
            </div>
          </div>

          <div class="pt-2 flex items-center space-x-2">
            <button type="button" onclick="closeModal()" class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-sm touch-btn">
              Create Account
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}

async function submitAddStaff(e) {
  e.preventDefault();
  const name = document.getElementById('staffName').value;
  const email = document.getElementById('staffEmail').value;
  const role = document.getElementById('staffRole').value;
  const department = document.getElementById('staffDept').value;

  try {
    await api.createUser({ name, email, role, department, password: "hospital123" });
    closeModal();
    showToast(`Staff account for ${name} created!`, 'success');
    renderAdminDashboard(document.getElementById('viewContainer'));
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function triggerResetSystem() {
  if (!confirm('Reset hospital database to default demonstration seed data?')) return;
  try {
    await api.resetSystem();
    showToast('Database reset to Indian baseline.', 'success');
    renderAdminDashboard(document.getElementById('viewContainer'));
  } catch (err) {
    showToast(`Reset error: ${err.message}`, 'error');
  }
}

// public/js/app.js

window.currentUser = null;
window.currentView = null;
window.isDeviceFrame = true; // Toggle between phone frame mockup and fluid full screen

// Initialize session from LocalStorage
function initSession() {
  const saved = localStorage.getItem('sanjeevani_user');
  if (saved) {
    try {
      window.currentUser = JSON.parse(saved);
    } catch (e) {
      window.currentUser = null;
    }
  }

  // If no session, default to Indian Pathologist (Suresh Verma)
  if (!window.currentUser) {
    window.currentUser = {
      id: "usr_lab1",
      name: "Suresh Verma",
      email: "lab@hospital.com",
      role: "lab_technician",
      title: "Lead Clinical Pathologist & Lab Supervisor",
      department: "Pathology & Blood Diagnostic Center",
      avatar: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=250"
    };
    localStorage.setItem('sanjeevani_user', JSON.stringify(window.currentUser));
  }
}

function setSession(user) {
  window.currentUser = user;
  localStorage.setItem('sanjeevani_user', JSON.stringify(user));
}

function clearSession() {
  window.currentUser = null;
  localStorage.removeItem('sanjeevani_user');
  const appEl = document.getElementById('app');
  if (appEl) renderLoginScreen(appEl);
}

function toggleDeviceFrame() {
  window.isDeviceFrame = !window.isDeviceFrame;
  renderAppShell();
}

// Master Toast notifications (mobile app snackbar style)
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  const colors = {
    success: 'bg-emerald-600 text-white shadow-emerald-900/30',
    error: 'bg-rose-600 text-white shadow-rose-900/30',
    info: 'bg-slate-900 text-white shadow-slate-900/30'
  };

  toast.className = `p-3 px-4 rounded-2xl shadow-xl text-xs font-bold flex items-center space-x-2.5 animate-in slide-in-from-top-3 duration-200 pointer-events-auto ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <span class="text-sm">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span class="flex-1">${message}</span>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition-opacity');
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// Switch view router
function navigateTo(viewName) {
  window.currentView = viewName;
  const container = document.getElementById('viewContainer');
  if (!container) return;

  // Scroll to top of content on view switch
  container.scrollTop = 0;

  // Update bottom nav bar active states
  document.querySelectorAll('.bottom-nav-tab').forEach(btn => {
    const tabTarget = btn.getAttribute('data-view');
    const label = btn.querySelector('.tab-label');
    const iconWrap = btn.querySelector('.tab-icon');
    
    if (tabTarget === viewName) {
      btn.classList.add('text-rose-600');
      btn.classList.remove('text-slate-400');
      if (iconWrap) iconWrap.classList.add('scale-110', 'bg-rose-50', 'text-rose-600');
      if (label) label.classList.add('font-extrabold', 'text-rose-600');
    } else {
      btn.classList.remove('text-rose-600');
      btn.classList.add('text-slate-400');
      if (iconWrap) iconWrap.classList.remove('scale-110', 'bg-rose-50', 'text-rose-600');
      if (label) {
        label.classList.remove('font-extrabold', 'text-rose-600');
        label.classList.add('font-semibold');
      }
    }
  });

  if (viewName === 'lab') {
    renderLabDashboard(container);
  } else if (viewName === 'doctor') {
    renderDoctorDashboard(container);
  } else if (viewName === 'reception') {
    renderReceptionDesk(container);
  } else if (viewName === 'pharmacy') {
    renderPharmacyBilling(container);
  } else if (viewName === 'patient') {
    renderPatientPortal(container);
  } else if (viewName === 'admin') {
    renderAdminDashboard(container);
  }
}

// Fast Role switcher
async function switchRoleAndNavigate(targetRole, targetEmail) {
  try {
    const res = await api.login(targetEmail || null, null, targetRole);
    setSession(res.user);
    closeModal();
    showToast(`Switched to ${res.user.name} (${res.user.role.replace('_', ' ')})`, 'success');
    renderAppShell();
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

// Mobile Bottom Sheet for Role Switching
function openRoleSwitcherSheet() {
  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  const roles = [
    { key: 'lab_technician', name: 'Suresh Verma', title: 'Lead Pathologist (Lab)', email: 'lab@hospital.com', icon: '🔬', color: 'border-rose-200 bg-rose-50/70 text-rose-800' },
    { key: 'doctor', name: 'Dr. Priya Nair', title: 'Chief Cardiologist (OPD)', email: 'doctor@hospital.com', icon: '🩺', color: 'border-blue-200 bg-blue-50/70 text-blue-800' },
    { key: 'receptionist', name: 'Ananya Deshmukh', title: 'Reception & Admissions', email: 'reception@hospital.com', icon: '📋', color: 'border-emerald-200 bg-emerald-50/70 text-emerald-800' },
    { key: 'pharmacist', name: 'Manoj Kumar', title: 'Chief Pharmacist & Billing', email: 'pharmacy@hospital.com', icon: '💊', color: 'border-purple-200 bg-purple-50/70 text-purple-800' },
    { key: 'admin', name: 'Dr. Arvind Sharma', title: 'Medical Director (Admin)', email: 'admin@hospital.com', icon: '👨‍💼', color: 'border-slate-300 bg-slate-100 text-slate-800' },
    { key: 'patient', name: 'Ramesh Patel', title: 'Patient Health Vault', email: 'patient@hospital.com', icon: '👤', color: 'border-teal-200 bg-teal-50/70 text-teal-800' }
  ];

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
      <div class="absolute inset-0" onclick="closeModal()"></div>
      <div class="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 space-y-4">
        
        <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>
        
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 class="text-base font-extrabold text-slate-900">Switch User / Medical Role</h3>
            <p class="text-xs text-slate-400">Select any hospital role to test its specific features</p>
          </div>
          <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">✕</button>
        </div>

        <div class="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
          ${roles.map(r => `
            <button onclick="switchRoleAndNavigate('${r.key}', '${r.email}')" class="p-3 rounded-2xl border ${r.color} flex items-center space-x-3 text-left transition hover:scale-[1.01] active:scale-[0.98]">
              <span class="text-2xl">${r.icon}</span>
              <div class="flex-1 overflow-hidden">
                <div class="font-extrabold text-xs text-slate-900 truncate">${r.name}</div>
                <div class="text-[10px] text-slate-500 font-medium truncate">${r.title}</div>
              </div>
              <span class="text-xs text-slate-400">➔</span>
            </button>
          `).join('')}
        </div>

        <button onclick="closeModal()" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">
          Cancel
        </button>

      </div>
    </div>
  `;
}

// Render complete Mobile App Shell
function renderAppShell() {
  const app = document.getElementById('app');
  if (!app) return;

  if (!window.currentUser) {
    renderLoginScreen(app);
    return;
  }

  const u = window.currentUser;
  
  let defaultView = 'lab';
  if (u.role === 'admin') defaultView = 'admin';
  else if (u.role === 'doctor') defaultView = 'doctor';
  else if (u.role === 'lab_technician') defaultView = 'lab';
  else if (u.role === 'receptionist') defaultView = 'reception';
  else if (u.role === 'pharmacist') defaultView = 'pharmacy';
  else if (u.role === 'patient') defaultView = 'patient';

  const frameClass = window.isDeviceFrame ? 'mobile-device-frame' : 'mobile-device-fluid';

  app.innerHTML = `
    <div class="min-h-screen bg-slate-900 py-0 sm:py-6 flex flex-col justify-center items-center">
      
      <!-- Top Desktop Controls bar: Device toggle & Quick Reset -->
      <div class="hidden sm:flex items-center justify-between w-full max-w-[440px] px-3 py-1.5 text-[11px] text-slate-400 mb-2">
        <button onclick="toggleDeviceFrame()" class="flex items-center space-x-1.5 text-slate-300 hover:text-white bg-slate-800 px-3 py-1 rounded-full border border-slate-700 transition">
          <span>${window.isDeviceFrame ? '📱 Smartphone View' : '🖥️ Wide View'}</span>
        </button>
        <span class="font-mono text-emerald-400 font-bold">● INR ₹ Enabled</span>
      </div>

      <!-- Smartphone Shell Container -->
      <div class="${frameClass} flex flex-col text-slate-800">
        
        <!-- Mobile Status Bar (iOS / Android style) -->
        <div class="no-print bg-slate-900 text-white px-5 pt-2 pb-1 flex items-center justify-between text-[11px] font-semibold select-none">
          <span class="font-mono font-bold tracking-tight">09:41</span>
          
          <!-- Dynamic Island / Speaker Notch -->
          <div class="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-center space-x-1">
            <span class="w-2 h-2 rounded-full bg-slate-800"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div class="flex items-center space-x-1.5 text-xs text-slate-300">
            <span>5G</span>
            <span>📶</span>
            <span>100%</span>
          </div>
        </div>

        <!-- Mobile Top App Bar -->
        <header class="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between shadow-sm">
          
          <div class="flex items-center space-x-2.5">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow">
              +
            </div>
            <div>
              <h1 class="text-xs font-extrabold text-slate-900 leading-none">Sanjeevani Hospital</h1>
              <p class="text-[9px] text-rose-600 font-bold tracking-wider uppercase mt-0.5">Blood Lab & HIS (₹)</p>
            </div>
          </div>

          <!-- User Pill / Avatar Tap to Switch Role -->
          <button onclick="openRoleSwitcherSheet()" class="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full border border-slate-200 transition">
            <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}" class="w-5 h-5 rounded-full object-cover">
            <span class="text-[10px] font-bold text-slate-800 truncate max-w-[80px]">${u.name.split(' ')[0]}</span>
            <span class="text-[8px] text-rose-600 font-bold">▼</span>
          </button>

        </header>

        <!-- Horizontal Quick Role Switcher Chips (Scrollable like Instagram/YouTube mobile apps) -->
        <div class="no-print bg-slate-50 border-b border-slate-200/70 px-3 py-2 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          
          <button onclick="switchRoleAndNavigate('lab_technician', 'lab@hospital.com')" 
            class="shrink-0 px-3 py-1 rounded-full text-[10px] font-bold transition flex items-center space-x-1 ${u.role === 'lab_technician' ? 'bg-rose-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'}">
            <span>🔬</span>
            <span>Blood Lab</span>
          </button>

          <button onclick="switchRoleAndNavigate('doctor', 'doctor@hospital.com')" 
            class="shrink-0 px-3 py-1 rounded-full text-[10px] font-bold transition flex items-center space-x-1 ${u.role === 'doctor' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'}">
            <span>🩺</span>
            <span>Dr. Priya</span>
          </button>

          <button onclick="switchRoleAndNavigate('receptionist', 'reception@hospital.com')" 
            class="shrink-0 px-3 py-1 rounded-full text-[10px] font-bold transition flex items-center space-x-1 ${u.role === 'receptionist' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'}">
            <span>📋</span>
            <span>Reception</span>
          </button>

          <button onclick="switchRoleAndNavigate('pharmacist', 'pharmacy@hospital.com')" 
            class="shrink-0 px-3 py-1 rounded-full text-[10px] font-bold transition flex items-center space-x-1 ${u.role === 'pharmacist' ? 'bg-purple-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'}">
            <span>💊</span>
            <span>Pharmacy</span>
          </button>

          <button onclick="switchRoleAndNavigate('patient', 'patient@hospital.com')" 
            class="shrink-0 px-3 py-1 rounded-full text-[10px] font-bold transition flex items-center space-x-1 ${u.role === 'patient' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'}">
            <span>👤</span>
            <span>Patient</span>
          </button>

          <button onclick="switchRoleAndNavigate('admin', 'admin@hospital.com')" 
            class="shrink-0 px-3 py-1 rounded-full text-[10px] font-bold transition flex items-center space-x-1 ${u.role === 'admin' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'}">
            <span>👨‍💼</span>
            <span>Admin</span>
          </button>

        </div>

        <!-- Main View Container (Scrollable screen with mobile bottom padding) -->
        <main class="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar bg-slate-50" id="viewContainer">
          <!-- View renders here -->
        </main>

        <!-- Native Mobile Bottom Navigation Bar -->
        <nav class="no-print bg-white/95 backdrop-blur-lg border-t border-slate-200/90 fixed sm:absolute bottom-0 left-0 right-0 z-40 px-2 py-1.5 flex items-center justify-around shadow-lg">
          
          <button onclick="navigateTo('lab')" data-view="lab" class="bottom-nav-tab flex flex-col items-center justify-center p-1 rounded-xl transition text-slate-400">
            <span class="tab-icon w-8 h-8 rounded-xl flex items-center justify-center text-lg transition">🔬</span>
            <span class="tab-label text-[9px] font-semibold mt-0.5">Blood Lab</span>
          </button>

          <button onclick="navigateTo('doctor')" data-view="doctor" class="bottom-nav-tab flex flex-col items-center justify-center p-1 rounded-xl transition text-slate-400">
            <span class="tab-icon w-8 h-8 rounded-xl flex items-center justify-center text-lg transition">🩺</span>
            <span class="tab-label text-[9px] font-semibold mt-0.5">Doctor</span>
          </button>

          <button onclick="navigateTo('reception')" data-view="reception" class="bottom-nav-tab flex flex-col items-center justify-center p-1 rounded-xl transition text-slate-400">
            <span class="tab-icon w-8 h-8 rounded-xl flex items-center justify-center text-lg transition">📋</span>
            <span class="tab-label text-[9px] font-semibold mt-0.5">Reception</span>
          </button>

          <button onclick="navigateTo('pharmacy')" data-view="pharmacy" class="bottom-nav-tab flex flex-col items-center justify-center p-1 rounded-xl transition text-slate-400">
            <span class="tab-icon w-8 h-8 rounded-xl flex items-center justify-center text-lg transition">💊</span>
            <span class="tab-label text-[9px] font-semibold mt-0.5">Pharmacy</span>
          </button>

          <button onclick="navigateTo('patient')" data-view="patient" class="bottom-nav-tab flex flex-col items-center justify-center p-1 rounded-xl transition text-slate-400">
            <span class="tab-icon w-8 h-8 rounded-xl flex items-center justify-center text-lg transition">👤</span>
            <span class="tab-label text-[9px] font-semibold mt-0.5">Patient</span>
          </button>

          <button onclick="navigateTo('admin')" data-view="admin" class="bottom-nav-tab flex flex-col items-center justify-center p-1 rounded-xl transition text-slate-400">
            <span class="tab-icon w-8 h-8 rounded-xl flex items-center justify-center text-lg transition">📊</span>
            <span class="tab-label text-[9px] font-semibold mt-0.5">Admin</span>
          </button>

        </nav>

        <!-- Mobile Toast Container -->
        <div id="toastContainer" class="fixed sm:absolute top-12 left-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none"></div>

        <!-- Mobile Bottom Sheet / Modal Root -->
        <div id="modalContainer"></div>

      </div>

    </div>
  `;

  navigateTo(defaultView);
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  initSession();
  renderAppShell();
});

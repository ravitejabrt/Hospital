// public/js/app.js
// Dual-Compatibility Architecture:
// 1. System / Desktop Compatibility: Full-width enterprise hospital management system (HMS) layout with sidebar & top bar
// 2. Mobile / Tablet Compatibility: Native smartphone app layout with bottom navigation bar & slide-up bottom sheets

window.currentUser = null;
window.currentView = null;
window.currentViewMode = 'desktop'; // 'desktop' or 'mobile'

// Auto-detect view mode based on screen width
function detectDeviceMode() {
  const saved = localStorage.getItem('sanjeevani_view_mode');
  if (saved === 'desktop' || saved === 'mobile') {
    return saved;
  }
  return window.innerWidth >= 1024 ? 'desktop' : 'mobile';
}

function initSession() {
  window.currentViewMode = detectDeviceMode();

  const saved = localStorage.getItem('sanjeevani_user');
  if (saved) {
    try {
      window.currentUser = JSON.parse(saved);
    } catch (e) {
      window.currentUser = null;
    }
  }

  // Default demo user: Indian Pathologist (Suresh Verma)
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

// Toggle between System / Desktop View and Mobile / Tablet View
function toggleViewMode(forceMode = null) {
  if (forceMode) {
    window.currentViewMode = forceMode;
  } else {
    window.currentViewMode = window.currentViewMode === 'desktop' ? 'mobile' : 'desktop';
  }
  localStorage.setItem('sanjeevani_view_mode', window.currentViewMode);
  renderAppShell();
  showToast(`Switched to ${window.currentViewMode === 'desktop' ? '🖥️ System (Desktop) View' : '📱 Mobile App View'}`, 'info');
}

// Window resize listener: automatically adapt if user resizes browser
window.addEventListener('resize', () => {
  const hasUserPreference = localStorage.getItem('sanjeevani_view_mode_locked');
  if (!hasUserPreference) {
    const detected = window.innerWidth >= 1024 ? 'desktop' : 'mobile';
    if (detected !== window.currentViewMode) {
      window.currentViewMode = detected;
      renderAppShell();
    }
  }
});

// Toast notifications
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

// Close Modal / Bottom Sheet
function closeModal() {
  const modalContainer = document.getElementById('modalContainer');
  if (modalContainer) modalContainer.innerHTML = '';
}

// Master Router
function navigateTo(viewName) {
  window.currentView = viewName;
  const container = document.getElementById('viewContainer');
  if (!container) return;

  container.scrollTop = 0;

  // Update Desktop Sidebar active state
  document.querySelectorAll('.desktop-nav-link').forEach(link => {
    const target = link.getAttribute('data-view');
    if (target === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update Mobile Bottom Nav active state
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

  // Render Target View
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

// Modal for switching roles
function openRoleSwitcherSheet() {
  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  const roles = [
    { key: 'lab_technician', name: 'Suresh Verma', title: 'Lead Pathologist (Blood Lab)', email: 'lab@hospital.com', icon: '🔬', color: 'border-rose-200 bg-rose-50/70 text-rose-800' },
    { key: 'doctor', name: 'Dr. Priya Nair', title: 'Chief Cardiologist (OPD)', email: 'doctor@hospital.com', icon: '🩺', color: 'border-blue-200 bg-blue-50/70 text-blue-800' },
    { key: 'receptionist', name: 'Ananya Deshmukh', title: 'Reception & IPD Bed Allocation', email: 'reception@hospital.com', icon: '📋', color: 'border-emerald-200 bg-emerald-50/70 text-emerald-800' },
    { key: 'pharmacist', name: 'Manoj Kumar', title: 'Chief Pharmacist & Billing Desk', email: 'pharmacy@hospital.com', icon: '💊', color: 'border-purple-200 bg-purple-50/70 text-purple-800' },
    { key: 'admin', name: 'Dr. Arvind Sharma', title: 'Medical Director (Admin)', email: 'admin@hospital.com', icon: '👨‍💼', color: 'border-slate-300 bg-slate-100 text-slate-800' },
    { key: 'patient', name: 'Ramesh Patel', title: 'Patient Health Portal', email: 'patient@hospital.com', icon: '👤', color: 'border-teal-200 bg-teal-50/70 text-teal-800' }
  ];

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
      <div class="absolute inset-0" onclick="closeModal()"></div>
      
      <div class="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 space-y-4">
        
        <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1 sm:hidden"></div>
        
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 class="text-base font-extrabold text-slate-900">Switch Medical Role</h3>
            <p class="text-xs text-slate-400">Select any hospital role to test its specific features</p>
          </div>
          <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center hover:bg-slate-200">✕</button>
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
          Close
        </button>

      </div>
    </div>
  `;
}

// ----------------------------------------------------
// RENDER MASTER APPLICATION SHELL
// ----------------------------------------------------
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

  if (!window.currentView) {
    window.currentView = defaultView;
  }

  if (window.currentViewMode === 'desktop') {
    renderDesktopSystemLayout(app, u);
  } else {
    renderMobileAppLayout(app, u);
  }

  navigateTo(window.currentView || defaultView);
}

// ----------------------------------------------------
// 1. DESKTOP / SYSTEM COMPATIBILITY LAYOUT
// ----------------------------------------------------
function renderDesktopSystemLayout(app, u) {
  const viewLabels = {
    lab: '🔬 Blood Test Center (LIS)',
    doctor: '🩺 Doctor Consultation Desk',
    reception: '📋 Reception & Inpatient Beds',
    pharmacy: '💊 Pharmacy & Billing Desk',
    patient: '👤 Patient Health Vault',
    admin: '📊 Executive Administration'
  };

  app.innerHTML = `
    <div class="min-h-screen bg-slate-100 flex flex-row text-slate-800">
      
      <!-- DESKTOP ENTERPRISE SIDEBAR -->
      <aside class="desktop-sidebar">
        
        <!-- Hospital Branding -->
        <div class="p-5 border-b border-slate-800">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-500/20">
              +
            </div>
            <div class="overflow-hidden">
              <h1 class="text-sm font-extrabold text-white leading-tight truncate">Sanjeevani Hospital</h1>
              <p class="text-[10px] text-rose-400 font-bold tracking-wider uppercase">Blood Diagnostic HIS</p>
            </div>
          </div>
          <div class="mt-2.5 inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-[9px] font-mono text-emerald-400 border border-slate-700">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>NABL & NABH Accredited • ₹ INR</span>
          </div>
        </div>

        <!-- Active User Profile Card in Sidebar -->
        <div class="p-4 mx-3 my-3 bg-slate-800/80 rounded-2xl border border-slate-700/80">
          <div class="flex items-center space-x-3">
            <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}" class="w-10 h-10 rounded-xl object-cover border border-slate-600">
            <div class="overflow-hidden flex-1">
              <div class="font-bold text-xs text-white truncate">${u.name}</div>
              <div class="text-[10px] text-slate-400 truncate">${u.title || u.role.replace('_', ' ')}</div>
            </div>
          </div>
          <button onclick="openRoleSwitcherSheet()" class="mt-2.5 w-full py-1 px-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition flex items-center justify-center space-x-1">
            <span>⇄ Switch Role</span>
          </button>
        </div>

        <!-- Desktop Navigation Menu -->
        <nav class="flex-1 px-3 space-y-1.5 overflow-y-auto no-scrollbar">
          
          <button onclick="navigateTo('lab')" data-view="lab" class="desktop-nav-link w-full text-left">
            <span class="text-base mr-3">🔬</span>
            <span class="flex-1">Blood Test Center (LIS)</span>
          </button>

          <button onclick="navigateTo('doctor')" data-view="doctor" class="desktop-nav-link w-full text-left">
            <span class="text-base mr-3">🩺</span>
            <span class="flex-1">Doctor Desk (OPD)</span>
          </button>

          <button onclick="navigateTo('reception')" data-view="reception" class="desktop-nav-link w-full text-left">
            <span class="text-base mr-3">📋</span>
            <span class="flex-1">Reception & IPD Beds</span>
          </button>

          <button onclick="navigateTo('pharmacy')" data-view="pharmacy" class="desktop-nav-link w-full text-left">
            <span class="text-base mr-3">💊</span>
            <span class="flex-1">Pharmacy & Billing Desk</span>
          </button>

          <button onclick="navigateTo('patient')" data-view="patient" class="desktop-nav-link w-full text-left">
            <span class="text-base mr-3">👤</span>
            <span class="flex-1">Patient Portal (EHR)</span>
          </button>

          <button onclick="navigateTo('admin')" data-view="admin" class="desktop-nav-link w-full text-left">
            <span class="text-base mr-3">📊</span>
            <span class="flex-1">Hospital Admin & KPIs</span>
          </button>

        </nav>

        <!-- Sidebar Footer & Controls -->
        <div class="p-4 border-t border-slate-800 space-y-2">
          
          <!-- Toggle View Mode Button -->
          <button onclick="toggleViewMode('mobile')" class="w-full py-2 px-3 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-200 text-xs font-bold transition flex items-center justify-center space-x-2">
            <span>📱</span>
            <span>Switch to Mobile View</span>
          </button>

          <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <button onclick="api.resetSystem().then(() => { showToast('Database reset to Indian seed', 'success'); renderAppShell(); })" class="text-slate-400 hover:text-white transition">
              ↻ Reset Data
            </button>
            <button onclick="clearSession()" class="text-rose-400 hover:text-rose-300 font-bold transition">
              Sign Out ➔
            </button>
          </div>

        </div>

      </aside>

      <!-- DESKTOP MAIN WORKSPACE -->
      <div class="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        <!-- DESKTOP TOP HEADER BAR -->
        <header class="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-xs">
          
          <div class="flex items-center space-x-4">
            <span class="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Console:</span>
            <h2 id="desktopViewHeaderTitle" class="text-sm font-extrabold text-slate-900">${viewLabels[window.currentView] || 'Hospital Management System'}</h2>
          </div>

          <!-- Quick Horizontal Role Switching Pills -->
          <div class="hidden xl:flex items-center space-x-2">
            <span class="text-[10px] text-slate-400 font-bold uppercase mr-1">Quick Switch:</span>
            
            <button onclick="switchRoleAndNavigate('lab_technician', 'lab@hospital.com')" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border ${u.role === 'lab_technician' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}">
              🔬 Suresh (Lab)
            </button>
            <button onclick="switchRoleAndNavigate('doctor', 'doctor@hospital.com')" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border ${u.role === 'doctor' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}">
              🩺 Dr. Priya
            </button>
            <button onclick="switchRoleAndNavigate('receptionist', 'reception@hospital.com')" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border ${u.role === 'receptionist' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}">
              📋 Reception
            </button>
            <button onclick="switchRoleAndNavigate('pharmacist', 'pharmacy@hospital.com')" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border ${u.role === 'pharmacist' ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}">
              💊 Pharmacy
            </button>
            <button onclick="switchRoleAndNavigate('admin', 'admin@hospital.com')" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border ${u.role === 'admin' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}">
              👨‍💼 Admin
            </button>
          </div>

          <!-- Right Action Controls -->
          <div class="flex items-center space-x-3">
            
            <button onclick="toggleViewMode('mobile')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-1.5 transition">
              <span>📱</span>
              <span>Mobile View</span>
            </button>

            <!-- User Avatar & Details -->
            <div class="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}" class="w-8 h-8 rounded-full object-cover">
              <div class="hidden sm:block text-left">
                <div class="text-xs font-bold text-slate-900">${u.name}</div>
                <div class="text-[10px] text-emerald-600 font-semibold font-mono">₹ INR Active</div>
              </div>
            </div>

          </div>

        </header>

        <!-- DESKTOP SCROLLABLE CONTENT CANVAS -->
        <main class="flex-1 p-6 overflow-y-auto" id="viewContainer">
          <!-- Views render inside here -->
        </main>

      </div>

      <!-- Desktop Toast Notifications -->
      <div id="toastContainer" class="fixed top-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none"></div>

      <!-- Desktop Modals -->
      <div id="modalContainer"></div>

    </div>
  `;
}

// ----------------------------------------------------
// 2. MOBILE / TABLET COMPATIBILITY LAYOUT
// ----------------------------------------------------
function renderMobileAppLayout(app, u) {
  const isActualMobile = window.innerWidth < 1024;
  const outerWrapperClass = isActualMobile ? 'w-full min-h-screen bg-slate-50' : 'min-h-screen bg-slate-900 py-4 flex flex-col items-center justify-center';
  const containerClass = isActualMobile ? 'w-full min-h-screen bg-slate-50 flex flex-col' : 'mobile-preview-frame bg-slate-50 flex flex-col';

  app.innerHTML = `
    <div class="${outerWrapperClass}">
      
      <!-- Desktop Toggle Banner (Only shown if testing mobile mode on a desktop screen) -->
      ${!isActualMobile ? `
        <div class="flex items-center justify-between w-full max-w-[430px] px-3 py-1 text-xs text-slate-300 mb-2">
          <span class="font-mono text-emerald-400 font-bold">● Mobile App Preview</span>
          <button onclick="toggleViewMode('desktop')" class="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-600 transition">
            🖥️ Return to System View
          </button>
        </div>
      ` : ''}

      <!-- Smartphone / Tablet App Container -->
      <div class="${containerClass}">
        
        <!-- Mobile Top App Bar -->
        <header class="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between shadow-xs">
          
          <div class="flex items-center space-x-2.5">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow">
              +
            </div>
            <div>
              <h1 class="text-xs font-extrabold text-slate-900 leading-none">Sanjeevani Hospital</h1>
              <p class="text-[9px] text-rose-600 font-bold tracking-wider uppercase mt-0.5">Blood Lab & HIS (₹ INR)</p>
            </div>
          </div>

          <!-- Switch to Desktop or User Pill -->
          <div class="flex items-center space-x-2">
            ${isActualMobile ? `
              <button onclick="toggleViewMode('desktop')" class="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-200">
                🖥️ Desktop
              </button>
            ` : ''}

            <!-- User Avatar & Role Switcher -->
            <button onclick="openRoleSwitcherSheet()" class="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full border border-slate-200 transition">
              <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}" class="w-5 h-5 rounded-full object-cover">
              <span class="text-[10px] font-bold text-slate-800 truncate max-w-[75px]">${u.name.split(' ')[0]}</span>
              <span class="text-[8px] text-rose-600 font-bold">▼</span>
            </button>
          </div>

        </header>

        <!-- Horizontal Quick Role Switcher Chips -->
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

        <!-- Scrollable Content Screen -->
        <main class="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar bg-slate-50" id="viewContainer">
          <!-- Views render inside here -->
        </main>

        <!-- Native Mobile Bottom Navigation Bar -->
        <nav class="no-print bg-white/95 backdrop-blur-lg border-t border-slate-200/90 fixed bottom-0 left-0 right-0 z-40 px-2 py-1.5 flex items-center justify-around shadow-lg">
          
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
        <div id="toastContainer" class="fixed top-12 left-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none"></div>

        <!-- Mobile Bottom Sheet / Modal Root -->
        <div id="modalContainer"></div>

      </div>

    </div>
  `;
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  initSession();
  renderAppShell();
});

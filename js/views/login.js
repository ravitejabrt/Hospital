// public/js/views/login.js

function renderLoginScreen(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50">
      
      <div class="max-w-md w-full space-y-6">
        
        <!-- Hospital Branding Logo -->
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-sky-500 text-white font-extrabold text-3xl shadow-xl shadow-indigo-500/20 mb-3">
            +
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Sanjeevani Hospital & Blood Diagnostic Center</h2>
          <p class="text-xs text-slate-500 mt-1">Multi-Role Hospital Information & LIS System • New Delhi, India</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200/80 sm:px-10">
          <form onsubmit="handleFormLogin(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <input type="email" id="loginEmail" required value="lab@hospital.com" placeholder="name@hospital.com" 
                class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Password</label>
              <input type="password" id="loginPassword" required value="lab" placeholder="••••••••" 
                class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition">
            </div>

            <button type="submit" class="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition transform active:scale-[0.99]">
              Sign In to Medical Console
            </button>
          </form>

          <!-- 1-Click Role Demo Logins Divider -->
          <div class="mt-6 pt-5 border-t border-slate-100">
            <span class="block text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              ⚡ Quick 1-Click Role Demo Logins:
            </span>

            <div class="grid grid-cols-2 gap-2 text-left">
              
              <button onclick="quickRoleLogin('lab')" class="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/80 transition flex items-center space-x-2 group">
                <span class="text-lg">🔬</span>
                <div class="overflow-hidden">
                  <div class="font-bold text-[11px] text-rose-900 group-hover:text-rose-700 truncate">Suresh Verma</div>
                  <div class="text-[9px] text-rose-600 font-mono truncate">Blood Lab Tech</div>
                </div>
              </button>

              <button onclick="quickRoleLogin('doctor')" class="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/80 transition flex items-center space-x-2 group">
                <span class="text-lg">🩺</span>
                <div class="overflow-hidden">
                  <div class="font-bold text-[11px] text-blue-900 group-hover:text-blue-700 truncate">Dr. Priya Nair</div>
                  <div class="text-[9px] text-blue-600 font-mono truncate">Chief Cardiologist</div>
                </div>
              </button>

              <button onclick="quickRoleLogin('reception')" class="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/80 transition flex items-center space-x-2 group">
                <span class="text-lg">📋</span>
                <div class="overflow-hidden">
                  <div class="font-bold text-[11px] text-emerald-900 group-hover:text-emerald-700 truncate">Ananya Deshmukh</div>
                  <div class="text-[9px] text-emerald-600 font-mono truncate">Reception & IPD</div>
                </div>
              </button>

              <button onclick="quickRoleLogin('admin')" class="p-2.5 rounded-xl border border-slate-300 bg-slate-50/80 hover:bg-slate-100 transition flex items-center space-x-2 group">
                <span class="text-lg">👨‍💼</span>
                <div class="overflow-hidden">
                  <div class="font-bold text-[11px] text-slate-900 group-hover:text-slate-700 truncate">Dr. Arvind Sharma</div>
                  <div class="text-[9px] text-slate-500 font-mono truncate">Medical Director</div>
                </div>
              </button>

              <button onclick="quickRoleLogin('pharmacy')" class="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/80 transition flex items-center space-x-2 group">
                <span class="text-lg">💊</span>
                <div class="overflow-hidden">
                  <div class="font-bold text-[11px] text-purple-900 group-hover:text-purple-700 truncate">Manoj Kumar</div>
                  <div class="text-[9px] text-purple-600 font-mono truncate">Chief Pharmacist</div>
                </div>
              </button>

              <button onclick="quickRoleLogin('patient')" class="p-2.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/80 transition flex items-center space-x-2 group">
                <span class="text-lg">👤</span>
                <div class="overflow-hidden">
                  <div class="font-bold text-[11px] text-teal-900 group-hover:text-teal-700 truncate">Ramesh Patel</div>
                  <div class="text-[9px] text-teal-600 font-mono truncate">Patient Portal</div>
                </div>
              </button>

            </div>
          </div>

        </div>

        <p class="text-center text-[11px] text-slate-400">
          Sanjeevani Health System • NABL Accredited Diagnostics • NABH Certified
        </p>

      </div>
    </div>
  `;
}

async function handleFormLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await api.login(email, password);
    setSession(res.user);
    showToast(`Welcome, ${res.user.name}!`, 'success');
    renderAppShell();
  } catch (err) {
    showToast(`Login failed: ${err.message}`, 'error');
  }
}

async function quickRoleLogin(roleShortcut) {
  const emailMap = {
    'admin': 'admin@hospital.com',
    'doctor': 'doctor@hospital.com',
    'lab': 'lab@hospital.com',
    'reception': 'reception@hospital.com',
    'pharmacy': 'pharmacy@hospital.com',
    'patient': 'patient@hospital.com'
  };

  const email = emailMap[roleShortcut] || `${roleShortcut}@hospital.com`;
  try {
    const res = await api.login(email, roleShortcut);
    setSession(res.user);
    showToast(`Logged in as ${res.user.name} (${res.user.role})`, 'success');
    renderAppShell();
  } catch (err) {
    showToast(`Quick login failed: ${err.message}`, 'error');
  }
}

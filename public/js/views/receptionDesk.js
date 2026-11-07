// public/js/views/receptionDesk.js

let recPatients = [];
let recAppointments = [];
let recBeds = [];
let recLabCatalog = [];
let currentRecTab = 'patients';

async function renderReceptionDesk(container) {
  try {
    const [patRes, aptRes, bedsRes, catRes] = await Promise.all([
      api.getPatients(),
      api.getAppointments(),
      api.getBeds(),
      api.getLabCatalog()
    ]);

    recPatients = patRes.patients || [];
    recAppointments = aptRes.appointments || [];
    recBeds = bedsRes.beds || [];
    recLabCatalog = catRes.catalog || [];

    const totalBeds = recBeds.length;
    const occupiedBeds = recBeds.filter(b => b.status === 'OCCUPIED').length;
    const availableBeds = totalBeds - occupiedBeds;

    container.innerHTML = `
      <div class="space-y-4">
        
        <!-- Mobile Header Card -->
        <div class="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div class="flex items-center space-x-1.5 text-emerald-200 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span>📋 Patient Services & Admissions</span>
          </div>
          <h2 class="text-lg font-extrabold tracking-tight">Reception & Admissions</h2>
          <p class="text-emerald-100/90 text-xs mt-0.5">
            Register patients, allocate IPD beds, and issue doctor tokens.
          </p>

          <div class="mt-3 flex items-center space-x-2">
            <button onclick="openRegisterPatientModal()" class="flex-1 py-2 bg-white text-emerald-800 text-xs font-bold rounded-xl shadow transition flex items-center justify-center space-x-1 touch-btn">
              <span>+</span>
              <span>Register Patient</span>
            </button>
            <button onclick="openBookAptModal()" class="py-2 px-3 bg-emerald-800/80 text-white text-xs font-semibold rounded-xl border border-emerald-400/30 transition touch-btn">
              + OPD Token
            </button>
          </div>
        </div>

        <!-- 2x2 Metric Grid -->
        <div class="grid grid-cols-2 gap-2.5">
          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              👥
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Patients</span>
              <span class="text-lg font-extrabold text-slate-900">${recPatients.length}</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              📅
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">OPD Tokens</span>
              <span class="text-lg font-extrabold text-blue-600">${recAppointments.length}</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
              🛏️
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Beds Occupied</span>
              <span class="text-lg font-extrabold text-amber-600">${occupiedBeds}/${totalBeds}</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
              🚪
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Beds Ready</span>
              <span class="text-lg font-extrabold text-teal-600">${availableBeds}</span>
            </div>
          </div>
        </div>

        <!-- Segmented Tab Bar -->
        <div class="bg-slate-200/80 p-1 rounded-2xl flex items-center space-x-1 text-xs">
          <button onclick="switchRecTab('patients')" class="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition text-center ${currentRecTab === 'patients' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'}">
            Patients (${recPatients.length})
          </button>
          <button onclick="switchRecTab('appointments')" class="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition text-center ${currentRecTab === 'appointments' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'}">
            Tokens (${recAppointments.length})
          </button>
          <button onclick="switchRecTab('beds')" class="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition text-center ${currentRecTab === 'beds' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'}">
            IPD Beds (${totalBeds})
          </button>
        </div>

        <!-- Content Area -->
        <div id="recTabContent" class="space-y-3"></div>

      </div>
    `;

    renderRecCurrentTab();
  } catch (err) {
    container.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-2xl text-xs">Error loading reception desk: ${err.message}</div>`;
  }
}

function switchRecTab(tab) {
  currentRecTab = tab;
  renderRecCurrentTab();
}

function renderRecCurrentTab() {
  const content = document.getElementById('recTabContent');
  if (!content) return;

  if (currentRecTab === 'patients') {
    renderRecPatientsCards(content);
  } else if (currentRecTab === 'appointments') {
    renderRecAppointmentsCards(content);
  } else if (currentRecTab === 'beds') {
    renderRecBedsCards(content);
  }
}

// ----------------------------------------------------
// PATIENTS CARDS
// ----------------------------------------------------
function renderRecPatientsCards(target) {
  target.innerHTML = `
    <div class="space-y-3">
      <input type="text" id="recSearchPatient" onkeyup="filterRecPatients()" placeholder="🔍 Search patient by name, ID, phone..." 
        class="w-full px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none">

      <div id="recPatientsContainer" class="space-y-2.5">
        ${generateRecPatientsCards(recPatients)}
      </div>
    </div>
  `;
}

function generateRecPatientsCards(patients) {
  if (patients.length === 0) {
    return `<div class="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">No patients registered</div>`;
  }

  return patients.map(p => `
    <div class="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-sm space-y-2">
      <div class="flex items-start justify-between">
        <div>
          <div class="font-bold text-xs text-slate-900">${p.name}</div>
          <div class="text-[10px] text-slate-400 font-mono">${p.id} • ${p.age}y ${p.gender}</div>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          ${p.bloodGroup || 'O+'}
        </span>
      </div>

      <div class="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl flex items-center justify-between">
        <span>📱 ${p.phone}</span>
        <span class="font-mono">BP: ${p.vitals ? p.vitals.bloodPressure : '120/80'}</span>
      </div>

      <div class="flex items-center space-x-1.5 pt-1">
        <button onclick="openBookAptForPatient('${p.id}')" class="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[10px] font-bold transition touch-btn">
          Book OPD
        </button>
        <button onclick="openLabOrderForPatient('${p.id}')" class="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-[10px] font-bold transition touch-btn">
          Blood Test
        </button>
        <button onclick="viewPatientMedicalFile('${p.id}')" class="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-semibold transition touch-btn">
          File
        </button>
      </div>
    </div>
  `).join('');
}

function filterRecPatients() {
  const q = (document.getElementById('recSearchPatient')?.value || '').toLowerCase();
  const filtered = recPatients.filter(p => 
    p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.phone && p.phone.includes(q))
  );
  const container = document.getElementById('recPatientsContainer');
  if (container) container.innerHTML = generateRecPatientsCards(filtered);
}

// ----------------------------------------------------
// OPD TOKENS CARDS
// ----------------------------------------------------
function renderRecAppointmentsCards(target) {
  target.innerHTML = `
    <div class="space-y-2.5">
      ${recAppointments.map(a => `
        <div class="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-sm flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center font-mono font-extrabold text-sm text-blue-700">
              ${a.token}
            </div>
            <div>
              <div class="font-bold text-xs text-slate-900">${a.patientName}</div>
              <div class="text-[10px] text-slate-500">${a.doctorName} • ${a.time}</div>
            </div>
          </div>
          <div class="text-right">
            <span class="font-mono font-bold text-xs text-slate-900 block">₹${(a.fee || 600).toFixed(2)}</span>
            <span class="px-2 py-0.5 rounded-full text-[8px] font-bold ${a.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
              ${a.status}
            </span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ----------------------------------------------------
// IPD BEDS CARDS
// ----------------------------------------------------
function renderRecBedsCards(target) {
  target.innerHTML = `
    <div class="grid grid-cols-2 gap-2.5">
      ${recBeds.map(b => {
        const isOcc = b.status === 'OCCUPIED';
        return `
          <div class="bg-white rounded-2xl border ${isOcc ? 'border-rose-200 bg-rose-50/20' : 'border-emerald-200 bg-emerald-50/20'} p-3 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="font-mono font-extrabold text-xs text-slate-900">${b.number}</span>
                <span class="px-1.5 py-0.5 rounded text-[8px] font-bold ${isOcc ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
                  ${isOcc ? 'Occ' : 'Free'}
                </span>
              </div>
              <div class="text-[10px] font-bold text-slate-800 truncate">${b.ward}</div>
              <div class="text-[9px] text-slate-500 font-mono">₹${b.dailyRate}/day</div>

              ${isOcc ? `
                <div class="mt-2 p-1.5 bg-white rounded-xl border border-rose-100 text-[10px]">
                  <span class="font-bold text-slate-900 block truncate">${b.patientName}</span>
                </div>
              ` : `
                <div class="py-2 text-center text-[10px] text-emerald-700 font-bold">
                  ✓ Available
                </div>
              `}
            </div>

            <div class="mt-2.5">
              ${isOcc ? `
                <button onclick="dischargeBedPatient('${b.id}')" class="w-full py-1.5 bg-slate-800 text-white rounded-xl text-[10px] font-bold touch-btn">
                  Discharge
                </button>
              ` : `
                <button onclick="openAdmitBedModal('${b.id}')" class="w-full py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-bold touch-btn">
                  Admit
                </button>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ----------------------------------------------------
// MODAL: REGISTER PATIENT (MOBILE BOTTOM SHEET)
// ----------------------------------------------------
function openRegisterPatientModal() {
  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
      <div class="absolute inset-0" onclick="closeModal()"></div>
      <div class="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 max-h-[92vh] flex flex-col">
        
        <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-2"></div>

        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <h3 class="text-sm font-extrabold text-slate-900">New Patient Registration</h3>
          <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">✕</button>
        </div>

        <form onsubmit="submitNewPatient(event)" class="space-y-3 text-xs overflow-y-auto no-scrollbar flex-1 pr-1">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input type="text" id="regName" required placeholder="e.g. Amit Kumar" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs">
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Age *</label>
              <input type="number" id="regAge" required placeholder="32" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Gender *</label>
              <select id="regGender" class="w-full px-2 py-2 border border-slate-200 rounded-xl text-xs">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Blood *</label>
              <select id="regBlood" class="w-full px-2 py-2 border border-slate-200 rounded-xl text-xs">
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Phone (+91) *</label>
            <input type="text" id="regPhone" required placeholder="+91 98765 43210" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">City / Address</label>
            <input type="text" id="regAddress" placeholder="Lajpat Nagar, New Delhi" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs">
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center space-x-2">
            <button type="button" onclick="closeModal()" class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm touch-btn">Register</button>
          </div>
        </form>

      </div>
    </div>
  `;
}

async function submitNewPatient(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const age = document.getElementById('regAge').value;
  const gender = document.getElementById('regGender').value;
  const bloodGroup = document.getElementById('regBlood').value;
  const phone = document.getElementById('regPhone').value;
  const address = document.getElementById('regAddress').value;

  try {
    const res = await api.createPatient({
      name, age, gender, bloodGroup, phone, address,
      allergies: ['None'],
      vitals: { bloodPressure: "120/80 mmHg", pulse: 72, spO2: 99, temperature: "98.6 °F", bmi: "23.5" }
    });
    closeModal();
    showToast(`Registered ${name}! ID: ${res.patient.id}`, 'success');
    renderReceptionDesk(document.getElementById('viewContainer'));
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

// ----------------------------------------------------
// MODAL: BOOK APPOINTMENT (BOTTOM SHEET)
// ----------------------------------------------------
function openBookAptModal(preselectedPatientId = '') {
  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
      <div class="absolute inset-0" onclick="closeModal()"></div>
      <div class="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 space-y-3">
        
        <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>
        
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-sm font-extrabold text-slate-900">Book OPD Token</h3>
          <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">✕</button>
        </div>

        <form onsubmit="submitBookAppointment(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Patient *</label>
            <select id="aptPatientId" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50">
              <option value="">-- Select Patient --</option>
              ${recPatients.map(p => `<option value="${p.id}" ${p.id === preselectedPatientId ? 'selected' : ''}>${p.name} (${p.id})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Consulting Doctor *</label>
            <select id="aptDoctorName" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50">
              <option value="Dr. Priya Nair">Dr. Priya Nair (Cardiology - ₹800)</option>
              <option value="Dr. Rajesh Kulkarni">Dr. Rajesh Kulkarni (General Medicine - ₹500)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Clinical Reason</label>
            <input type="text" id="aptReason" placeholder="e.g. Chest pain follow-up..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs">
          </div>

          <div class="pt-2 flex items-center space-x-2">
            <button type="button" onclick="closeModal()" class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-sm touch-btn">
              Issue Token
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}

function openBookAptForPatient(pId) {
  openBookAptModal(pId);
}

function openLabOrderForPatient(pId) {
  openNewLabOrderModal();
  setTimeout(() => {
    const sel = document.getElementById('modalOrderPatientId');
    if (sel) sel.value = pId;
  }, 50);
}

async function submitBookAppointment(e) {
  e.preventDefault();
  const patientId = document.getElementById('aptPatientId').value;
  const doctorName = document.getElementById('aptDoctorName').value;
  const date = new Date().toISOString().split('T')[0];
  const time = "10:30 AM";
  const reason = document.getElementById('aptReason').value;

  try {
    const res = await api.createAppointment({ patientId, doctorName, date, time, reason });
    closeModal();
    showToast(`Token issued: ${res.appointment.token}`, 'success');
    renderReceptionDesk(document.getElementById('viewContainer'));
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// ----------------------------------------------------
// IPD ADMIT / DISCHARGE (BOTTOM SHEET)
// ----------------------------------------------------
function openAdmitBedModal(bedId) {
  const bed = recBeds.find(b => b.id === bedId);
  if (!bed) return;

  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
      <div class="absolute inset-0" onclick="closeModal()"></div>
      <div class="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 space-y-3">
        
        <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>

        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-sm font-extrabold text-slate-900">Admit to ${bed.number}</h3>
          <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">✕</button>
        </div>

        <form onsubmit="submitAdmitBed(event, '${bed.id}')" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Ward / Daily Rate</label>
            <input type="text" disabled value="${bed.ward} (₹${bed.dailyRate}/day)" class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Select Patient *</label>
            <select id="admitPatientId" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50">
              <option value="">-- Choose patient --</option>
              ${recPatients.map(p => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('')}
            </select>
          </div>

          <div class="pt-2 flex items-center space-x-2">
            <button type="button" onclick="closeModal()" class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm touch-btn">
              Admit
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}

async function submitAdmitBed(e, bedId) {
  e.preventDefault();
  const patientId = document.getElementById('admitPatientId').value;
  try {
    const res = await api.admitPatient(bedId, patientId);
    closeModal();
    showToast(res.message, 'success');
    renderReceptionDesk(document.getElementById('viewContainer'));
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function dischargeBedPatient(bedId) {
  if (!confirm('Confirm discharge for this patient?')) return;
  try {
    const res = await api.dischargePatient(bedId);
    showToast(res.message, 'info');
    renderReceptionDesk(document.getElementById('viewContainer'));
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

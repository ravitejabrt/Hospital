// public/js/views/doctorDashboard.js

let doctorApts = [];
let doctorPatients = [];
let doctorLabOrders = [];
let doctorCatalog = [];

async function renderDoctorDashboard(container) {
  try {
    const [aptsRes, patRes, labRes, catRes] = await Promise.all([
      api.getAppointments(),
      api.getPatients(),
      api.getLabOrders(),
      api.getLabCatalog()
    ]);

    doctorApts = aptsRes.appointments || [];
    doctorPatients = patRes.patients || [];
    doctorLabOrders = labRes.orders || [];
    doctorCatalog = catRes.catalog || [];

    const activeUser = window.currentUser || { name: "Dr. Priya Nair", specialty: "Chief Cardiologist" };
    
    const myApts = doctorApts;
    const waitingTokens = myApts.filter(a => a.status === 'WAITING' || a.status === 'SCHEDULED');
    const completedApts = myApts.filter(a => a.status === 'COMPLETED');
    const myPatientLabReports = doctorLabOrders.filter(o => o.status === 'COMPLETED');

    container.innerHTML = `
      <div class="space-y-4">
        
        <!-- Mobile Doctor Header Card -->
        <div class="gradient-header rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div class="flex items-center space-x-3">
            <img src="${activeUser.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250'}" class="w-12 h-12 rounded-2xl object-cover border-2 border-white/50 shadow">
            <div>
              <div class="flex items-center space-x-1.5 text-sky-200 text-[10px] font-bold uppercase tracking-wider">
                <span>🩺 OPD Clinic Suite 204</span>
              </div>
              <h2 class="text-base font-extrabold tracking-tight">${activeUser.name}</h2>
              <p class="text-sky-100/90 text-[11px]">Cardiology & Medicine (₹800 fee)</p>
            </div>
          </div>
          
          <div class="mt-3 flex items-center space-x-2">
            <button onclick="openNewConsultationModal()" class="flex-1 py-2 bg-white text-blue-700 text-xs font-bold rounded-xl shadow transition flex items-center justify-center space-x-1 touch-btn">
              <span>+</span>
              <span>New Prescription</span>
            </button>
            <button onclick="openNewLabOrderModal()" class="py-2 px-3 bg-rose-600 text-white text-xs font-bold rounded-xl shadow transition touch-btn">
              🩸 Lab Test
            </button>
          </div>
        </div>

        <!-- 2x2 on Mobile, 4-Cols on Desktop -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              📅
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Appointments</span>
              <span class="text-lg font-extrabold text-slate-900">${myApts.length}</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
              ⏳
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">In Queue</span>
              <span class="text-lg font-extrabold text-amber-600">${waitingTokens.length}</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Done</span>
              <span class="text-lg font-extrabold text-emerald-600">${completedApts.length}</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
              🔬
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Lab Reports</span>
              <span class="text-lg font-extrabold text-rose-600">${myPatientLabReports.length}</span>
            </div>
          </div>
        </div>

        <!-- OPD Patient Queue Section -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">OPD Patient Queue</h3>
            <span class="text-[10px] text-blue-600 font-bold font-mono">${waitingTokens.length} Pending</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            ${myApts.length === 0 ? `
              <div class="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">No scheduled patients today</div>
            ` : myApts.map(a => {
              const patient = doctorPatients.find(p => p.id === a.patientId);
              return `
                <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-2.5">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center space-x-2.5">
                      <div class="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center font-mono font-extrabold text-sm text-blue-700">
                        ${a.token}
                      </div>
                      <div>
                        <div class="font-bold text-xs text-slate-900">${a.patientName}</div>
                        <div class="text-[10px] text-slate-400 font-mono">${a.patientId} • Blood: <span class="text-rose-600 font-bold">${patient ? patient.bloodGroup : 'O+'}</span></div>
                      </div>
                    </div>
                    <div>
                      ${a.status === 'COMPLETED' ? `
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">Done</span>
                      ` : a.status === 'WAITING' ? `
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 animate-pulse">Waiting</span>
                      ` : `
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800">Scheduled</span>
                      `}
                    </div>
                  </div>

                  <div class="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl">
                    <span class="text-slate-400 font-medium">Slot:</span> <span class="font-bold text-slate-700 font-mono">${a.time}</span> • <span class="text-slate-700">${a.reason}</span>
                  </div>

                  <div class="flex items-center space-x-2 pt-1 border-t border-slate-100">
                    <button onclick="openConsultPatientModal('${a.id}')" class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm touch-btn">
                      🩺 Consult
                    </button>
                    <button onclick="viewPatientMedicalFile('${a.patientId}')" class="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition touch-btn">
                      Medical File
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Recent Patient Blood Reports Section -->
        <div class="space-y-2.5 pt-2">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Patient Lab Results</h3>
            <span class="text-[10px] text-rose-600 font-bold">${myPatientLabReports.length} Available</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            ${myPatientLabReports.slice(0, 4).map(r => {
              const hasAbnormal = (r.results || []).some(item => item.flag && item.flag !== 'NORMAL');
              return `
                <div class="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between touch-btn cursor-pointer shadow-sm" onclick="viewReport('${r.id}')">
                  <div class="flex-1 pr-2">
                    <div class="flex items-center space-x-2">
                      <span class="font-bold text-xs text-slate-900">${r.patientName}</span>
                      ${hasAbnormal ? `<span class="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-100 text-amber-800">⚠️ Abnormal</span>` : `<span class="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-100 text-emerald-800">✓ Normal</span>`}
                    </div>
                    <div class="text-[10px] text-slate-500 mt-0.5">${r.testName}</div>
                  </div>
                  <span class="text-xs text-rose-600 font-bold">View ➔</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-2xl text-xs">Error loading doctor view: ${err.message}</div>`;
  }
}

// ----------------------------------------------------
// MODAL: PATIENT CONSULTATION (MOBILE BOTTOM SHEET)
// ----------------------------------------------------
function openConsultPatientModal(aptId) {
  const apt = doctorApts.find(a => a.id === aptId);
  if (!apt) return;

  const patient = doctorPatients.find(p => p.id === apt.patientId);
  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
      <div class="absolute inset-0" onclick="closeModal()"></div>
      <div class="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 max-h-[92vh] flex flex-col">
        
        <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-2"></div>
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <h3 class="text-sm font-extrabold text-slate-900">Clinical Consultation</h3>
            <p class="text-[10px] text-slate-400">Token: ${apt.token} • ${apt.patientName}</p>
          </div>
          <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">✕</button>
        </div>

        <form onsubmit="submitConsultation(event, '${apt.id}', '${apt.patientId}')" class="space-y-3 text-xs overflow-y-auto no-scrollbar flex-1 pr-1">
          
          <!-- Vitals Pill Bar -->
          <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-[10px]">
            <div>BP: <span class="font-bold text-slate-900">${patient && patient.vitals ? patient.vitals.bloodPressure : '120/80'}</span></div>
            <div>Pulse: <span class="font-bold text-slate-900">${patient && patient.vitals ? patient.vitals.pulse + ' bpm' : '72'}</span></div>
            <div>Blood: <span class="font-bold text-rose-600">${patient ? patient.bloodGroup : 'O+'}</span></div>
            <div>Allergies: <span class="font-bold text-amber-700">${patient && patient.allergies ? patient.allergies[0] : 'None'}</span></div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Clinical Diagnosis *</label>
            <input type="text" id="consultDiagnosis" required placeholder="e.g. Essential Hypertension, Bronchitis..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Clinical Advice / Notes</label>
            <textarea id="consultNotes" rows="2" placeholder="Low-salt, low-oil diet, daily brisk walk..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"></textarea>
          </div>

          <!-- Prescribed Medicines -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Prescribed Medicines</label>
            <div id="medicineRowsContainer" class="space-y-2">
              <div class="grid grid-cols-3 gap-1.5">
                <input type="text" placeholder="Medicine (e.g. Dolo 650)" class="med-name col-span-2 px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs">
                <input type="text" placeholder="Dosage (1 Tab BD)" class="med-freq px-2 py-1.5 border border-slate-200 rounded-xl text-xs">
              </div>
            </div>
            <button type="button" onclick="addMedicineRow()" class="mt-1 text-blue-600 font-bold text-[11px]">+ Add Medicine</button>
          </div>

          <!-- Blood Test Checkbox Selection -->
          <div class="bg-rose-50/70 p-3 rounded-2xl border border-rose-200 space-y-1.5">
            <span class="font-bold text-rose-900 text-[11px] block">🩸 Order Blood Tests (Lab Dispatch)</span>
            <div class="grid grid-cols-2 gap-1.5">
              ${doctorCatalog.slice(0, 6).map(t => `
                <label class="flex items-center space-x-1.5 text-[10px] text-slate-700 bg-white p-1.5 rounded-xl border border-rose-100 cursor-pointer">
                  <input type="checkbox" value="${t.id}" class="order-blood-test-cb text-rose-600 rounded">
                  <span class="font-medium truncate">${t.name.split(' ')[0]}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center space-x-2">
            <button type="button" onclick="closeModal()" class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-sm touch-btn">
              Complete & Prescribe
            </button>
          </div>

        </form>

      </div>
    </div>
  `;
}

function addMedicineRow() {
  const container = document.getElementById('medicineRowsContainer');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'grid grid-cols-3 gap-1.5';
  div.innerHTML = `
    <input type="text" placeholder="Medicine" class="med-name col-span-2 px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs">
    <input type="text" placeholder="Dosage" class="med-freq px-2 py-1.5 border border-slate-200 rounded-xl text-xs">
  `;
  container.appendChild(div);
}

async function submitConsultation(e, aptId, patientId) {
  e.preventDefault();
  const diagnosis = document.getElementById('consultDiagnosis').value;
  const clinicalNotes = document.getElementById('consultNotes').value;

  const medNames = document.querySelectorAll('.med-name');
  const medFreqs = document.querySelectorAll('.med-freq');

  const medicines = [];
  medNames.forEach((el, idx) => {
    if (el.value.trim()) {
      medicines.push({
        name: el.value.trim(),
        dosage: "Standard",
        frequency: medFreqs[idx] ? medFreqs[idx].value : "Once daily",
        duration: "5 days"
      });
    }
  });

  const checkedTests = [];
  document.querySelectorAll('.order-blood-test-cb:checked').forEach(cb => {
    checkedTests.push(cb.value);
  });

  try {
    const doctorName = (window.currentUser && window.currentUser.name) || "Dr. Priya Nair";
    await api.createPrescription({
      patientId,
      doctorName,
      diagnosis,
      clinicalNotes,
      medicines,
      recommendedTests: checkedTests,
      appointmentId: aptId
    });

    closeModal();
    showToast('Prescription saved & lab test orders dispatched!', 'success');
    renderDoctorDashboard(document.getElementById('viewContainer'));
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// ----------------------------------------------------
// VIEW PATIENT MEDICAL FILE (BOTTOM SHEET)
// ----------------------------------------------------
async function viewPatientMedicalFile(patientId) {
  try {
    const res = await api.getPatient(patientId);
    const p = res.patient;
    const history = res.history || {};

    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
        <div class="absolute inset-0" onclick="closeModal()"></div>
        <div class="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 mobile-bottom-sheet z-10 max-h-[90vh] flex flex-col">
          
          <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-2"></div>

          <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h3 class="text-sm font-extrabold text-slate-900">Medical Record (EHR)</h3>
              <p class="text-[10px] text-slate-400">${p.name} • ${p.id} • ${p.bloodGroup}</p>
            </div>
            <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">✕</button>
          </div>

          <div class="overflow-y-auto no-scrollbar space-y-3 text-xs flex-1 pr-1">
            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span class="font-bold text-slate-800 text-[11px] block mb-1.5">Vitals</span>
              <div class="grid grid-cols-3 gap-2 text-[10px]">
                <div>BP: <span class="font-bold">${p.vitals ? p.vitals.bloodPressure : '120/80'}</span></div>
                <div>Pulse: <span class="font-bold">${p.vitals ? p.vitals.pulse : '72'}</span></div>
                <div>SpO2: <span class="font-bold">${p.vitals ? p.vitals.spO2 + '%' : '99%'}</span></div>
              </div>
            </div>

            <div>
              <span class="font-bold text-slate-800 text-[11px] block mb-1">Blood Reports (${(history.labOrders || []).length})</span>
              <div class="space-y-1.5">
                ${(history.labOrders || []).map(o => `
                  <div class="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between bg-white touch-btn cursor-pointer" onclick="viewReport('${o.id}')">
                    <span class="font-bold text-[11px] text-slate-900">${o.testName}</span>
                    <span class="text-[9px] font-bold px-2 py-0.5 rounded-full ${o.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${o.status}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100">
            <button onclick="closeModal()" class="w-full py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Close</button>
          </div>

        </div>
      </div>
    `;
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// public/js/views/patientPortal.js

async function renderPatientPortal(container) {
  try {
    const user = window.currentUser || { patientId: 'PAT-1001', name: 'Ramesh Patel' };
    const patientId = user.patientId || 'PAT-1001';

    const [patientRes, catalogRes] = await Promise.all([
      api.getPatient(patientId),
      api.getLabCatalog()
    ]);

    const patient = patientRes.patient;
    const history = patientRes.history || {};
    const labOrders = history.labOrders || [];
    const appointments = history.appointments || [];
    const prescriptions = history.prescriptions || [];
    const invoices = history.invoices || [];

    const completedReports = labOrders.filter(o => o.status === 'COMPLETED');

    container.innerHTML = `
      <div class="space-y-4">
        
        <!-- Mobile Patient Health Card -->
        <div class="bg-gradient-to-r from-teal-600 via-sky-600 to-indigo-700 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl border border-white/30 text-white">
              👤
            </div>
            <div>
              <div class="flex items-center space-x-1.5 text-teal-200 text-[10px] font-bold uppercase tracking-wider">
                <span>Patient Health Vault</span>
              </div>
              <h2 class="text-base font-extrabold tracking-tight">${patient.name}</h2>
              <p class="text-teal-100/90 text-[11px]">
                ${patient.id} • ${patient.age}y • Blood: <span class="font-extrabold text-white bg-rose-500/60 px-1.5 py-0.5 rounded">${patient.bloodGroup || 'O+'}</span>
              </p>
            </div>
          </div>

          <div class="mt-3 flex items-center space-x-2">
            <button onclick="openPatientBookLabModal('${patient.id}')" class="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center space-x-1 touch-btn">
              <span>🩸</span>
              <span>Book Blood Test</span>
            </button>
            <button onclick="openBookAptForPatient('${patient.id}')" class="flex-1 py-2 bg-white text-teal-900 text-xs font-bold rounded-xl shadow transition flex items-center justify-center space-x-1 touch-btn">
              <span>+</span>
              <span>Book Doctor</span>
            </button>
          </div>
        </div>

        <!-- 2x2 on Mobile, 4-Cols on Desktop -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
              ❤️
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Blood Pressure</span>
              <span class="text-sm font-extrabold text-slate-900">${patient.vitals ? patient.vitals.bloodPressure : '120/80'}</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              🫁
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Pulse & SpO2</span>
              <span class="text-sm font-extrabold text-blue-600">${patient.vitals ? patient.vitals.pulse + ' bpm' : '72 bpm'}</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
              🔬
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Reports</span>
              <span class="text-sm font-extrabold text-rose-600">${completedReports.length} Ready</span>
            </div>
          </div>

          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
              💊
            </div>
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold block">Prescriptions</span>
              <span class="text-sm font-extrabold text-purple-600">${prescriptions.length} Active</span>
            </div>
          </div>
        </div>

        <!-- Blood Reports Section -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">My Blood Test Reports</h3>
            <span class="text-[10px] text-rose-600 font-bold">${labOrders.length} Orders</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            ${labOrders.length === 0 ? `
              <div class="p-6 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">No blood reports yet</div>
            ` : labOrders.map(o => {
              const isDone = o.status === 'COMPLETED';
              const abnormalResults = (o.results || []).filter(r => r.flag && r.flag !== 'NORMAL');

              return `
                <div class="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-sm space-y-2">
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="font-bold text-xs text-slate-900">${o.testName}</div>
                      <div class="text-[10px] text-slate-500">${new Date(o.orderDate).toLocaleDateString('en-IN')} • Ref: ${o.referringDoctor || 'Hospital Physician'}</div>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                      ${o.status}
                    </span>
                  </div>

                  ${isDone && abnormalResults.length > 0 ? `
                    <div class="text-[10px] text-amber-800 font-bold bg-amber-50 p-1.5 rounded-xl border border-amber-200">
                      ⚠️ ${abnormalResults.length} parameter(s) flagged outside reference range.
                    </div>
                  ` : ''}

                  ${isDone ? `
                    <button onclick="viewReport('${o.id}')" class="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm touch-btn flex items-center justify-center space-x-1.5">
                      <span>📄 View & Download Official Report</span>
                    </button>
                  ` : `
                    <div class="text-[10px] text-slate-400 text-center font-mono py-1">Sample processing in lab analyzer...</div>
                  `}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Prescriptions Section -->
        <div class="space-y-2.5 pt-1">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">My Prescriptions</h3>
            <span class="text-[10px] text-purple-600 font-bold">${prescriptions.length} Records</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            ${prescriptions.map(rx => `
              <div class="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs text-slate-900">${rx.diagnosis}</span>
                  <span class="text-[9px] text-slate-400 font-mono">${rx.date}</span>
                </div>
                <div class="text-[10px] text-slate-600">${rx.clinicalNotes}</div>
                <div class="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-1">
                  ${(rx.medicines || []).map(m => `
                    <div class="flex justify-between text-[10px] text-slate-700">
                      <span class="font-bold">${m.name}</span>
                      <span class="font-mono text-slate-500">${m.frequency}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Invoices & Bills Section -->
        <div class="space-y-2.5 pt-1">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Bills & Payments</h3>
            <span class="text-[10px] text-slate-400 font-mono">${invoices.length} Invoices</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            ${invoices.map(inv => `
              <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex items-center justify-between">
                <div>
                  <div class="font-bold text-xs text-slate-900 font-mono">${inv.id}</div>
                  <div class="text-[10px] text-slate-400">${inv.date} • ${inv.paymentMethod || 'UPI'}</div>
                </div>
                <div class="text-right">
                  <div class="font-mono font-extrabold text-xs text-purple-800">₹${Number(inv.total).toFixed(2)}</div>
                  <button onclick="viewInvoiceReceipt('${inv.id}')" class="text-[10px] text-rose-600 font-bold hover:underline">Receipt</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-2xl text-xs">Error loading patient portal: ${err.message}</div>`;
  }
}

function openPatientBookLabModal(patientId) {
  openNewLabOrderModal();
  setTimeout(() => {
    const sel = document.getElementById('modalOrderPatientId');
    if (sel) sel.value = patientId;
  }, 50);
}

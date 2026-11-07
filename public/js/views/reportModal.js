// public/js/views/reportModal.js

function renderLabReportModal(order, testDef, patient) {
  const modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) return;

  const results = order.results || [];
  const abnormalCount = results.filter(r => r.flag && r.flag !== 'NORMAL').length;

  const html = `
    <div class="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center bg-slate-900/70 backdrop-blur-sm overflow-hidden">
      
      <!-- Backdrop tap to close -->
      <div class="absolute inset-0" onclick="closeModal()"></div>

      <!-- Mobile Bottom Sheet Document Window -->
      <div class="relative w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden mobile-bottom-sheet z-10">
        
        <!-- Mobile Sheet Drag Handle & Close -->
        <div class="no-print pt-3 pb-2 px-6 flex items-center justify-between border-b border-slate-100 bg-white">
          <div class="w-10 h-1 bg-slate-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2"></div>
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            <span class="text-xs font-bold text-slate-800">Clinical Pathology Report</span>
          </div>
          <button onclick="closeModal()" class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 text-xs font-bold">
            ✕
          </button>
        </div>

        <!-- Scrollable Printable Document Canvas -->
        <div class="overflow-y-auto p-4 sm:p-6 flex-1 text-slate-800" id="printableReportArea">
          <div class="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            
            <!-- Report Hospital Header -->
            <div class="border-b-2 border-slate-900 pb-4 mb-4">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center space-x-2.5 mb-1">
                    <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow">
                      +
                    </div>
                    <div>
                      <h1 class="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">SANJEEVANI MULTISPECIALTY HOSPITAL</h1>
                      <p class="text-[9px] sm:text-[10px] font-bold text-rose-600 tracking-wider uppercase">Blood Diagnostic & Pathology Center</p>
                    </div>
                  </div>
                  <p class="text-[9px] text-slate-500">Plot 12, Ring Road, New Delhi - 110029 • NABL Accredited #LP-90812</p>
                  <p class="text-[9px] text-slate-500">Ph: +91 (011) 2685-4000 • Email: lab@sanjeevani-hospital.in</p>
                </div>
                <div class="text-right">
                  <div class="inline-block bg-slate-100 p-1.5 rounded-lg border border-slate-200 mb-1">
                    <div class="font-mono text-[10px] font-bold text-slate-800">${order.barcode || 'SAMP-88102'}</div>
                    <div class="text-[8px] text-slate-400 font-mono tracking-widest mt-0.5">|||| ||| ||||</div>
                  </div>
                  <div class="text-[9px] text-emerald-600 font-bold">✓ VERIFIED</div>
                </div>
              </div>
            </div>

            <!-- Patient Demographics & Order Metadata -->
            <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-4 text-[11px] text-slate-700">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <span class="text-slate-400 block text-[9px] uppercase font-bold">Patient Name</span>
                  <span class="font-bold text-slate-900">${order.patientName}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[9px] uppercase font-bold">ID / Age / Sex</span>
                  <span class="font-semibold text-slate-800">${order.patientId} / ${order.patientAge}y / ${order.patientGender}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[9px] uppercase font-bold">Referring Physician</span>
                  <span class="font-semibold text-slate-800">${order.referringDoctor || 'Dr. Priya Nair (AIIMS)'}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[9px] uppercase font-bold">Sample Specimen</span>
                  <span class="font-semibold text-slate-800">${testDef ? testDef.sampleType : 'Whole Blood'} (${order.tubeColor || 'EDTA'})</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[9px] uppercase font-bold">Sample ID</span>
                  <span class="font-mono font-bold text-indigo-700">${order.sampleId || 'SMP-88102'}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[9px] uppercase font-bold">Reported Date</span>
                  <span class="font-semibold text-slate-800">${order.verifiedAt ? new Date(order.verifiedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              ${order.phlebotomyNotes ? `
                <div class="mt-2 pt-2 border-t border-slate-200/80 text-[10px] text-slate-600">
                  <span class="font-semibold text-slate-700">Phlebotomist Note:</span> ${order.phlebotomyNotes}
                </div>
              ` : ''}
            </div>

            <!-- Investigation Title -->
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
                <h2 class="text-xs sm:text-sm font-bold text-slate-900">${order.testName}</h2>
              </div>
              ${abnormalCount > 0 ? `
                <span class="text-[9px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                  ⚠️ ${abnormalCount} Abnormal
                </span>
              ` : `
                <span class="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  ✓ All Normal
                </span>
              `}
            </div>

            <!-- Results List / Table for Mobile -->
            <div class="border border-slate-200 rounded-xl overflow-hidden mb-4">
              <table class="w-full text-left text-[11px]">
                <thead>
                  <tr class="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase font-bold text-[9px] tracking-wider">
                    <th class="py-2 px-3">Parameter</th>
                    <th class="py-2 px-3">Observed</th>
                    <th class="py-2 px-2 text-center">Ref Interval</th>
                    <th class="py-2 px-2 text-right">Flag</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-800">
                  ${results.length === 0 ? `
                    <tr><td colspan="4" class="py-6 text-center text-slate-400">No parameters recorded yet</td></tr>
                  ` : results.map(r => {
                    const isHigh = r.flag === 'HIGH' || r.flag === 'CRITICAL HIGH';
                    const isLow = r.flag === 'LOW' || r.flag === 'CRITICAL LOW';
                    const isCritical = r.flag && r.flag.includes('CRITICAL');

                    let flagBadge = `<span class="flag-normal px-1.5 py-0.5 rounded text-[8px]">NORMAL</span>`;
                    if (isCritical) {
                      flagBadge = `<span class="flag-critical px-1.5 py-0.5 rounded text-[8px]">⚡ ${r.flag}</span>`;
                    } else if (isHigh) {
                      flagBadge = `<span class="flag-high px-1.5 py-0.5 rounded text-[8px]">▲ HIGH</span>`;
                    } else if (isLow) {
                      flagBadge = `<span class="flag-low px-1.5 py-0.5 rounded text-[8px]">▼ LOW</span>`;
                    }

                    let rangeStr = "-";
                    if (testDef && testDef.parameters) {
                      const pDef = testDef.parameters.find(p => p.key === r.key);
                      if (pDef) {
                        if (pDef.normalMin !== undefined && pDef.normalMax !== undefined) {
                          rangeStr = `${pDef.normalMin}-${pDef.normalMax}`;
                        } else if (pDef.normalMin) {
                          rangeStr = pDef.normalMin;
                        }
                      }
                    }

                    return `
                      <tr class="${isCritical ? 'bg-rose-50/50' : isHigh || isLow ? 'bg-amber-50/30' : ''}">
                        <td class="py-2 px-3 font-semibold text-slate-900 leading-tight">
                          ${r.name}
                          <span class="text-[9px] text-slate-400 block font-normal font-mono">${r.unit || ''}</span>
                        </td>
                        <td class="py-2 px-3 font-mono font-bold text-xs ${isHigh ? 'text-rose-700' : isLow ? 'text-amber-700' : 'text-slate-900'}">
                          ${r.value}
                        </td>
                        <td class="py-2 px-2 text-center text-slate-500 font-mono text-[10px]">${rangeStr}</td>
                        <td class="py-2 px-2 text-right">${flagBadge}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <!-- Pathologist Clinical Remarks -->
            <div class="border border-slate-200 rounded-xl p-3 bg-slate-50/70 mb-4">
              <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-wider mb-0.5">Clinical Remarks & Impression</h4>
              <p class="text-[10px] text-slate-700 leading-relaxed font-medium">
                ${order.pathologistRemarks || 'Specimen processed on automated calibrated analyzer. Clinically verified by pathology staff.'}
              </p>
            </div>

            <!-- Pathologist Signatures & Stamp -->
            <div class="pt-3 border-t border-slate-200 flex items-end justify-between text-[10px]">
              <div>
                <div class="text-[8px] text-slate-400 uppercase font-semibold">Processed By</div>
                <div class="font-bold text-slate-800">${order.sampleCollectedBy || 'Suresh Verma'}</div>
                <div class="text-[9px] text-slate-500">Chief Pathology Tech</div>
              </div>

              <div class="text-right">
                <div class="text-[8px] text-slate-400 uppercase font-semibold">Verified & Digitally Signed</div>
                <div class="font-bold text-slate-900 text-xs">${order.verifiedBy || 'Suresh Verma, MD'}</div>
                <div class="text-[9px] text-indigo-600 font-medium">Lead Clinical Pathologist</div>
              </div>
            </div>

            <div class="mt-4 text-center text-[8px] text-slate-400 tracking-wider uppercase border-t border-slate-100 pt-2">
              *** END OF REPORT • SANJEEVANI HOSPITAL ***
            </div>

          </div>
        </div>

        <!-- Sticky Mobile Bottom Actions -->
        <div class="no-print bg-slate-50 p-3 px-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button onclick="closeModal()" class="w-1/3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition">
            Close
          </button>
          <button onclick="window.print()" class="w-2/3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            <span>Print Report (PDF)</span>
          </button>
        </div>

      </div>
    </div>
  `;

  modalContainer.innerHTML = html;
}

function closeModal() {
  const modalContainer = document.getElementById('modalContainer');
  if (modalContainer) {
    modalContainer.innerHTML = '';
  }
}

// public/js/api.js
// Dual-mode API client:
// 1. Connects to backend Node.js Express server on http://localhost:5000
// 2. Seamlessly falls back to client-side localStorage database when deployed on GitHub Pages or static hosting

const API_BASE = '/api';

const isStaticMode = (
  window.location.hostname.includes('github.io') ||
  window.location.protocol === 'file:' ||
  window.location.port === '' ||
  window.FORCE_STATIC_MODE === true
);

// Client-side in-browser database engine for GitHub Pages
const clientDb = {
  get() {
    try {
      const saved = localStorage.getItem('sanjeevani_db_store');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }
    const seed = window.SANJEEVANI_SEED ? JSON.parse(JSON.stringify(window.SANJEEVANI_SEED)) : {};
    this.save(seed);
    return seed;
  },
  save(data) {
    try {
      localStorage.setItem('sanjeevani_db_store', JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  },
  reset() {
    const seed = window.SANJEEVANI_SEED ? JSON.parse(JSON.stringify(window.SANJEEVANI_SEED)) : {};
    this.save(seed);
    return seed;
  }
};

const api = {
  async request(endpoint, options = {}) {
    // If running on GitHub Pages (static), handle directly via client-side database
    if (isStaticMode) {
      return this.handleClientRequest(endpoint, options);
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`[API] Server request to ${endpoint} failed (${err.message}). Falling back to client-side database...`);
      return this.handleClientRequest(endpoint, options);
    }
  },

  // ----------------------------------------------------
  // CLIENT-SIDE MOCK HANDLER (For GitHub Pages & Static Hosts)
  // ----------------------------------------------------
  handleClientRequest(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body) : {};
    const db = clientDb.get();

    // 1. Auth: /auth/login
    if (endpoint === '/auth/login' && method === 'POST') {
      const { email, password, role } = body;
      let user = null;
      if (email) {
        user = (db.users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
      } else if (role) {
        user = (db.users || []).find(u => u.role === role);
      }
      if (!user) {
        return Promise.reject(new Error('User not found'));
      }
      const sessionUser = { ...user };
      delete sessionUser.password;
      return Promise.resolve({ success: true, user: sessionUser });
    }

    // 2. Auth: /auth/users
    if (endpoint === '/auth/users' && method === 'GET') {
      return Promise.resolve({
        success: true,
        users: (db.users || []).map(u => {
          const safe = { ...u };
          delete safe.password;
          return safe;
        })
      });
    }

    // 3. Analytics: /analytics/overview
    if (endpoint === '/analytics/overview') {
      const totalPatients = (db.patients || []).length;
      const totalBeds = (db.beds || []).length;
      const occupiedBeds = (db.beds || []).filter(b => b.isOccupied).length;
      const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
      const totalOrders = (db.labOrders || []).length;
      const completedOrders = (db.labOrders || []).filter(o => o.status === 'COMPLETED').length;
      const pendingOrders = totalOrders - completedOrders;
      const totalAppointments = (db.appointments || []).length;
      const todayAppointments = (db.appointments || []).filter(a => a.date === '2026-11-08' || a.status === 'PENDING').length;
      const totalRevenue = (db.invoices || []).filter(i => i.status === 'PAID').reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
      const pendingRevenue = (db.invoices || []).filter(i => i.status === 'PENDING').reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

      return Promise.resolve({
        success: true,
        stats: {
          totalPatients,
          bedOccupancy: { total: totalBeds, occupied: occupiedBeds, available: totalBeds - occupiedBeds, rate: bedOccupancyRate },
          bloodLab: { total: totalOrders, completed: completedOrders, pending: pendingOrders },
          appointments: { total: totalAppointments, today: todayAppointments },
          finances: { currency: '₹', collectedRevenue: totalRevenue, pendingRevenue: pendingRevenue, totalBilled: totalRevenue + pendingRevenue }
        }
      });
    }

    // 4. Lab Catalog & Packages
    if (endpoint === '/lab/catalog' && method === 'GET') {
      return Promise.resolve({ success: true, catalog: db.labCatalog || [] });
    }
    if (endpoint === '/lab/packages' && method === 'GET') {
      return Promise.resolve({ success: true, packages: db.labPackages || [] });
    }

    // 5. Lab Orders
    if (endpoint.startsWith('/lab/orders')) {
      const urlParts = endpoint.split('?')[0].split('/');
      const orderId = urlParts[3];
      const action = urlParts[4];

      // POST /lab/orders/:id/collect-sample
      if (orderId && action === 'collect-sample' && method === 'POST') {
        const order = (db.labOrders || []).find(o => o.id === orderId);
        if (order) {
          order.status = 'SAMPLE_COLLECTED';
          order.sampleCollectedAt = new Date().toISOString();
          order.tubeColor = body.tubeColor || order.tubeColor;
          order.sampleBarcode = body.sampleBarcode || order.sampleBarcode;
          order.phlebotomist = body.phlebotomist || 'Suresh Verma';
          clientDb.save(db);
          return Promise.resolve({ success: true, order });
        }
      }

      // POST /lab/orders/:id/start-processing
      if (orderId && action === 'start-processing' && method === 'POST') {
        const order = (db.labOrders || []).find(o => o.id === orderId);
        if (order) {
          order.status = 'PROCESSING';
          clientDb.save(db);
          return Promise.resolve({ success: true, order });
        }
      }

      // POST /lab/orders/:id/results
      if (orderId && action === 'results' && method === 'POST') {
        const order = (db.labOrders || []).find(o => o.id === orderId);
        if (order) {
          order.status = 'COMPLETED';
          order.completedAt = new Date().toISOString();
          order.results = body.results || [];
          order.pathologistNotes = body.pathologistNotes || 'Analyzed on automated Beckman Coulter analyzer.';
          order.signedBy = body.signedBy || 'Dr. Suresh Verma, MD (Pathology)';
          clientDb.save(db);
          return Promise.resolve({ success: true, order });
        }
      }

      // GET /lab/orders/:id
      if (orderId && method === 'GET') {
        const order = (db.labOrders || []).find(o => o.id === orderId);
        return Promise.resolve({ success: true, order });
      }

      // POST /lab/orders (Create new order)
      if (method === 'POST') {
        const newOrder = {
          id: `ORD-${Date.now().toString().slice(-4)}`,
          patientId: body.patientId,
          patientName: body.patientName || 'Unknown Patient',
          tests: body.tests || [],
          totalCost: body.totalCost || 500,
          status: 'ORDERED',
          orderedAt: new Date().toISOString(),
          sampleBarcode: `SMP-${Date.now().toString().slice(-5)}`,
          tubeColor: body.tubeColor || 'Purple / EDTA'
        };
        db.labOrders = db.labOrders || [];
        db.labOrders.unshift(newOrder);
        clientDb.save(db);
        return Promise.resolve({ success: true, order: newOrder });
      }

      // GET /lab/orders
      return Promise.resolve({ success: true, orders: db.labOrders || [] });
    }

    // 6. Patients
    if (endpoint.startsWith('/patients')) {
      const id = endpoint.split('?')[0].split('/')[2];
      if (id && method === 'GET') {
        const patient = (db.patients || []).find(p => p.id === id);
        return Promise.resolve({ success: true, patient });
      }
      if (method === 'POST') {
        const newPatient = {
          id: `PAT-${Date.now().toString().slice(-4)}`,
          ...body,
          registeredAt: new Date().toISOString()
        };
        db.patients = db.patients || [];
        db.patients.unshift(newPatient);
        clientDb.save(db);
        return Promise.resolve({ success: true, patient: newPatient });
      }
      return Promise.resolve({ success: true, patients: db.patients || [] });
    }

    // 7. Appointments
    if (endpoint.startsWith('/appointments')) {
      const id = endpoint.split('/')[2];
      const isStatusUpdate = endpoint.includes('/status');

      if (id && isStatusUpdate && method === 'PUT') {
        const apt = (db.appointments || []).find(a => a.id === id);
        if (apt) {
          apt.status = body.status;
          clientDb.save(db);
          return Promise.resolve({ success: true, appointment: apt });
        }
      }

      if (method === 'POST') {
        const newApt = {
          id: `APT-${Date.now().toString().slice(-4)}`,
          ...body,
          tokenNumber: (db.appointments || []).length + 1,
          status: 'SCHEDULED'
        };
        db.appointments = db.appointments || [];
        db.appointments.unshift(newApt);
        clientDb.save(db);
        return Promise.resolve({ success: true, appointment: newApt });
      }

      return Promise.resolve({ success: true, appointments: db.appointments || [] });
    }

    // 8. Prescriptions
    if (endpoint.startsWith('/prescriptions')) {
      if (method === 'POST') {
        const newRx = {
          id: `RX-${Date.now().toString().slice(-4)}`,
          ...body,
          date: new Date().toISOString().split('T')[0]
        };
        db.prescriptions = db.prescriptions || [];
        db.prescriptions.unshift(newRx);
        clientDb.save(db);
        return Promise.resolve({ success: true, prescription: newRx });
      }
      return Promise.resolve({ success: true, prescriptions: db.prescriptions || [] });
    }

    // 9. Beds
    if (endpoint.startsWith('/beds')) {
      const parts = endpoint.split('/');
      const bedId = parts[2];
      const bedAction = parts[3];

      if (bedId && bedAction === 'admit' && method === 'POST') {
        const bed = (db.beds || []).find(b => b.id === bedId);
        const patient = (db.patients || []).find(p => p.id === body.patientId);
        if (bed) {
          bed.isOccupied = true;
          bed.patientId = body.patientId;
          bed.patientName = patient ? patient.name : 'Admitted Patient';
          bed.admittedAt = new Date().toISOString();
          clientDb.save(db);
          return Promise.resolve({ success: true, bed });
        }
      }

      if (bedId && bedAction === 'discharge' && method === 'POST') {
        const bed = (db.beds || []).find(b => b.id === bedId);
        if (bed) {
          bed.isOccupied = false;
          bed.patientId = null;
          bed.patientName = null;
          bed.admittedAt = null;
          clientDb.save(db);
          return Promise.resolve({ success: true, bed });
        }
      }

      return Promise.resolve({ success: true, beds: db.beds || [] });
    }

    // 10. Pharmacy
    if (endpoint === '/pharmacy/inventory') {
      return Promise.resolve({ success: true, inventory: db.medicines || [] });
    }
    if (endpoint === '/pharmacy/dispense' && method === 'POST') {
      const { items, patientId, patientName } = body;
      (items || []).forEach(item => {
        const med = (db.medicines || []).find(m => m.id === item.medicineId);
        if (med) med.stock = Math.max(0, med.stock - Number(item.quantity));
      });
      clientDb.save(db);
      return Promise.resolve({ success: true, message: 'Medicines dispensed successfully' });
    }

    // 11. Invoices & Billing
    if (endpoint.startsWith('/invoices')) {
      const parts = endpoint.split('/');
      const invId = parts[2];
      const invAction = parts[3];

      if (invId && invAction === 'pay' && method === 'POST') {
        const inv = (db.invoices || []).find(i => i.id === invId);
        if (inv) {
          inv.status = 'PAID';
          inv.paymentMethod = body.paymentMethod || 'UPI (Google Pay)';
          inv.paidAt = new Date().toISOString();
          clientDb.save(db);
          return Promise.resolve({ success: true, invoice: inv });
        }
      }

      return Promise.resolve({ success: true, invoices: db.invoices || [] });
    }

    // 12. System Reset
    if (endpoint === '/system/reset' && method === 'POST') {
      clientDb.reset();
      return Promise.resolve({ success: true, message: 'Database reset to Indian seed baseline.' });
    }

    return Promise.resolve({ success: true });
  },

  // Auth
  login(email, password, role) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    });
  },
  getUsers() {
    return this.request('/auth/users');
  },
  createUser(userData) {
    return this.request('/auth/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Analytics
  getAnalytics() {
    return this.request('/analytics/overview');
  },

  // Blood Test Center & Laboratory
  getLabCatalog() {
    return this.request('/lab/catalog');
  },
  addLabTest(testData) {
    return this.request('/lab/catalog', {
      method: 'POST',
      body: JSON.stringify(testData)
    });
  },
  getLabPackages() {
    return this.request('/lab/packages');
  },
  getLabOrders(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/lab/orders${params ? '?' + params : ''}`);
  },
  getLabOrder(id) {
    return this.request(`/lab/orders/${id}`);
  },
  createLabOrder(orderData) {
    return this.request('/lab/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },
  collectSample(id, data) {
    return this.request(`/lab/orders/${id}/collect-sample`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  startProcessing(id) {
    return this.request(`/lab/orders/${id}/start-processing`, {
      method: 'POST'
    });
  },
  submitResults(id, data) {
    return this.request(`/lab/orders/${id}/results`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Patients
  getPatients(search = '') {
    return this.request(`/patients${search ? '?search=' + encodeURIComponent(search) : ''}`);
  },
  getPatient(id) {
    return this.request(`/patients/${id}`);
  },
  createPatient(patientData) {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
  },
  updatePatient(id, patientData) {
    return this.request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData)
    });
  },

  // Appointments
  getAppointments(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/appointments${params ? '?' + params : ''}`);
  },
  createAppointment(data) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  updateAppointmentStatus(id, status) {
    return this.request(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Prescriptions
  getPrescriptions(patientId = '') {
    return this.request(`/prescriptions${patientId ? '?patientId=' + patientId : ''}`);
  },
  createPrescription(data) {
    return this.request('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Beds
  getBeds() {
    return this.request('/beds');
  },
  admitPatient(bedId, patientId) {
    return this.request(`/beds/${bedId}/admit`, {
      method: 'POST',
      body: JSON.stringify({ patientId })
    });
  },
  dischargePatient(bedId) {
    return this.request(`/beds/${bedId}/discharge`, {
      method: 'POST'
    });
  },

  // Pharmacy
  getPharmacy() {
    return this.request('/pharmacy/inventory');
  },
  dispenseMedicine(data) {
    return this.request('/pharmacy/dispense', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Billing
  getInvoices(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/invoices${params ? '?' + params : ''}`);
  },
  payInvoice(id, paymentMethod) {
    return this.request(`/invoices/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod })
    });
  },

  // System
  resetSystem() {
    return this.request('/system/reset', { method: 'POST' });
  }
};

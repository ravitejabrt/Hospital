// public/js/api.js
const API_BASE = '/api';

const api = {
  async request(endpoint, options = {}) {
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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
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

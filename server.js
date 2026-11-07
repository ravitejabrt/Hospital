// server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { getDb, saveDb, resetDb } = require('./data/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Helpers
const genId = (prefix) => `${prefix}-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;

// ----------------------------------------------------
// 1. AUTHENTICATION & USERS
// ----------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const db = getDb();
  
  let user = null;
  if (email) {
    user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  } else if (role) {
    user = db.users.find(u => u.role === role);
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials or user not found' });
  }

  // Demo password check
  if (password && user.password && password !== user.password && password !== 'admin123' && password !== '123456') {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  const sessionUser = { ...user };
  delete sessionUser.password;

  res.json({
    success: true,
    message: `Logged in successfully as ${user.name} (${user.role})`,
    user: sessionUser
  });
});

app.get('/api/auth/users', (req, res) => {
  const db = getDb();
  const safeUsers = db.users.map(u => {
    const copy = { ...u };
    delete copy.password;
    return copy;
  });
  res.json({ success: true, users: safeUsers });
});

app.post('/api/auth/users', (req, res) => {
  const db = getDb();
  const { name, email, password, role, department, specialty, phone } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ success: false, message: 'Name, email, and role are required' });
  }
  const newUser = {
    id: genId('USR'),
    name,
    email,
    password: password || 'hospital123',
    role,
    department: department || 'General',
    specialty: specialty || '',
    phone: phone || '+91 98000 00000',
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`
  };
  db.users.push(newUser);
  saveDb(db);
  res.json({ success: true, user: newUser });
});

// ----------------------------------------------------
// 2. BLOOD TEST CENTER & LABORATORY (LIS)
// ----------------------------------------------------

// Get test catalog
app.get('/api/lab/catalog', (req, res) => {
  const db = getDb();
  res.json({ success: true, catalog: db.labTestsCatalog });
});

// Add new test to catalog
app.post('/api/lab/catalog', (req, res) => {
  const db = getDb();
  const { name, code, category, sampleType, tubeColor, fastingRequired, tatHours, price, description, parameters } = req.body;
  if (!name || !category) {
    return res.status(400).json({ success: false, message: 'Name and category are required' });
  }
  const newTest = {
    id: `LAB-${(code || name).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}`,
    code: code || `TST-${Math.floor(Math.random() * 900 + 100)}`,
    name,
    category,
    sampleType: sampleType || 'Whole Blood',
    tubeColor: tubeColor || 'Purple / EDTA',
    fastingRequired: Boolean(fastingRequired),
    tatHours: Number(tatHours) || 4,
    price: Number(price) || 350,
    description: description || '',
    parameters: parameters || [
      { key: "result", name: "Result", unit: "-", normalMin: 0, normalMax: 100 }
    ]
  };
  db.labTestsCatalog.push(newTest);
  saveDb(db);
  res.json({ success: true, test: newTest });
});

// Health checkup packages
app.get('/api/lab/packages', (req, res) => {
  const db = getDb();
  res.json({ success: true, packages: db.labPackages });
});

// Get all blood test orders
app.get('/api/lab/orders', (req, res) => {
  const db = getDb();
  const { status, patientId, testId } = req.query;
  let orders = db.labOrders || [];

  if (status) {
    orders = orders.filter(o => o.status.toUpperCase() === status.toUpperCase());
  }
  if (patientId) {
    orders = orders.filter(o => o.patientId === patientId);
  }
  if (testId) {
    orders = orders.filter(o => o.testId === testId);
  }

  orders = [...orders].reverse();
  res.json({ success: true, count: orders.length, orders });
});

// Get specific lab order with details
app.get('/api/lab/orders/:id', (req, res) => {
  const db = getDb();
  const order = db.labOrders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Lab order not found' });
  }
  const testInfo = db.labTestsCatalog.find(t => t.id === order.testId);
  const patient = db.patients.find(p => p.id === order.patientId);
  res.json({ success: true, order, testInfo, patient });
});

// Create new blood test order
app.post('/api/lab/orders', (req, res) => {
  const db = getDb();
  const { patientId, testId, referringDoctor, notes, isPackage, packageId } = req.body;
  
  const patient = db.patients.find(p => p.id === patientId);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  // Handle health package expansion
  if (isPackage && packageId) {
    const pkg = db.labPackages.find(p => p.id === packageId);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    const createdOrders = [];
    pkg.testIds.forEach(tId => {
      const testDef = db.labTestsCatalog.find(t => t.id === tId);
      if (testDef) {
        const orderId = genId('ORD');
        const newOrder = {
          id: orderId,
          packageId: pkg.id,
          packageName: pkg.name,
          patientId: patient.id,
          patientName: patient.name,
          patientAge: patient.age,
          patientGender: patient.gender,
          referringDoctor: referringDoctor || 'Dr. Priya Nair (AIIMS)',
          orderDate: new Date().toISOString(),
          testId: testDef.id,
          testName: testDef.name,
          category: testDef.category,
          tubeColor: testDef.tubeColor,
          sampleId: null,
          sampleCollectedAt: null,
          sampleCollectedBy: null,
          phlebotomyNotes: notes || `Ordered under ${pkg.name}`,
          status: 'ORDERED',
          results: [],
          pathologistRemarks: '',
          verifiedBy: '',
          verifiedAt: null,
          barcode: null
        };
        db.labOrders.push(newOrder);
        createdOrders.push(newOrder);
      }
    });

    // Auto-create invoice in INR
    const invoiceId = genId('INV');
    db.invoices.push({
      id: invoiceId,
      patientId: patient.id,
      patientName: patient.name,
      date: new Date().toISOString().split('T')[0],
      items: [
        { desc: `Health Package: ${pkg.name}`, qty: 1, rate: pkg.discountedPrice, amount: pkg.discountedPrice }
      ],
      subtotal: pkg.discountedPrice,
      tax: Number((pkg.discountedPrice * 0.05).toFixed(2)),
      discount: 0,
      total: Number((pkg.discountedPrice * 1.05).toFixed(2)),
      paymentMethod: 'UPI / Cash Counter',
      status: 'PENDING'
    });

    saveDb(db);
    return res.json({ success: true, message: `Created ${createdOrders.length} test orders for ${pkg.name}`, orders: createdOrders });
  }

  // Single test order
  const testDef = db.labTestsCatalog.find(t => t.id === testId);
  if (!testDef) {
    return res.status(404).json({ success: false, message: 'Test not found in catalog' });
  }

  const orderId = genId('ORD');
  const newOrder = {
    id: orderId,
    patientId: patient.id,
    patientName: patient.name,
    patientAge: patient.age,
    patientGender: patient.gender,
    referringDoctor: referringDoctor || 'Dr. Priya Nair / OPD Clinic',
    orderDate: new Date().toISOString(),
    testId: testDef.id,
    testName: testDef.name,
    category: testDef.category,
    tubeColor: testDef.tubeColor,
    sampleId: null,
    sampleCollectedAt: null,
    sampleCollectedBy: null,
    phlebotomyNotes: notes || '',
    status: 'ORDERED',
    results: [],
    pathologistRemarks: '',
    verifiedBy: '',
    verifiedAt: null,
    barcode: null
  };

  db.labOrders.push(newOrder);

  // Auto-record in billing
  db.invoices.push({
    id: genId('INV'),
    patientId: patient.id,
    patientName: patient.name,
    date: new Date().toISOString().split('T')[0],
    items: [
      { desc: `Laboratory: ${testDef.name}`, qty: 1, rate: testDef.price, amount: testDef.price }
    ],
    subtotal: testDef.price,
    tax: Number((testDef.price * 0.05).toFixed(2)),
    discount: 0,
    total: Number((testDef.price * 1.05).toFixed(2)),
    paymentMethod: 'UPI / Cash Pending',
    status: 'PENDING'
  });

  saveDb(db);
  res.json({ success: true, message: 'Blood test order created successfully', order: newOrder });
});

// Step 2 in Blood Test Center: Phlebotomist Collects Blood Sample
app.post('/api/lab/orders/:id/collect-sample', (req, res) => {
  const db = getDb();
  const order = db.labOrders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const { collectorName, notes, tubeColor } = req.body;
  const sampleId = `SMP-${Math.floor(10000 + Math.random() * 90000)}`;
  const barcode = `${sampleId.replace('SMP-', '')}-${order.testId.replace('LAB-', '')}-${new Date().getFullYear()}`;

  order.sampleId = sampleId;
  order.barcode = barcode;
  order.sampleCollectedAt = new Date().toISOString();
  order.sampleCollectedBy = collectorName || 'Suresh Verma (Chief Phlebotomist)';
  order.phlebotomyNotes = notes || 'Standard venous blood drawn via sterile BD vacutainer.';
  if (tubeColor) order.tubeColor = tubeColor;
  order.status = 'SAMPLE_COLLECTED';

  saveDb(db);
  res.json({
    success: true,
    message: `Blood sample collected successfully. Barcode: ${barcode}`,
    order
  });
});

// Step 3 in Blood Test Center: Load sample into Analyzer
app.post('/api/lab/orders/:id/start-processing', (req, res) => {
  const db = getDb();
  const order = db.labOrders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = 'PROCESSING';
  order.processingStartedAt = new Date().toISOString();
  saveDb(db);
  res.json({ success: true, message: 'Sample loaded into automated hematology/biochemistry analyzer', order });
});

// Step 4 in Blood Test Center: Record Test Results, Auto-Flag, and Pathologist Sign-off
app.post('/api/lab/orders/:id/results', (req, res) => {
  const db = getDb();
  const order = db.labOrders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const { results, pathologistRemarks, verifiedBy } = req.body;
  const testDef = db.labTestsCatalog.find(t => t.id === order.testId);

  // Auto-flagging logic
  const processedResults = (results || []).map(r => {
    let flag = 'NORMAL';
    const numVal = parseFloat(r.value);

    const paramDef = testDef ? testDef.parameters.find(p => p.key === r.key) : null;
    if (paramDef && !isNaN(numVal)) {
      if (paramDef.criticalLow !== undefined && numVal < paramDef.criticalLow) {
        flag = 'CRITICAL LOW';
      } else if (paramDef.criticalHigh !== undefined && numVal > paramDef.criticalHigh) {
        flag = 'CRITICAL HIGH';
      } else if (paramDef.normalMin !== undefined && numVal < paramDef.normalMin) {
        flag = 'LOW';
      } else if (paramDef.normalMax !== undefined && numVal > paramDef.normalMax) {
        flag = 'HIGH';
      }
    } else if (typeof r.value === 'string' && r.value.toLowerCase().includes('positive')) {
      flag = 'POSITIVE (ABNORMAL)';
    }

    return {
      ...r,
      flag
    };
  });

  order.results = processedResults;
  order.pathologistRemarks = pathologistRemarks || 'Results reviewed and clinically correlated with patient profile.';
  order.verifiedBy = verifiedBy || 'Suresh Verma, Lead Clinical Pathologist';
  order.verifiedAt = new Date().toISOString();
  order.status = 'COMPLETED';

  saveDb(db);
  res.json({
    success: true,
    message: 'Test report finalized, verified, and signed by Pathologist!',
    order
  });
});

// ----------------------------------------------------
// 3. PATIENTS (EHR / EMR)
// ----------------------------------------------------
app.get('/api/patients', (req, res) => {
  const db = getDb();
  const { search } = req.query;
  let list = db.patients || [];
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q))
    );
  }
  res.json({ success: true, count: list.length, patients: list });
});

app.get('/api/patients/:id', (req, res) => {
  const db = getDb();
  const patient = db.patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  const appointments = (db.appointments || []).filter(a => a.patientId === patient.id);
  const labOrders = (db.labOrders || []).filter(o => o.patientId === patient.id);
  const prescriptions = (db.prescriptions || []).filter(rx => rx.patientId === patient.id);
  const invoices = (db.invoices || []).filter(inv => inv.patientId === patient.id);
  const bed = (db.beds || []).find(b => b.patientId === patient.id);

  res.json({
    success: true,
    patient,
    history: {
      appointments,
      labOrders,
      prescriptions,
      invoices,
      admittedBed: bed || null
    }
  });
});

app.post('/api/patients', (req, res) => {
  const db = getDb();
  const { name, age, gender, dob, bloodGroup, phone, email, address, emergencyContact, allergies, chronicConditions, vitals } = req.body;
  if (!name || !gender) {
    return res.status(400).json({ success: false, message: 'Name and gender are required' });
  }

  const patientId = `PAT-${Math.floor(1000 + (db.patients.length + 1) * 23)}`;
  const newPatient = {
    id: patientId,
    name,
    age: Number(age) || 30,
    gender,
    dob: dob || '1990-01-01',
    bloodGroup: bloodGroup || 'O+',
    phone: phone || '+91 98000 00000',
    email: email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@example.in`,
    address: address || 'Ring Road, New Delhi',
    emergencyContact: emergencyContact || { name: 'Family Contact', relation: 'Family', phone: phone || '' },
    allergies: Array.isArray(allergies) ? allergies : (allergies ? [allergies] : ['None known']),
    chronicConditions: Array.isArray(chronicConditions) ? chronicConditions : (chronicConditions ? [chronicConditions] : []),
    registeredDate: new Date().toISOString().split('T')[0],
    vitals: vitals || {
      bloodPressure: "120/80 mmHg",
      pulse: 72,
      temperature: "98.6 °F",
      spO2: 99,
      weight: "68 kg",
      height: "170 cm",
      bmi: "23.5"
    }
  };

  db.patients.unshift(newPatient);

  db.users.push({
    id: `usr_${patientId.toLowerCase()}`,
    name,
    email: newPatient.email,
    password: "patient",
    role: "patient",
    patientId: patientId,
    phone: newPatient.phone,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"
  });

  saveDb(db);
  res.json({ success: true, message: 'Patient registered successfully', patient: newPatient });
});

app.put('/api/patients/:id', (req, res) => {
  const db = getDb();
  const patient = db.patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  Object.assign(patient, req.body);
  saveDb(db);
  res.json({ success: true, message: 'Patient updated', patient });
});

// ----------------------------------------------------
// 4. APPOINTMENTS & OPD QUEUE
// ----------------------------------------------------
app.get('/api/appointments', (req, res) => {
  const db = getDb();
  const { doctorName, patientId, status, date } = req.query;
  let list = db.appointments || [];

  if (doctorName) {
    list = list.filter(a => a.doctorName.toLowerCase().includes(doctorName.toLowerCase()));
  }
  if (patientId) {
    list = list.filter(a => a.patientId === patientId);
  }
  if (status) {
    list = list.filter(a => a.status.toUpperCase() === status.toUpperCase());
  }
  if (date) {
    list = list.filter(a => a.date === date);
  }

  res.json({ success: true, count: list.length, appointments: list });
});

app.post('/api/appointments', (req, res) => {
  const db = getDb();
  const { patientId, doctorName, date, time, reason, fee } = req.body;

  const patient = db.patients.find(p => p.id === patientId);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  const doctor = db.users.find(u => u.name === doctorName || u.role === 'doctor');
  const tokenPrefix = doctor ? doctor.name.split(' ').pop().charAt(0) : 'T';
  const tokenNum = `${tokenPrefix}-${Math.floor(10 + Math.random() * 89)}`;

  const newApt = {
    id: genId('APT'),
    patientId: patient.id,
    patientName: patient.name,
    doctorName: doctor ? doctor.name : (doctorName || 'Dr. Priya Nair'),
    doctorSpecialty: doctor ? (doctor.specialty || 'Cardiology') : 'General OPD',
    date: date || new Date().toISOString().split('T')[0],
    time: time || '10:00 AM',
    token: tokenNum,
    reason: reason || 'General Consultation',
    status: 'SCHEDULED',
    fee: fee || (doctor ? doctor.consultationFee : 800) || 800
  };

  db.appointments.unshift(newApt);
  saveDb(db);
  res.json({ success: true, message: 'Appointment booked successfully', appointment: newApt });
});

app.put('/api/appointments/:id/status', (req, res) => {
  const db = getDb();
  const apt = db.appointments.find(a => a.id === req.params.id);
  if (!apt) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  apt.status = req.body.status.toUpperCase();
  saveDb(db);
  res.json({ success: true, message: `Appointment status updated to ${apt.status}`, appointment: apt });
});

// ----------------------------------------------------
// 5. DOCTOR CONSULTATIONS & PRESCRIPTIONS
// ----------------------------------------------------
app.get('/api/prescriptions', (req, res) => {
  const db = getDb();
  const { patientId } = req.query;
  let list = db.prescriptions || [];
  if (patientId) {
    list = list.filter(rx => rx.patientId === patientId);
  }
  res.json({ success: true, prescriptions: list });
});

app.post('/api/prescriptions', (req, res) => {
  const db = getDb();
  const { patientId, doctorName, diagnosis, clinicalNotes, medicines, recommendedTests, appointmentId } = req.body;

  const patient = db.patients.find(p => p.id === patientId);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  const newRx = {
    id: genId('RX'),
    patientId: patient.id,
    patientName: patient.name,
    doctorName: doctorName || 'Dr. Priya Nair',
    date: new Date().toISOString().split('T')[0],
    diagnosis: diagnosis || 'General Clinical Review',
    clinicalNotes: clinicalNotes || 'Follow prescribed medication schedule. Review if symptoms persist.',
    medicines: medicines || [],
    recommendedTests: recommendedTests || []
  };

  db.prescriptions.unshift(newRx);

  if (appointmentId) {
    const apt = db.appointments.find(a => a.id === appointmentId);
    if (apt) apt.status = 'COMPLETED';
  }

  // Auto-route ordered blood tests to Laboratory
  if (Array.isArray(recommendedTests) && recommendedTests.length > 0) {
    recommendedTests.forEach(testNameOrId => {
      const testDef = db.labTestsCatalog.find(t => 
        t.id === testNameOrId || 
        t.name.toLowerCase().includes(testNameOrId.toLowerCase())
      );
      if (testDef) {
        db.labOrders.push({
          id: genId('ORD'),
          patientId: patient.id,
          patientName: patient.name,
          patientAge: patient.age,
          patientGender: patient.gender,
          referringDoctor: doctorName || 'Dr. Priya Nair',
          orderDate: new Date().toISOString(),
          testId: testDef.id,
          testName: testDef.name,
          category: testDef.category,
          tubeColor: testDef.tubeColor,
          sampleId: null,
          sampleCollectedAt: null,
          sampleCollectedBy: null,
          phlebotomyNotes: `Ordered during consultation for ${diagnosis}`,
          status: 'ORDERED',
          results: [],
          pathologistRemarks: '',
          verifiedBy: '',
          verifiedAt: null,
          barcode: null
        });
      }
    });
  }

  saveDb(db);
  res.json({ success: true, message: 'Prescription generated and lab tests ordered', prescription: newRx });
});

// ----------------------------------------------------
// 6. IPD & BED MANAGEMENT
// ----------------------------------------------------
app.get('/api/beds', (req, res) => {
  const db = getDb();
  res.json({ success: true, beds: db.beds || [] });
});

app.post('/api/beds/:id/admit', (req, res) => {
  const db = getDb();
  const bed = db.beds.find(b => b.id === req.params.id);
  if (!bed) {
    return res.status(404).json({ success: false, message: 'Bed not found' });
  }
  if (bed.status === 'OCCUPIED') {
    return res.status(400).json({ success: false, message: 'Bed is already occupied' });
  }

  const { patientId } = req.body;
  const patient = db.patients.find(p => p.id === patientId);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  bed.status = 'OCCUPIED';
  bed.patientId = patient.id;
  bed.patientName = patient.name;
  bed.admittedDate = new Date().toISOString().split('T')[0];

  saveDb(db);
  res.json({ success: true, message: `Patient ${patient.name} admitted to ${bed.number} (${bed.ward})`, bed });
});

app.post('/api/beds/:id/discharge', (req, res) => {
  const db = getDb();
  const bed = db.beds.find(b => b.id === req.params.id);
  if (!bed) {
    return res.status(404).json({ success: false, message: 'Bed not found' });
  }

  const patientName = bed.patientName;
  bed.status = 'AVAILABLE';
  bed.patientId = null;
  bed.patientName = null;
  bed.admittedDate = null;

  saveDb(db);
  res.json({ success: true, message: `Patient ${patientName || ''} discharged from ${bed.number}. Bed is now sanitized and ready.`, bed });
});

// ----------------------------------------------------
// 7. PHARMACY & INVENTORY
// ----------------------------------------------------
app.get('/api/pharmacy/inventory', (req, res) => {
  const db = getDb();
  res.json({ success: true, inventory: db.pharmacyInventory || [] });
});

app.post('/api/pharmacy/dispense', (req, res) => {
  const db = getDb();
  const { medicineId, quantity, patientId } = req.body;
  const med = db.pharmacyInventory.find(m => m.id === medicineId);
  if (!med) {
    return res.status(404).json({ success: false, message: 'Medicine not found' });
  }
  const qty = Number(quantity) || 1;
  if (med.stock < qty) {
    return res.status(400).json({ success: false, message: `Insufficient stock! Only ${med.stock} units available.` });
  }

  med.stock -= qty;

  if (patientId) {
    const patient = db.patients.find(p => p.id === patientId);
    if (patient) {
      const amount = Number((med.unitPrice * qty).toFixed(2));
      db.invoices.push({
        id: genId('INV'),
        patientId: patient.id,
        patientName: patient.name,
        date: new Date().toISOString().split('T')[0],
        items: [
          { desc: `Pharmacy: ${med.name} (${qty} units)`, qty, rate: med.unitPrice, amount }
        ],
        subtotal: amount,
        tax: Number((amount * 0.05).toFixed(2)),
        discount: 0,
        total: Number((amount * 1.05).toFixed(2)),
        paymentMethod: 'UPI / Cash Counter',
        status: 'PAID'
      });
    }
  }

  saveDb(db);
  res.json({ success: true, message: `Dispensed ${qty} units of ${med.name}`, remainingStock: med.stock });
});

// ----------------------------------------------------
// 8. BILLING & INVOICES
// ----------------------------------------------------
app.get('/api/invoices', (req, res) => {
  const db = getDb();
  const { patientId, status } = req.query;
  let list = db.invoices || [];

  if (patientId) {
    list = list.filter(inv => inv.patientId === patientId);
  }
  if (status) {
    list = list.filter(inv => inv.status.toUpperCase() === status.toUpperCase());
  }

  res.json({ success: true, count: list.length, invoices: [...list].reverse() });
});

app.post('/api/invoices/:id/pay', (req, res) => {
  const db = getDb();
  const inv = db.invoices.find(i => i.id === req.params.id);
  if (!inv) {
    return res.status(404).json({ success: false, message: 'Invoice not found' });
  }

  inv.status = 'PAID';
  inv.paymentMethod = req.body.paymentMethod || 'UPI / Online';
  inv.paidAt = new Date().toISOString();

  saveDb(db);
  res.json({ success: true, message: 'Payment recorded successfully', invoice: inv });
});

// ----------------------------------------------------
// 9. OVERVIEW ANALYTICS & STATS (ADMIN & ALL PORTALS)
// ----------------------------------------------------
app.get('/api/analytics/overview', (req, res) => {
  const db = getDb();
  
  const totalPatients = (db.patients || []).length;
  const totalBeds = (db.beds || []).length;
  const occupiedBeds = (db.beds || []).filter(b => b.status === 'OCCUPIED').length;
  const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  
  const totalOrders = (db.labOrders || []).length;
  const completedOrders = (db.labOrders || []).filter(o => o.status === 'COMPLETED').length;
  const pendingOrders = totalOrders - completedOrders;

  const totalAppointments = (db.appointments || []).length;
  const todayAppointments = (db.appointments || []).filter(a => a.date === '2026-11-07' || a.date === new Date().toISOString().split('T')[0]).length;

  const totalRevenue = (db.invoices || [])
    .filter(i => i.status === 'PAID')
    .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

  const pendingRevenue = (db.invoices || [])
    .filter(i => i.status === 'PENDING')
    .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

  res.json({
    success: true,
    stats: {
      totalPatients,
      bedOccupancy: {
        total: totalBeds,
        occupied: occupiedBeds,
        available: totalBeds - occupiedBeds,
        rate: bedOccupancyRate
      },
      bloodLab: {
        total: totalOrders,
        completed: completedOrders,
        pending: pendingOrders
      },
      appointments: {
        total: totalAppointments,
        today: todayAppointments
      },
      finances: {
        currency: '₹',
        collectedRevenue: Number(totalRevenue.toFixed(2)),
        pendingRevenue: Number(pendingRevenue.toFixed(2)),
        totalBilled: Number((totalRevenue + pendingRevenue).toFixed(2))
      }
    }
  });
});

app.post('/api/system/reset', (req, res) => {
  resetDb();
  res.json({ success: true, message: 'System database successfully reset to clean Indian clinical demonstration baseline.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`========================================================================`);
  console.log(`🏥 SANJEEVANI MULTISPECIALTY HOSPITAL & DIAGNOSTIC BLOOD CENTER 🔬`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`========================================================================`);
});

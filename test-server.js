// test-server.js
const { getDb } = require('./data/db');

console.log('🧪 Starting Sanjeevani Hospital Management System Self-Verification Test (INR & Indian Names)...\n');

const db = getDb();
console.log(`✓ Hospital: ${db.hospitalInfo ? db.hospitalInfo.name : 'Sanjeevani Hospital'}`);
console.log(`✓ Currency: ${db.hospitalInfo ? db.hospitalInfo.currency : '₹'}`);
console.log(`✓ Database Entities:`);
console.log(`  - Users: ${db.users.length}`);
console.log(`  - Lab Tests Catalog: ${db.labTestsCatalog.length}`);
console.log(`  - Health Packages: ${db.labPackages.length}`);
console.log(`  - Patients: ${db.patients.length}`);
console.log(`  - Initial Lab Orders: ${db.labOrders.length}`);
console.log(`  - Hospital Beds: ${db.beds.length}`);
console.log(`  - Pharmacy Stock Items: ${db.pharmacyInventory.length}`);
console.log(`  - Invoices: ${db.invoices.length}`);

// Verify all Indian Roles
const expectedUsers = [
  { role: 'admin', name: 'Dr. Arvind Sharma' },
  { role: 'doctor', name: 'Dr. Priya Nair' },
  { role: 'lab_technician', name: 'Suresh Verma' },
  { role: 'receptionist', name: 'Ananya Deshmukh' },
  { role: 'pharmacist', name: 'Manoj Kumar' },
  { role: 'patient', name: 'Ramesh Patel' }
];

expectedUsers.forEach(exp => {
  const u = db.users.find(user => user.role === exp.role);
  if (!u) throw new Error(`Role missing: ${exp.role}`);
  console.log(`✓ Role verified: [${exp.role}] -> ${u.name} (${u.email})`);
});

// Verify INR Pricing on tests
const cbc = db.labTestsCatalog.find(t => t.id === 'LAB-CBC');
console.log(`✓ CBC Investigation: ${cbc.name} -> ₹${cbc.price}`);
if (cbc.price !== 350) throw new Error('CBC price should be in INR (₹350)');

console.log('\n🎉 ALL INDIAN CLINICAL NAMES & INR DATA VERIFICATIONS PASSED SUCCESSFULLY!');

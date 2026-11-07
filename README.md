# 🏥 Sanjeevani Multi-Specialty Hospital & Diagnostic Blood Center

A modern, full-stack Hospital Management System (HMS / HIS) featuring an advanced **Laboratory Information System (LIS) / Blood Test Center** with authentic Indian names, pricing in Indian Rupees (**₹ INR**), separate role-based logins, real-time phlebotomy workflows, automated abnormal value detection, and official signed pathology reports.

---

## 🌟 Key Features & Modules

### 🔬 1. Blood Test Center & Laboratory Information System (LIS)
* **Comprehensive Blood Investigation Directory (in ₹ INR)**:
  * Complete Blood Count (CBC) with differential & ESR: **₹350**
  * Lipid Profile Panel (Cholesterol, Triglycerides, HDL, LDL, VLDL): **₹650**
  * Liver Function Test (LFT - SGPT, SGOT, Bilirubin, Albumin): **₹750**
  * Kidney Function Test (KFT / RFT - Creatinine, Urea, Uric Acid): **₹700**
  * Blood Glucose (FBS & PPBS Fasting/Post-Prandial): **₹150**
  * Glycated Hemoglobin (HbA1c 3-Month Average): **₹550**
  * Thyroid Function Panel (FT3, FT4, TSH Ultrasensitive): **₹650**
  * Serum Electrolytes (Sodium, Potassium, Chloride, Bicarbonate): **₹450**
  * Dengue Duo Serology (NS1 Antigen + IgM/IgG Antibodies): **₹900**
  * Blood Grouping & Rh Factor Typing: **₹150**
* **Preventive Health Checkup Packages (in ₹ INR)**:
  * Executive Comprehensive Health Checkup: **₹2,499** (Includes 6 key panels)
  * Comprehensive Diabetic Care Panel: **₹1,499**
  * Advanced Cardio-Metabolic Screen: **₹1,899**
* **Clinical Phlebotomy Workflow**:
  * Barcode & Sample ID generation (e.g. `SMP-88102`)
  * Color-coded vacutainer tube tracking (Purple EDTA, Red SST Gel, Grey Fluoride, Blue Citrate)
  * Specimen status pipeline: `ORDERED` ➔ `SAMPLE_COLLECTED` ➔ `PROCESSING` ➔ `COMPLETED`
* **Analyzer Result Entry & Auto-Flagging**:
  * Direct measurement entry per sub-parameter
  * Real-time physiological range bounds checking:
    * `[NORMAL]`
    * `[HIGH]`
    * `[LOW]`
    * `[CRITICAL ABNORMAL]`
* **Pathologist Verification & Report Generation**:
  * Senior Pathologist clinical interpretation & impression notes
  * Digital signature stamp & verification QR code
  * **One-Click Clinical Laboratory Report Print/PDF Generator** formatted with hospital letterhead and NABL/ISO 15189 accreditation details.

---

### 👥 2. Multi-Role Authentication & Indian Demo Logins

The application features role-based access control (RBAC). You can switch between roles in 1 click using the top header role bar or sign in via the login screen:

| Role | Staff / Patient Name | Demo Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **🔬 Pathologist / Lab Tech** | **Suresh Verma** | `lab@hospital.com` | `lab` | Phlebotomy queue, vacutainer tube tracking, parameter result entry, abnormal auto-flagging, digital sign-off |
| **🩺 Chief Cardiologist** | **Dr. Priya Nair (AIIMS)** | `doctor@hospital.com` | `doctor` | OPD patient queue, consultations, e-prescriptions, 1-click lab orders, patient EHR |
| **🩺 Consultant Physician** | **Dr. Rajesh Kulkarni** | `doctor2@hospital.com` | `doctor` | Diabetology & General Medicine OPD consultation desk |
| **📋 Receptionist / Front Desk** | **Ananya Deshmukh** | `reception@hospital.com` | `reception` | Patient registration, OPD appointment scheduling, walk-in blood tests, IPD bed allocation |
| **👨‍💼 Medical Director (Admin)**| **Dr. Arvind Sharma** | `admin@hospital.com` | `admin` | Executive KPIs, lab test volume, bed occupancy rates, revenue analytics in ₹ INR, staff directory |
| **💊 Pharmacist & Billing** | **Manoj Kumar** | `pharmacy@hospital.com` | `pharmacy` | Dispensing drugs, stock tracking, itemized hospital invoices (Lab + Bed + OPD + Rx) |
| **👤 Patient Portal** | **Ramesh Patel** | `patient@hospital.com` | `patient` | Personal EHR, download official blood reports, view appointments, self-request lab tests |

---

### 🩺 3. Doctor Portal & Clinical Consultation Desk
* Live OPD Token Queue with real-time patient queue status.
* Triage vitals glance (Blood Pressure, Pulse, SpO2, Temperature, BMI).
* E-Prescriptions with Indian formulations (e.g. *Dolo 650mg*, *Atorva 20mg*, *Glycomet-SR 1000mg*, *Augmentin 625mg*).
* **1-Click Blood Test Dispatch**: Doctors can select blood tests during consultation, which immediately notifies the blood laboratory.
* Electronic Health Record (EHR) viewer for comprehensive patient history.

---

### 📋 4. Reception & Inpatient (IPD) Bed Management
* Comprehensive patient registration (demographics, blood group, emergency contact, allergies, initial vitals).
* Doctor appointment booking with automatic token generation.
* Visual Bed Allocation Grid (in ₹ INR):
  * Intensive Coronary Care Unit (ICCU): **₹4,500/day**
  * Deluxe Private AC Suite: **₹2,800/day**
  * Male & Female General Wards: **₹750/day**
  * Emergency Observation Bay: **₹1,500/day**
* One-click inpatient admission and discharge.

---

### 💊 5. Pharmacy & Consolidated Billing (in ₹ INR)
* Real-time stock counts, low-stock warnings, and batch tracking.
* Consolidated billing combining doctor consultation, lab investigation fees, bed charges, and medication costs into a single invoice.
* Payment recording across **Instant UPI / QR (Google Pay, PhonePe, Paytm)**, **Cash at Counter**, **RuPay / Credit / Debit Cards**, and **Ayushman Bharat (PM-JAY) / TPA Health Insurance claims**.

---

## 🚀 How to Run the Hospital Management System

1. **Start the Application**:
   ```bash
   node server.js
   ```

2. **Access the System**:
   Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

3. **Testing Different Logins**:
   Use the **"Role"** pill bar at the top of the screen to effortlessly hop between **Suresh Verma (Lab)**, **Dr. Priya Nair (Doctor)**, **Ananya (Reception)**, **Manoj (Pharmacy)**, **Dr. Arvind (Admin)**, and **Ramesh Patel (Patient)**!

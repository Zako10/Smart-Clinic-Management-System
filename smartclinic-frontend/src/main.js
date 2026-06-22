import './styles.css';
import heroImage from './assets/hero.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'smartclinic.token';

const state = {
  token: localStorage.getItem(TOKEN_KEY) || '',
  user: null,
  health: 'checking',
  toast: '',
  data: {},
  lookups: {
    clinics: [],
    doctors: [],
    patients: [],
    appointments: [],
  },
};

const routes = [
  { path: '/', label: 'Home', public: true },
  { path: '/services', label: 'Services', public: true },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/patients', label: 'Patients' },
  { path: '/appointments', label: 'Appointments' },
  { path: '/billing', label: 'Billing' },
  { path: '/account', label: 'Account', public: true },
];

const app = document.querySelector('#app');

window.addEventListener('hashchange', render);
document.addEventListener('submit', handleSubmit);
document.addEventListener('click', handleClick);

init();

async function init() {
  await refreshHealth();
  if (state.token) {
    await loadCurrentUser();
  }
  render();
}

function render() {
  const path = currentPath();
  const route = routes.find((item) => item.path === path) || routes[0];

  document.title = `${route.label} | Smart Clinic`;
  app.innerHTML = `
    <div class="site-shell">
      ${navTemplate(route.path)}
      <main id="page" class="page-shell">
        ${pageTemplate(route.path)}
      </main>
      ${footerTemplate()}
      ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ''}
    </div>
  `;

  hydratePage(route.path);
}

function navTemplate(activePath) {
  return `
    <header class="navbar">
      <a href="#/" class="brand" aria-label="Smart Clinic home">
        <span class="brand-mark">SC</span>
        <span>SmartClinic</span>
      </a>
      <nav class="nav-links">
        ${routes
          .filter((route) => route.path !== '/account')
          .map(
            (route) => `
              <a href="#${route.path}" class="${activePath === route.path ? 'active' : ''}">
                ${route.label}
              </a>
            `,
          )
          .join('')}
      </nav>
      <div class="nav-actions">
        <span class="health ${state.health}" title="Connection status">${healthLabel()}</span>
        ${
          state.token
            ? '<a class="nav-button" href="#/account">Account</a>'
            : '<a class="nav-button" href="#/account">Login</a><a class="signup-button" href="#/account?mode=signup">Sign up</a>'
        }
      </div>
    </header>
  `;
}

function pageTemplate(path) {
  if (path === '/services') return servicesPage();
  if (path === '/dashboard') return dashboardPage();
  if (path === '/patients') return patientsPage();
  if (path === '/appointments') return appointmentsPage();
  if (path === '/billing') return billingPage();
  if (path === '/account') return accountPage();
  return homePage();
}

function homePage() {
  return `
    <section class="hero-section">
      <div class="hero-copy">
        <p class="eyebrow">Clinic management, without the chaos</p>
        <h1>Give your clinic team a calmer way to work.</h1>
        <p class="hero-text">
          SmartClinic brings patient records, appointments, invoices, and daily coordination into one focused workspace for modern clinics.
        </p>
        <div class="hero-actions">
          <a class="primary-link" href="#/account">Sign in</a>
          <a class="signup-link" href="#/account?mode=signup">Sign up</a>
          <a class="secondary-link" href="#/services">View services</a>
        </div>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <img src="${heroImage}" alt="" />
        <div class="hero-stat top">
          <strong>Today</strong>
          <span>${healthLabel()}</span>
        </div>
        <div class="hero-stat bottom">
          <strong>Front desk ready</strong>
          <span>Patients, visits, payments, and staff notes in one place</span>
        </div>
      </div>
    </section>

    <section class="feature-strip">
      ${metricCard('Built for real roles', 'Reception, doctors, and administrators each see the work they need.')}
      ${metricCard('Daily work first', 'Fast patient lookup, scheduling, and billing without clutter.')}
      ${metricCard('Calm by default', 'Clear screens, plain language, and fewer interruptions for busy clinic staff.')}
    </section>

    <section class="section-block split">
      <div>
        <p class="eyebrow">Daily command center</p>
        <h2>Designed around the work your team repeats every day.</h2>
      </div>
      <div class="workflow-list">
        ${workflowItem('01', 'Register patients and keep contact details close.')}
        ${workflowItem('02', 'Coordinate doctors, rooms, and appointment times.')}
        ${workflowItem('03', 'Prepare invoices and record payments before checkout.')}
      </div>
    </section>
  `;
}

function servicesPage() {
  return `
    <section class="page-hero">
      <p class="eyebrow">Services</p>
      <h1>From first check-in to final payment, every step stays organized.</h1>
    </section>
    <section class="service-grid">
      ${serviceCard('Patient records', 'Create and review the details staff need at reception and checkout.')}
      ${serviceCard('Care scheduling', 'Coordinate patients, doctors, visit times, and appointment notes from one page.')}
      ${serviceCard('Clinic administration', 'Keep branches and doctors organized as your clinic grows.')}
      ${serviceCard('Billing flow', 'Prepare invoices, post payments, and keep payment status easy to follow.')}
      ${serviceCard('Private staff access', 'Staff sign in before opening sensitive clinic information.')}
      ${serviceCard('Daily overview', 'A focused dashboard shows what needs attention today.')}
    </section>
  `;
}

function dashboardPage() {
  return protectedPage(`
    <section class="dashboard-head">
      <div>
        <p class="eyebrow">Dashboard</p>
        <h1>${sessionTitle()}</h1>
      </div>
      <button class="primary-button" data-action="refresh-dashboard" type="button">Refresh</button>
    </section>
    <section class="stats-grid" id="dashboard-stats">
      ${skeletonCards()}
    </section>
    <section class="section-block">
      <div class="section-heading">
        <h2>Workspace</h2>
        <p>Choose the area you want to work on next.</p>
      </div>
      <div class="module-grid">
        ${moduleCard('Patients', '/patients', 'Register and review clinic patients.')}
        ${moduleCard('Appointments', '/appointments', 'Review schedules and create visits.')}
        ${moduleCard('Billing', '/billing', 'Prepare invoices and record payments.')}
      </div>
    </section>
  `);
}

function patientsPage() {
  return protectedPage(`
    <section class="workspace-layout">
      <div class="work-panel">
        <div class="section-heading">
          <p class="eyebrow">Patients</p>
          <h1>Patient registry</h1>
        </div>
        <div id="patients-table">${tableShell('Loading patients...')}</div>
      </div>
      <aside class="form-panel">
        <h2>New patient</h2>
        <form class="stack-form" data-form="patient">
          ${input('firstName', 'First name')}
          ${input('lastName', 'Last name')}
          ${input('phone', 'Phone')}
          ${lookupControl('clinicId', 'Clinic', state.lookups.clinics, clinicOption, 'Clinic reference number')}
          <button class="primary-button" type="submit">Create patient</button>
        </form>
      </aside>
    </section>
  `);
}

function appointmentsPage() {
  return protectedPage(`
    <section class="workspace-layout">
      <div class="work-panel">
        <div class="section-heading">
          <p class="eyebrow">Appointments</p>
          <h1>Care schedule</h1>
        </div>
        <div id="appointments-table">${tableShell('Loading appointments...')}</div>
      </div>
      <aside class="form-panel">
        <h2>New appointment</h2>
        <form class="stack-form" data-form="appointment">
          ${lookupControl('patientId', 'Patient', state.lookups.patients, patientOption, 'Patient reference number')}
          ${lookupControl('doctorId', 'Doctor', state.lookups.doctors, doctorOption, 'Doctor reference number')}
          ${lookupControl('clinicId', 'Clinic', state.lookups.clinics, clinicOption, 'Clinic reference number')}
          ${input('dateTime', 'Date and time', 'datetime-local')}
          <label>Notes<textarea name="notes" rows="4"></textarea></label>
          <button class="primary-button" type="submit">Create appointment</button>
        </form>
      </aside>
    </section>
  `);
}

function billingPage() {
  return protectedPage(`
    <section class="workspace-layout">
      <div class="work-panel">
        <div class="section-heading">
          <p class="eyebrow">Billing</p>
          <h1>Invoices and payments</h1>
        </div>
        <div id="invoices-table">${tableShell('Loading invoices...')}</div>
      </div>
      <aside class="form-panel">
        <h2>New invoice</h2>
        <form class="stack-form" data-form="invoice">
          ${lookupControl('appointmentId', 'Appointment', state.lookups.appointments, appointmentOption, 'Appointment reference number')}
          ${input('totalAmount', 'Total amount', 'number', '350')}
          <button class="primary-button" type="submit">Create invoice</button>
        </form>
        <hr />
        <h2>Post payment</h2>
        <form class="stack-form" data-form="payment">
          ${input('invoiceId', 'Invoice reference number', 'number', '1')}
          ${input('amount', 'Amount', 'number', '350')}
          <label>Method<select name="method"><option>Cash</option><option>Card</option></select></label>
          <button class="primary-button" type="submit">Post payment</button>
        </form>
      </aside>
    </section>
  `);
}

function accountPage() {
  const isSignupMode = location.hash.includes('mode=signup');

  if (state.token) {
    return `
      <section class="account-shell">
        <div class="auth-card">
          <p class="eyebrow">Session</p>
          <h1>${sessionTitle()}</h1>
          <p class="muted">Your clinic workspace is active on this device.</p>
          <div class="profile-summary">
            ${profileRow('Name', userName())}
            ${profileRow('Role', userRole())}
            ${profileRow('Access', 'Clinic staff')}
          </div>
          <button class="danger-button" data-action="logout" type="button">Log out</button>
        </div>
      </section>
    `;
  }

  return `
    <section class="account-shell">
      <div class="auth-visual">
        <p class="eyebrow">Staff access</p>
        <h1>Sign in to manage clinic operations.</h1>
        <p>Use your clinic account to open appointments, patient records, and billing tools.</p>
      </div>
      <div class="auth-card">
        <form class="stack-form" data-form="login">
          <h2>Welcome back</h2>
          ${input('email', 'Email', 'email')}
          ${input('password', 'Password', 'password')}
          <button class="primary-button" type="submit">Login</button>
        </form>
        <details ${isSignupMode ? 'open' : ''}>
          <summary>Create staff account</summary>
          <form class="stack-form" data-form="register">
            ${input('firstName', 'First name')}
            ${input('lastName', 'Last name')}
            ${input('email', 'Email', 'email')}
            ${input('password', 'Password', 'password')}
            ${input('phone', 'Phone')}
            <input name="clinicId" type="hidden" value="${defaultClinicId()}" />
            <button class="primary-button" type="submit">Register</button>
          </form>
        </details>
      </div>
    </section>
  `;
}

function protectedPage(content) {
  if (!state.token) {
    return `
      <section class="page-hero compact">
        <p class="eyebrow">Staff only</p>
        <h1>Sign in before opening the clinic workspace.</h1>
        <a class="primary-link" href="#/account">Go to login</a>
      </section>
    `;
  }

  return content;
}

async function hydratePage(path) {
  if (path === '/account' && !state.token && (await loadLookups(['clinics']))) {
    render();
    return;
  }
  if (path === '/dashboard' && state.token) await loadDashboard();
  if (path === '/patients' && state.token) {
    if (await loadLookups(['clinics'])) {
      render();
      return;
    }
    await loadPatients();
  }
  if (path === '/appointments' && state.token) {
    if (await loadLookups(['patients', 'doctors', 'clinics'])) {
      render();
      return;
    }
    await loadAppointments();
  }
  if (path === '/billing' && state.token) {
    if (await loadLookups(['appointments'])) {
      render();
      return;
    }
    await loadInvoices();
  }
}

async function handleSubmit(event) {
  const form = event.target.closest('form[data-form]');
  if (!form) return;

  event.preventDefault();
  const type = form.dataset.form;
  const data = formData(form);

  try {
    if (type === 'login') {
      await login(data);
      return;
    }
    if (type === 'register') {
      data.clinicId = Number(data.clinicId);
      await register(data);
      return;
    }
    if (type === 'patient') {
      await api('/Patient', { method: 'POST', body: numberFields(data, ['clinicId']) });
      notify('Patient created.');
      await loadPatients();
      form.reset();
      return;
    }
    if (type === 'appointment') {
      const body = numberFields(data, ['patientId', 'doctorId', 'clinicId']);
      body.dateTime = new Date(data.dateTime).toISOString();
      body.status = 'Scheduled';
      await api('/Appointment', { method: 'POST', body });
      notify('Appointment created.');
      await loadAppointments();
      return;
    }
    if (type === 'invoice') {
      await api('/Invoice', { method: 'POST', body: numberFields(data, ['appointmentId', 'totalAmount']) });
      notify('Invoice created.');
      await loadInvoices();
      return;
    }
    if (type === 'payment') {
      await api('/Payment', { method: 'POST', body: numberFields(data, ['invoiceId', 'amount']) });
      notify('Payment posted.');
      await loadInvoices();
    }
  } catch (error) {
    notify(friendlyError(error));
  }
}

async function handleClick(event) {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;

  if (action === 'logout') {
    state.token = '';
    state.user = null;
    localStorage.removeItem(TOKEN_KEY);
    notify('Logged out.');
    location.hash = '#/account';
    render();
  }

  if (action === 'refresh-dashboard') {
    await loadDashboard();
  }
}

async function login(data) {
  const response = await api('/Auth/login', { method: 'POST', body: data, publicRequest: true });
  saveToken(response);
  await loadCurrentUser();
  notify('Logged in.');
  location.hash = '#/dashboard';
  render();
}

async function register(data) {
  const response = await api('/Auth/register', { method: 'POST', body: data, publicRequest: true });
  saveToken(response);
  await loadCurrentUser();
  notify('Account created.');
  location.hash = '#/dashboard';
  render();
}

async function loadCurrentUser() {
  try {
    state.user = await api('/Auth/me');
  } catch {
    state.token = '';
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function refreshHealth() {
  try {
    await api('/health', { publicRequest: true });
    state.health = 'online';
  } catch {
    state.health = 'offline';
  }
}

async function loadDashboard() {
  const results = await Promise.allSettled([
    api('/Patient?pageNumber=1&pageSize=10'),
    api('/Appointment?pageNumber=1&pageSize=10'),
    api('/Invoice'),
  ]);
  const patients = unwrapCount(results[0]);
  const appointments = unwrapCount(results[1]);
  const invoices = Array.isArray(results[2].value?.data) ? results[2].value.data.length : 0;
  const target = document.querySelector('#dashboard-stats');
  if (target) {
    target.innerHTML = `
      ${statCard('Patients', patients)}
      ${statCard('Appointments', appointments)}
      ${statCard('Invoices', invoices)}
    `;
  }
}

async function loadPatients() {
  const response = await api('/Patient?pageNumber=1&pageSize=20');
  state.data.patients = response.data?.items || response.data?.Items || [];
  state.lookups.patients = state.data.patients;
  renderTable('#patients-table', state.data.patients, ['id', 'fullName', 'phone']);
}

async function loadAppointments() {
  const response = await api('/Appointment?pageNumber=1&pageSize=20');
  state.data.appointments = response.data?.items || response.data?.Items || [];
  state.lookups.appointments = state.data.appointments;
  renderTable('#appointments-table', state.data.appointments, ['id', 'dateTime', 'patientId', 'doctorId', 'clinicId', 'status']);
}

async function loadInvoices() {
  const response = await api('/Invoice');
  state.data.invoices = response.data || [];
  renderTable('#invoices-table', state.data.invoices, ['id', 'appointmentId', 'totalAmount', 'status']);
}

async function loadLookups(types) {
  let changed = false;

  await Promise.all(
    types.map(async (type) => {
      if (state.lookups[type]?.length) return;
      try {
        if (type === 'clinics') {
          const response = await api('/Clinic');
          state.lookups.clinics = response.data || [];
          changed = state.lookups.clinics.length > 0 || changed;
        }
        if (type === 'doctors') {
          const response = await api('/Doctor?pageNumber=1&pageSize=50');
          state.lookups.doctors = response.data?.items || response.data?.Items || [];
          changed = state.lookups.doctors.length > 0 || changed;
        }
        if (type === 'patients') {
          const response = await api('/Patient?pageNumber=1&pageSize=50');
          state.lookups.patients = response.data?.items || response.data?.Items || [];
          changed = state.lookups.patients.length > 0 || changed;
        }
        if (type === 'appointments') {
          const response = await api('/Appointment?pageNumber=1&pageSize=50');
          state.lookups.appointments = response.data?.items || response.data?.Items || [];
          changed = state.lookups.appointments.length > 0 || changed;
        }
      } catch {
        state.lookups[type] = [];
      }
    }),
  );

  return changed;
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.publicRequest ? {} : authHeaders()),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw payload;
  return payload;
}

function saveToken(response) {
  const token = response.data?.token || response.data?.Token;
  if (!token) throw new Error('Could not start your session. Please try again.');
  state.token = token;
  localStorage.setItem(TOKEN_KEY, token);
}

function renderTable(selector, rows, columns) {
  const target = document.querySelector(selector);
  if (!target) return;
  if (!rows.length) {
    target.innerHTML = `<div class="empty-state">No records yet.</div>`;
    return;
  }
  target.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr>${columns.map((column) => `<th>${columnLabel(column)}</th>`).join('')}</tr></thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  ${columns.map((column) => `<td>${formatValue(row[column] ?? row[pascal(column)])}</td>`).join('')}
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function footerTemplate() {
  return `
    <footer class="footer">
      <span>SmartClinic Management System</span>
      <span>Clinic operations made simpler</span>
      <span>Patients, scheduling, and billing</span>
    </footer>
  `;
}

function metricCard(title, text) {
  return `<article class="metric-card"><strong>${title}</strong><p>${text}</p></article>`;
}

function workflowItem(number, text) {
  return `<div class="workflow-item"><span>${number}</span><p>${text}</p></div>`;
}

function serviceCard(title, text) {
  return `<article class="service-card"><h2>${title}</h2><p>${text}</p></article>`;
}

function moduleCard(title, path, text) {
  return `<a class="module-card" href="#${path}"><h2>${title}</h2><p>${text}</p></a>`;
}

function statCard(title, value) {
  return `<article class="stat-card"><span>${title}</span><strong>${value}</strong></article>`;
}

function skeletonCards() {
  return `${statCard('Patients', '...')}${statCard('Appointments', '...')}${statCard('Invoices', '...')}`;
}

function tableShell(text) {
  return `<div class="empty-state">${text}</div>`;
}

function input(name, labelText, type = 'text', value = '') {
  return `<label>${labelText}<input name="${name}" type="${type}" value="${value}" required /></label>`;
}

function lookupControl(name, labelText, options, optionLabel, fallbackLabel) {
  if (!options.length) return input(name, fallbackLabel, 'number', '1');

  return `
    <label>${labelText}
      <select name="${name}" required>
        ${options
          .map((item) => `<option value="${item.id ?? item.Id}">${escapeHtml(optionLabel(item))}</option>`)
          .join('')}
      </select>
    </label>
  `;
}

function patientOption(patient) {
  return patient.fullName || patient.FullName || `${patient.firstName || patient.FirstName || 'Patient'} ${patient.lastName || patient.LastName || ''}`.trim();
}

function doctorOption(doctor) {
  const name = `${doctor.firstName || doctor.FirstName || 'Doctor'} ${doctor.lastName || doctor.LastName || ''}`.trim();
  const specialty = doctor.specialty || doctor.Specialty;
  return specialty ? `${name} - ${specialty}` : name;
}

function clinicOption(clinic) {
  return clinic.name || clinic.Name || `Clinic ${clinic.id || clinic.Id}`;
}

function appointmentOption(appointment) {
  const time = formatValue(appointment.dateTime || appointment.DateTime);
  return `Visit on ${time}`;
}

function profileRow(labelText, value) {
  return `<div><span>${labelText}</span><strong>${escapeHtml(value || 'Not provided')}</strong></div>`;
}

function defaultClinicId() {
  const clinic = state.lookups.clinics[0];
  return clinic?.id || clinic?.Id || 0;
}

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function numberFields(data, fields) {
  const copy = { ...data };
  fields.forEach((field) => {
    copy[field] = Number(copy[field]);
  });
  return copy;
}

function unwrapCount(result) {
  if (result.status !== 'fulfilled') return 0;
  return result.value.data?.totalCount || result.value.data?.TotalCount || 0;
}

function currentPath() {
  return (location.hash.replace('#', '') || '/').split('?')[0];
}

function healthLabel() {
  if (state.health === 'online') return 'System ready';
  if (state.health === 'offline') return 'Connection issue';
  return 'Checking system';
}

function sessionTitle() {
  const role = state.user?.data?.role || state.user?.data?.Role;
  return role ? `${role} workspace` : 'Operations workspace';
}

function notify(message) {
  state.toast = message;
  render();
  window.setTimeout(() => {
    state.toast = '';
    render();
  }, 2400);
}

function formatValue(value) {
  if (value == null) return '';
  if (typeof value === 'string' && value.includes('T')) return new Date(value).toLocaleString();
  return escapeHtml(String(value));
}

function columnLabel(value) {
  const key = value.split('.').pop();
  const labels = {
    id: 'Reference',
    Id: 'Reference',
    fullName: 'Patient',
    FullName: 'Patient',
    dateTime: 'Date and time',
    DateTime: 'Date and time',
    patientId: 'Patient ref.',
    PatientId: 'Patient ref.',
    doctorId: 'Doctor ref.',
    DoctorId: 'Doctor ref.',
    clinicId: 'Clinic ref.',
    ClinicId: 'Clinic ref.',
    appointmentId: 'Visit ref.',
    AppointmentId: 'Visit ref.',
    totalAmount: 'Total',
    TotalAmount: 'Total',
  };

  return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

function friendlyError(error) {
  if (error?.errors) {
    const messages = Object.entries(error.errors)
      .flatMap(([field, values]) => values.map((message) => `${columnLabel(field)}: ${message}`))
      .join(' ');

    if (messages) return messages;
  }

  return error?.message || error?.title || 'Something went wrong. Please try again.';
}

function pascal(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function userRole() {
  return state.user?.data?.role || state.user?.data?.Role || 'Staff';
}

function userName() {
  const data = state.user?.data || {};
  const fullName = data.fullName || data.FullName;
  if (fullName) return fullName;

  return [data.firstName || data.FirstName, data.lastName || data.LastName].filter(Boolean).join(' ') || userRole();
}

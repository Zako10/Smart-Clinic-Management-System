import './styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'smartclinic.token';

const state = {
  token: localStorage.getItem(TOKEN_KEY) || '',
  user: null,
  activeResource: 'Patient',
};

const resources = [
  { key: 'Patient', label: 'Patients', requires: 'Admin or Receptionist' },
  { key: 'Appointment', label: 'Appointments', requires: 'Admin or Doctor' },
  { key: 'Clinic', label: 'Clinics', requires: 'Admin' },
  { key: 'Doctor', label: 'Doctors', requires: 'Admin' },
  { key: 'Invoice', label: 'Invoices', requires: 'Admin or Receptionist' },
  { key: 'Payment', label: 'Payments', requires: 'Admin or Receptionist' },
];

const app = document.querySelector('#app');

function render() {
  app.innerHTML = `
    <header class="topbar">
      <div>
        <p class="eyebrow">Smart Clinic</p>
        <h1>Clinic Operations Console</h1>
      </div>
      <div class="session">
        <span id="api-status" class="status">Checking API</span>
        ${state.token ? '<button class="ghost-button" data-action="logout">Log out</button>' : ''}
      </div>
    </header>

    <main class="shell">
      <section class="auth-panel">
        <div class="panel-heading">
          <h2>Access</h2>
          <p>Sign in or create an account against the ASP.NET API.</p>
        </div>
        <div class="auth-grid">
          <form id="login-form" class="form">
            <label>Email<input name="email" type="email" autocomplete="email" required /></label>
            <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
            <button type="submit">Log in</button>
          </form>
          <form id="register-form" class="form">
            <label>First name<input name="firstName" required /></label>
            <label>Last name<input name="lastName" required /></label>
            <label>Email<input name="email" type="email" required /></label>
            <label>Password<input name="password" type="password" required minlength="6" /></label>
            <label>Phone<input name="phone" required /></label>
            <label>Clinic ID<input name="clinicId" type="number" min="1" value="1" required /></label>
            <button type="submit">Register</button>
          </form>
        </div>
      </section>

      <section class="dashboard">
        <aside class="resource-nav">
          ${resources
            .map(
              (resource) => `
                <button class="${resource.key === state.activeResource ? 'active' : ''}" data-resource="${resource.key}">
                  <span>${resource.label}</span>
                  <small>${resource.requires}</small>
                </button>
              `,
            )
            .join('')}
        </aside>
        <section class="data-panel">
          <div class="panel-heading row">
            <div>
              <h2>${activeResource().label}</h2>
              <p>Uses <code>${API_BASE_URL}/${state.activeResource}</code></p>
            </div>
            <button data-action="load-resource">Refresh</button>
          </div>
          <pre id="output" class="output">Choose a resource and refresh after login.</pre>
        </section>
      </section>
    </main>
  `;

  bindEvents();
  checkApiStatus();
  if (state.token) {
    loadCurrentUser();
  }
}

function bindEvents() {
  document.querySelector('#login-form').addEventListener('submit', handleLogin);
  document.querySelector('#register-form').addEventListener('submit', handleRegister);
  document
    .querySelector('[data-action="load-resource"]')
    .addEventListener('click', loadResource);

  document.querySelectorAll('[data-resource]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeResource = button.dataset.resource;
      render();
    });
  });

  document.querySelector('[data-action="logout"]')?.addEventListener('click', () => {
    state.token = '';
    state.user = null;
    localStorage.removeItem(TOKEN_KEY);
    render();
  });
}

async function handleLogin(event) {
  event.preventDefault();
  const data = formData(event.currentTarget);
  const response = await request('/Auth/login', {
    method: 'POST',
    body: data,
  });

  const token = response.data?.token || response.data?.Token;
  if (!token) {
    writeOutput(response);
    return;
  }

  state.token = token;
  localStorage.setItem(TOKEN_KEY, token);
  writeOutput(response);
  await loadCurrentUser();
}

async function handleRegister(event) {
  event.preventDefault();
  const data = formData(event.currentTarget);
  data.clinicId = Number(data.clinicId);

  const response = await request('/Auth/register', {
    method: 'POST',
    body: data,
  });

  const token = response.data?.token || response.data?.Token;
  if (token) {
    state.token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  writeOutput(response);
  if (state.token) {
    await loadCurrentUser();
  }
}

async function loadCurrentUser() {
  try {
    state.user = await request('/Auth/me');
    document.querySelector('#api-status').textContent = `Signed in: ${
      state.user.data?.role || state.user.data?.Role || 'user'
    }`;
  } catch (error) {
    writeOutput(error);
  }
}

async function loadResource() {
  const query = state.activeResource === 'Clinic' ? '' : '?pageNumber=1&pageSize=10';
  try {
    const response = await request(`/${state.activeResource}${query}`);
    writeOutput(response);
  } catch (error) {
    writeOutput(error);
  }
}

async function checkApiStatus() {
  const status = document.querySelector('#api-status');
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/me`, {
      headers: authHeaders(),
    });
    status.textContent = response.status === 401 ? 'API online' : `API ${response.status}`;
    status.classList.add('online');
  } catch {
    status.textContent = 'API offline';
    status.classList.add('offline');
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw payload;
  }

  return payload;
}

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function writeOutput(value) {
  document.querySelector('#output').textContent = JSON.stringify(value, null, 2);
}

function activeResource() {
  return resources.find((resource) => resource.key === state.activeResource);
}

render();

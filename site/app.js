const state = {
  apiBase: localStorage.getItem('apiBase') || 'http://localhost:5000/api',
  token: localStorage.getItem('token') || '',
  user: JSON.parse(localStorage.getItem('user') || 'null'),
};

const els = {
  viewTitle: document.getElementById('view-title'),
  status: document.getElementById('status'),
  apiBase: document.getElementById('api-base'),
  saveApi: document.getElementById('save-api'),
  logout: document.getElementById('logout'),
  registerForm: document.getElementById('register-form'),
  loginForm: document.getElementById('login-form'),
  topupForm: document.getElementById('topup-form'),
  userStats: document.getElementById('user-stats'),
  numberList: document.getElementById('number-list'),
  messageList: document.getElementById('message-list'),
  transactionList: document.getElementById('transaction-list'),
  adminStats: document.getElementById('admin-stats'),
  adminUserList: document.getElementById('admin-user-list'),
};

els.apiBase.value = state.apiBase;

function setStatus(message) {
  els.status.textContent = message;
}

function saveSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
  state.token = '';
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function api(path, options = {}) {
  const response = await fetch(`${state.apiBase}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || 'Request failed');
  }

  return body;
}

function showView(view) {
  document.querySelectorAll('.view').forEach((section) => section.classList.remove('active'));
  document.querySelectorAll('nav button').forEach((button) => button.classList.remove('active'));
  document.getElementById(view).classList.add('active');
  document.querySelector(`nav button[data-view="${view}"]`).classList.add('active');
  els.viewTitle.textContent = view[0].toUpperCase() + view.slice(1);
}

async function loadDashboard() {
  if (!state.token) {
    return;
  }

  const profile = await api('/user/profile');
  els.userStats.innerHTML = [
    ['Name', profile.name],
    ['Email', profile.email],
    ['Wallet', `$${Number(profile.wallet_balance).toFixed(2)}`],
  ]
    .map(([k, v]) => `<div class="card"><h4>${k}</h4><span class="pill">${v}</span></div>`)
    .join('');
}

async function loadNumbers() {
  const numbers = await api('/numbers/available');
  els.numberList.innerHTML = numbers
    .map(
      (n) => `<tr>
      <td>${n.id}</td><td>${n.country_code}</td><td>${n.number_value}</td><td>${n.service_name}</td><td>$${n.price}</td>
      <td><button data-buy="${n.id}">Buy</button></td>
    </tr>`,
    )
    .join('');
}

async function loadMessages() {
  const messages = await api('/numbers/messages');
  els.messageList.innerHTML = messages
    .map(
      (m) => `<tr><td>${m.id}</td><td>${m.number_value}</td><td>${m.sender}</td><td>${m.message_text}</td><td>${new Date(
        m.received_at,
      ).toLocaleString()}</td></tr>`,
    )
    .join('');
}

async function loadTransactions() {
  const tx = await api('/user/transactions');
  els.transactionList.innerHTML = tx
    .map(
      (t) => `<tr><td>${t.id}</td><td>${t.amount}</td><td>${t.type}</td><td>${t.description}</td><td>${new Date(
        t.created_at,
      ).toLocaleString()}</td></tr>`,
    )
    .join('');
}

async function loadAdmin() {
  if (!state.user || state.user.role !== 'admin') {
    els.adminStats.innerHTML = '<p>Only admins can access this section.</p>';
    els.adminUserList.innerHTML = '';
    return;
  }

  const [stats, users] = await Promise.all([api('/admin/stats'), api('/admin/users')]);

  els.adminStats.innerHTML = Object.entries(stats)
    .map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`)
    .join('');

  els.adminUserList.innerHTML = users
    .map(
      (u) => `<tr><td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.wallet_balance}</td></tr>`,
    )
    .join('');
}

document.querySelectorAll('nav button[data-view]').forEach((button) => {
  button.addEventListener('click', async () => {
    showView(button.dataset.view);
    try {
      if (button.dataset.view === 'dashboard') await loadDashboard();
      if (button.dataset.view === 'numbers') await loadNumbers();
      if (button.dataset.view === 'messages') await loadMessages();
      if (button.dataset.view === 'transactions') await loadTransactions();
      if (button.dataset.view === 'admin') await loadAdmin();
    } catch (error) {
      setStatus(error.message);
    }
  });
});

els.saveApi.addEventListener('click', () => {
  state.apiBase = els.apiBase.value.trim();
  localStorage.setItem('apiBase', state.apiBase);
  setStatus(`API base set to ${state.apiBase}`);
});

els.logout.addEventListener('click', () => {
  clearSession();
  setStatus('Logged out.');
  showView('auth');
});

els.registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const formData = Object.fromEntries(new FormData(els.registerForm).entries());
    const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(formData) });
    saveSession(data.token, data.user);
    setStatus('Registration successful.');
    showView('dashboard');
    await loadDashboard();
  } catch (error) {
    setStatus(error.message);
  }
});

els.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const formData = Object.fromEntries(new FormData(els.loginForm).entries());
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(formData) });
    saveSession(data.token, data.user);
    setStatus('Login successful.');
    showView('dashboard');
    await loadDashboard();
  } catch (error) {
    setStatus(error.message);
  }
});

els.topupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const { amount } = Object.fromEntries(new FormData(els.topupForm).entries());
    await api('/user/wallet/topup', { method: 'POST', body: JSON.stringify({ amount }) });
    setStatus('Wallet top-up completed.');
    await loadDashboard();
    await loadTransactions();
  } catch (error) {
    setStatus(error.message);
  }
});

document.body.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-buy]');
  if (!button) {
    return;
  }

  try {
    await api('/numbers/buy', { method: 'POST', body: JSON.stringify({ numberId: Number(button.dataset.buy) }) });
    setStatus('Number purchased successfully.');
    await loadNumbers();
    await loadDashboard();
    await loadTransactions();
  } catch (error) {
    setStatus(error.message);
  }
});

if (state.token) {
  showView('dashboard');
  loadDashboard().catch((error) => setStatus(error.message));
}

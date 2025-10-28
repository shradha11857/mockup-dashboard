/* script.js
  - Loads data.json via fetch
  - Populates Company select
  - When company changes -> populate Account select
  - When account changes -> update balance + transactions table
  - All UI strings come from data.json (no hardcoding)
*/

let appData = null;

async function loadData() {
  try {
    const res = await fetch('data.json');
    appData = await res.json();
    initUI(appData);
  } catch (err) {
    console.error('Failed to load data.json', err);
    document.getElementById('company').innerHTML = '<option value="">Failed to load</option>';
  }
}

function initUI(data) {
  const companySelect = document.getElementById('company');
  const accountSelect = document.getElementById('account');

  companySelect.innerHTML = '<option value="">-- Select Company --</option>';
  data.companies.forEach(comp => {
    const o = document.createElement('option');
    o.value = comp.id;
    o.textContent = comp.name;
    companySelect.appendChild(o);
  });

  // If you want the UI to preselect first company:
  // companySelect.selectedIndex = 1;

  companySelect.addEventListener('change', (e) => {
    const compId = e.target.value;
    populateAccounts(compId);
    clearAccountDetails();
  });

  accountSelect.addEventListener('change', (e) => {
    const compId = companySelect.value;
    const accId = e.target.value;
    if (!compId || !accId) { clearAccountDetails(); return; }
    showAccountDetails(compId, accId);
  });
}

function populateAccounts(companyId) {
  const accountSelect = document.getElementById('account');
  accountSelect.innerHTML = '<option value="">-- Select Account --</option>';
  if (!companyId) return;
  const company = appData.companies.find(c => String(c.id) === String(companyId));
  if (!company) return;
  company.accounts.forEach(acc => {
    const o = document.createElement('option');
    o.value = acc.id;
    o.textContent = acc.name;
    accountSelect.appendChild(o);
  });
}

function clearAccountDetails() {
  document.getElementById('account-name').textContent = 'Select an account';
  document.getElementById('account-info').textContent = '';
  document.getElementById('balance').textContent = '—';
  document.getElementById('balance-sub').textContent = 'Last updated: —';
  document.querySelector('#tx-table tbody').innerHTML = '';
  document.getElementById('no-data').hidden = true;
}

function showAccountDetails(companyId, accountId) {
  const company = appData.companies.find(c => String(c.id) === String(companyId));
  if (!company) return;
  const account = company.accounts.find(a => String(a.id) === String(accountId));
  if (!account) return;

  // Update headings
  document.getElementById('account-name').textContent = account.name;
  document.getElementById('account-info').textContent = account.details || '';

  // Update balance
  document.getElementById('balance').textContent = account.balance || '—';
  document.getElementById('balance-sub').textContent = 'Last updated: ' + (account.lastUpdated || '—');

  // Fill transactions table
  const tbody = document.querySelector('#tx-table tbody');
  tbody.innerHTML = '';

  if (!Array.isArray(account.transactions) || account.transactions.length === 0) {
    document.getElementById('no-data').hidden = false;
    return;
  }
  document.getElementById('no-data').hidden = true;

  account.transactions.forEach(tx => {
    const tr = document.createElement('tr');

    const tdDate = document.createElement('td'); tdDate.textContent = tx.date; tr.appendChild(tdDate);
    const tdCredit = document.createElement('td'); tdCredit.textContent = tx.credit; tr.appendChild(tdCredit);
    const tdBalance = document.createElement('td'); tdBalance.textContent = tx.balance; tr.appendChild(tdBalance);
    const tdUtr = document.createElement('td'); tdUtr.textContent = tx.utr; tr.appendChild(tdUtr);
    const tdAcc = document.createElement('td'); tdAcc.textContent = tx.accountNo; tr.appendChild(tdAcc);

    tbody.appendChild(tr);
  });
}

// Initialize
loadData();

document.addEventListener('DOMContentLoaded', () => {
  const balanceEl = document.getElementById('balanceValue');
  const tbody = document.querySelector('#loadsTable tbody');
  const companySelect = document.getElementById('companySelect');
  const accountSelect = document.getElementById('accountSelect');

  let allData = {};

  function formatINR(value) {
    if (typeof value === 'number') value = value.toFixed(2);
    const parts = value.toString().split('.');
    let int = parts[0];
    const dec = parts[1] ? '.' + parts[1] : '';
    let last3 = int.slice(-3);
    let rest = int.slice(0, -3);
    if (rest !== '') {
      last3 = ',' + last3;
      rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    }
    return '₹ ' + (rest + last3 + dec);
  }

  function populateTable(loads) {
    tbody.innerHTML = '';
    if (!loads || !loads.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 5;
      td.textContent = 'No loads to display';
      td.style.padding = '20px';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }
    loads.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.date}</td>
        <td style="color:#1a8a3f; font-weight:600;">${formatINR(row.credit)}</td>
        <td>${formatINR(row.balance)}</td>
        <td>${row.utr}</td>
        <td>${row.account}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function loadAccountData(companyName, accountName) {
    const company = allData.companies.find(c => c.name === companyName);
    if (!company) return;
    const account = company.accounts.find(a => a.name === accountName);
    if (!account) return;
    balanceEl.textContent = formatINR(account.balance);
    populateTable(account.loads);
  }

  fetch('data.json')
    .then(r => r.json())
    .then(data => {
      allData = data;
      companySelect.innerHTML = '<option>Select Company</option>';
      data.companies.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.textContent = c.name;
        companySelect.appendChild(opt);
      });
    })
    .catch(err => {
      console.error('Failed to load data.json', err);
    });

  companySelect.addEventListener('change', () => {
    const companyName = companySelect.value;
    const company = allData.companies.find(c => c.name === companyName);
    accountSelect.innerHTML = '<option>Select Account</option>';
    if (company) {
      company.accounts.forEach(acc => {
        const opt = document.createElement('option');
        opt.value = acc.name;
        opt.textContent = acc.name;
        accountSelect.appendChild(opt);
      });
    }
    balanceEl.textContent = '₹ 0';
    tbody.innerHTML = '';
  });

  accountSelect.addEventListener('change', () => {
    const companyName = companySelect.value;
    const accountName = accountSelect.value;
    if (companyName && accountName && companyName !== 'Select Company' && accountName !== 'Select Account') {
      loadAccountData(companyName, accountName);
    }
  });

  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});



const navLinks = document.querySelectorAll('.nav-link');
const panel = document.getElementById('panelContent');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    const section = link.dataset.section;

    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    loadPartial(section);

    if (section === 'patients') loadPatients();
    if (section === 'doctors') loadDoctors();
    if (section === 'departments') loadDepartments();
    if (section === 'appointments') loadAppointments();
  });
});

function loadPartial(name) {
  fetch(`partial/${name}.html`)
    .then(res => res.text())
    .then(html => {
      panel.innerHTML = html;
    });
}

/* ====== API FUNCTIONS (GIỮ NGUYÊN) ====== */

function loadPatients() {
  fetch('http://localhost:8080/api/patients')
    .then(res => res.json())
    .then(data => {
      const tb = document.getElementById('patientsTable');
      tb.innerHTML = '';
      data.forEach(p => {
        tb.innerHTML += `
          <tr>
            <td>${p.full_name}</td>
            <td>${p.identity_number}</td>
            <td>${p.gender ?? ''}</td>
            <td>${p.date_of_birth ?? ''}</td>
            <td>${p.phone}</td>
            <td>${p.email ?? ''}</td>
            <td>${p.insurance_number ?? ''}</td>
            <td>${p.address ?? ''}</td>
            <td>${p.emergency_contact_phone ?? ''}</td>
            <td>${p.last_update ?? ''}</td>
            <td class="table-actions">
              <button>Sửa</button>
              <button>Xóa</button>
            </td>
          </tr>
        `;
      });
    });
}


function loadDoctors() {
  fetch('http://localhost:8080/api/doctors')
    .then(res => res.json())
    .then(data => {
      const tb = document.getElementById('doctorsTable');
      tb.innerHTML = '';
      data.forEach(d => {
        tb.innerHTML += `
          <tr>
            <td>${d.full_name}</td>
            <td>${d.gender ?? ''}</td>
            <td>${d.specialization}</td>
            <td>${d.department_id}</td>
            <td>${d.phone ?? ''}</td>
            <td>${d.email ?? ''}</td>
            <td>${d.experience_year ?? ''}</td>
            <td>${d.last_update ?? ''}</td>
            <td class="table-actions">
              <button>Sửa</button>
              <button>Xóa</button>
            </td>
          </tr>
        `;
      });
    });
}


function loadDepartments() {
  fetch('http://localhost:8080/api/departments')
    .then(res => res.json())
    .then(data => {
      const tb = document.getElementById('departmentsTable');
      tb.innerHTML = '';
      data.forEach(dep => {
        tb.innerHTML += `
          <tr>
            <td>${dep.id}</td>
            <td>${dep.name}</td>
            <td>${dep.head_doctor}</td>
            <td>${dep.phone}</td>
            <td>${dep.description ?? ''}</td>
            <td>${dep.last_update ?? ''}</td>
            <td class="table-actions">
              <button>Sửa</button>
              <button>Xóa</button>
            </td>
          </tr>
        `;
      });
    });
}


function loadAppointments() {
  fetch('http://localhost:8080/api/appointments')
    .then(res => res.json())
    .then(data => {
      const tb = document.getElementById('appointmentsTable');
      tb.innerHTML = '';
      data.forEach(a => {
        tb.innerHTML += `
          <tr>
            <td>LH${a.id}</td>
            <td>${a.shift}</td>
            <td>${a.doctor}</td>
            <td>${a.patient}</td>
            <td>${a.department}</td>
            <td>${a.time}</td>
            <td>
              <span class="tag ${a.status === 'Đã hủy' ? 'tag-red' : ''}">
                ${a.status}
              </span>
            </td>
            <td class="table-actions">
              <button>Sửa</button>
              <button>Xóa</button>
            </td>
          </tr>
        `;
      });
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const defaultSection = 'patients';

  // active menu
  navLinks.forEach(l => l.classList.remove('active'));
  const defaultLink = document.querySelector(`.nav-link[data-section="${defaultSection}"]`);
  if (defaultLink) defaultLink.classList.add('active');

  // load giao diện + data
  loadPartial(defaultSection);
  loadPatients();
});

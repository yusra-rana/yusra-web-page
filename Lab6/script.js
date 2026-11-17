/* =========================================================
   Student Performance Management System — Core Logic
   ========================================================= */

const STORAGE_KEY = 'spms_student_records_v1';
let students = [];
let sortOrder = 'default'; // 'default' | 'desc' | 'asc'

// DOM Elements
const studentForm = document.getElementById('studentForm');
const resultsBody = document.getElementById('resultsBody');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const sortBtn = document.getElementById('sortBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const loadSampleBtn = document.getElementById('loadSampleBtn');

/* ---------------------------------------------------------
   1. Required Calculation & Validation Functions
   --------------------------------------------------------- */

function validateForm(name, regNo, marks) {
  if (!name || !regNo) {
    alert('⚠️ Missing Information: Please enter both Student Name and Registration Number.');
    return false;
  }

  const subjectList = [
    { key: 'programming', label: 'Programming' },
    { key: 'mathematics', label: 'Mathematics' },
    { key: 'english', label: 'English' },
    { key: 'database', label: 'Database' },
    { key: 'networks', label: 'Computer Networks' }
  ];

  for (const sub of subjectList) {
    const val = marks[sub.key];
    if (val === '' || val === null || Number.isNaN(val)) {
      alert(`⚠️ Missing Marks: Please enter valid numeric marks for ${sub.label}.`);
      document.getElementById(sub.key).focus();
      return false;
    }
    if (val > 100 || val < 0) {
      alert(
        `🚫 Against the Rules! Marks entered for ${sub.label} (${val}) are invalid.\n\nPlease enter marks between 0 and 100 only.`
      );
      document.getElementById(sub.key).focus();
      return false;
    }
  }

  const isDuplicate = students.some(
    (student) => student.regNo.toLowerCase() === regNo.toLowerCase()
  );
  if (isDuplicate) {
    alert(`⚠️ Duplicate Entry: Registration Number "${regNo}" is already registered!`);
    document.getElementById('regNumber').focus();
    return false;
  }

  return true;
}

function calculateTotal(marks) {
  return (
    marks.programming +
    marks.mathematics +
    marks.english +
    marks.database +
    marks.networks
  );
}

function calculatePercentage(total) {
  return Number(((total / 500) * 100).toFixed(1));
}

function calculateGrade(percentage) {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

function checkStatus(marks) {
  const subjects = [
    { label: 'Programming', score: marks.programming },
    { label: 'Mathematics', score: marks.mathematics },
    { label: 'English', score: marks.english },
    { label: 'Database', score: marks.database },
    { label: 'Computer Networks', score: marks.networks }
  ];

  const failedSubjects = subjects.filter((sub) => sub.score < 40);

  return {
    status: failedSubjects.length === 0 ? 'Pass' : 'Fail',
    failedSubjects
  };
}

function calculateClassAverage() {
  if (students.length === 0) return 0;
  const totalPercentage = students.reduce((sum, s) => sum + s.percentage, 0);
  return Number((totalPercentage / students.length).toFixed(1));
}

function addStudent(event) {
  if (event) event.preventDefault();

  const rawName = document.getElementById('studentName').value.trim();
  const name = rawName.replace(/\b\w/g, (char) => char.toUpperCase());
  const regNo = document.getElementById('regNumber').value.trim().toUpperCase();

  const rawMarks = {
    programming: document.getElementById('programming').value,
    mathematics: document.getElementById('mathematics').value,
    english: document.getElementById('english').value,
    database: document.getElementById('database').value,
    networks: document.getElementById('networks').value
  };

  const marks = {
    programming: rawMarks.programming === '' ? NaN : Number(rawMarks.programming),
    mathematics: rawMarks.mathematics === '' ? NaN : Number(rawMarks.mathematics),
    english: rawMarks.english === '' ? NaN : Number(rawMarks.english),
    database: rawMarks.database === '' ? NaN : Number(rawMarks.database),
    networks: rawMarks.networks === '' ? NaN : Number(rawMarks.networks)
  };

  if (!validateForm(name, regNo, marks)) return;

  const total = calculateTotal(marks);
  const percentage = calculatePercentage(total);
  const grade = calculateGrade(percentage);
  const outcome = checkStatus(marks);

  const newStudent = {
    id: Date.now().toString(),
    name,
    regNo,
    marks,
    total,
    percentage,
    grade,
    status: outcome.status,
    failedSubjects: outcome.failedSubjects
  };

  students.push(newStudent);
  saveToLocalStorage();
  renderDashboard();
  studentForm.reset();
  document.getElementById('studentName').focus();
}

/* ---------------------------------------------------------
   2. Record Management, Storage & Interactive Controls
   --------------------------------------------------------- */

function deleteStudent(id) {
  students = students.filter((student) => student.id !== id);
  saveToLocalStorage();
  renderDashboard();
}

function clearAllRecords() {
  if (students.length === 0) return;
  const confirmed = confirm('Are you sure you want to delete all student records?');
  if (!confirmed) return;

  students = [];
  saveToLocalStorage();
  renderDashboard();
}

function loadSampleData() {
  const sampleRecords = [
    {
      name: 'Ali Raza',
      regNo: 'REG-101',
      marks: { programming: 92, mathematics: 88, english: 90, database: 89, networks: 91 }
    },
    {
      name: 'Sara Khan',
      regNo: 'REG-102',
      marks: { programming: 84, mathematics: 80, english: 85, database: 79, networks: 82 }
    },
    {
      name: 'Zain Tariq',
      regNo: 'REG-103',
      marks: { programming: 86, mathematics: 88, english: 84, database: 34, networks: 88 }
    },
    {
      name: 'Ahmed Bilal',
      regNo: 'REG-104',
      marks: { programming: 58, mathematics: 61, english: 55, database: 60, networks: 56 }
    }
  ];

  let addedCount = 0;
  sampleRecords.forEach((item, idx) => {
    const exists = students.some(
      (s) => s.regNo.toLowerCase() === item.regNo.toLowerCase()
    );
    if (!exists) {
      const total = calculateTotal(item.marks);
      const percentage = calculatePercentage(total);
      const grade = calculateGrade(percentage);
      const outcome = checkStatus(item.marks);

      students.push({
        id: `${Date.now()}_${idx}`,
        name: item.name,
        regNo: item.regNo,
        marks: item.marks,
        total,
        percentage,
        grade,
        status: outcome.status,
        failedSubjects: outcome.failedSubjects
      });
      addedCount++;
    }
  });

  if (addedCount === 0) {
    alert('Sample student records are already loaded in the table.');
    return;
  }

  saveToLocalStorage();
  renderDashboard();
}

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      students = JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to read localStorage:', error);
    students = [];
  }
}

/* ---------------------------------------------------------
   3. UI Rendering: KPIs, Visual Analytics & Results Table
   --------------------------------------------------------- */

function renderDashboard() {
  updateKPIs();
  updateVisualAnalytics();
  renderTable();
}

function updateKPIs() {
  const totalCount = students.length;
  const passCount = students.filter((s) => s.status === 'Pass').length;
  const failCount = totalCount - passCount;
  const classAvg = calculateClassAverage();

  document.getElementById('totalStudents').textContent = totalCount;
  document.getElementById('passFailSplit').textContent = `${passCount} Pass • ${failCount} Fail`;
  document.getElementById('classAverage').textContent = `${classAvg.toFixed(1)}%`;
  document.getElementById('classAvgBar').style.width = `${Math.min(classAvg, 100)}%`;

  const topStudentEl = document.getElementById('topStudent');
  const topDetailEl = document.getElementById('topStudentDetail');

  if (totalCount === 0) {
    topStudentEl.textContent = '—';
    topDetailEl.textContent = 'Add student records to view';
  } else {
    const top = students.reduce((best, curr) =>
      curr.percentage > best.percentage ? curr : best
    );
    topStudentEl.textContent = `${top.name} (${top.percentage}%)`;
    topDetailEl.textContent = `${top.regNo} • ${top.total}/500 • Grade ${top.grade}`;
  }
}

function updateVisualAnalytics() {
  const distBar = document.getElementById('gradeDistributionBar');
  const gradeSummaryText = document.getElementById('gradeSummaryText');
  const total = students.length;

  if (total === 0) {
    distBar.innerHTML = '<div class="stacked-empty">Add students to visualize grades</div>';
    gradeSummaryText.textContent = 'No records yet';
  } else {
    const counts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    students.forEach((s) => {
      counts[s.grade] = (counts[s.grade] || 0) + 1;
    });

    gradeSummaryText.textContent = `A:${counts.A} • B:${counts.B} • C:${counts.C} • D:${counts.D} • F:${counts.F}`;

    distBar.innerHTML = ['A', 'B', 'C', 'D', 'F']
      .filter((g) => counts[g] > 0)
      .map((g) => {
        const widthPct = ((counts[g] / total) * 100).toFixed(1);
        return `<div class="stack-seg seg-${g.toLowerCase()}" style="width: ${widthPct}%" title="Grade ${g}: ${counts[g]} student(s)"></div>`;
      })
      .join('');
  }

  const subjects = [
    { key: 'programming', textId: 'avgProgText', barId: 'avgProgBar' },
    { key: 'mathematics', textId: 'avgMathText', barId: 'avgMathBar' },
    { key: 'english', textId: 'avgEngText', barId: 'avgEngBar' },
    { key: 'database', textId: 'avgDbText', barId: 'avgDbBar' },
    { key: 'networks', textId: 'avgNetText', barId: 'avgNetBar' }
  ];

  subjects.forEach(({ key, textId, barId }) => {
    const avg =
      total === 0
        ? 0
        : Math.round(students.reduce((sum, s) => sum + s.marks[key], 0) / total);

    document.getElementById(textId).textContent = avg;
    document.getElementById(barId).style.height = `${avg}%`;
  });
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();

  let filtered = students.filter(
    (s) =>
      s.regNo.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query)
  );

  if (sortOrder === 'desc') {
    filtered = [...filtered].sort((a, b) => b.percentage - a.percentage);
  } else if (sortOrder === 'asc') {
    filtered = [...filtered].sort((a, b) => a.percentage - b.percentage);
  }

  document.getElementById('recordCountLabel').textContent =
    `Showing ${filtered.length} of ${students.length} student record${students.length === 1 ? '' : 's'}`;

  if (filtered.length === 0) {
    resultsBody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  const gradeBarColors = {
    A: 'var(--grade-a-bar)',
    B: 'var(--grade-b-bar)',
    C: 'var(--grade-c-bar)',
    D: 'var(--grade-d-bar)',
    F: 'var(--grade-f-bar)'
  };

  resultsBody.innerHTML = filtered
    .map((student) => {
      const m = student.marks;
      const formatMark = (score) =>
        score < 40 ? `<span class="mark-fail-num">${score}</span>` : `${score}`;

      const marksSummary = `${formatMark(m.programming)} / ${formatMark(m.mathematics)} / ${formatMark(m.english)} / ${formatMark(m.database)} / ${formatMark(m.networks)}`;

      const failNote =
        student.status === 'Fail' && student.failedSubjects.length > 0
          ? `<span class="fail-reason">Failed in: ${student.failedSubjects
              .map((f) => `${f.label} (${f.score})`)
              .join(', ')}</span>`
          : '';

      const rowClass = student.status === 'Fail' ? 'row-fail' : '';

      return `
        <tr class="${rowClass}">
          <td><strong>${escapeHTML(student.regNo)}</strong></td>
          <td>${escapeHTML(student.name)}</td>
          <td class="marks-breakdown">${marksSummary}</td>
          <td><strong>${student.total}</strong> / 500</td>
          <td class="pct-cell">
            <strong>${student.percentage}%</strong>
            <div class="pct-mini-track">
              <div class="pct-mini-fill" style="width: ${student.percentage}%; background-color: ${gradeBarColors[student.grade]};"></div>
            </div>
          </td>
          <td><span class="badge grade-${student.grade}">${student.grade}</span></td>
          <td>
            <div class="status-wrap">
              <span class="badge ${student.status === 'Pass' ? 'status-pass' : 'status-fail'}">${student.status}</span>
              ${failNote}
            </div>
          </td>
          <td>
            <button type="button" class="btn btn-delete" onclick="deleteStudent('${student.id}')">
              Delete
            </button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------------------------------------------------
   4. Event Listeners & Initialization
   --------------------------------------------------------- */

studentForm.addEventListener('submit', addStudent);
searchInput.addEventListener('input', renderTable);
clearAllBtn.addEventListener('click', clearAllRecords);
loadSampleBtn.addEventListener('click', loadSampleData);

sortBtn.addEventListener('click', () => {
  if (sortOrder === 'default') {
    sortOrder = 'desc';
    sortBtn.textContent = 'Sort %: High → Low';
  } else if (sortOrder === 'desc') {
    sortOrder = 'asc';
    sortBtn.textContent = 'Sort %: Low → High';
  } else {
    sortOrder = 'default';
    sortBtn.textContent = 'Sort %: Default';
  }
  renderTable();
});

// Initialize dashboard on page load
loadFromLocalStorage();
renderDashboard();
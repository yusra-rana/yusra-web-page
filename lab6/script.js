/* =========================================================
   Student Performance Management System
   All Required Rubric Functions + Live Preview, Filters & Themes
   ========================================================= */

const STORAGE_KEY = "spms_editorial_records_v1";
const THEME_STORAGE_KEY = "spms_color_theme_v1";

let students = [];
let sortMode = "default"; // "default" | "desc" | "asc"
let activeFilter = "all"; // "all" | "Pass" | "Fail"

// DOM Elements
const studentForm = document.getElementById("studentForm");
const resultsBody = document.getElementById("resultsBody");
const emptyMessage = document.getElementById("emptyMessage");
const searchInput = document.getElementById("searchInput");
const sortBtn = document.getElementById("sortBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const filterChips = document.querySelectorAll(".chip");

const markInputs = [
  document.getElementById("programming"),
  document.getElementById("mathematics"),
  document.getElementById("english"),
  document.getElementById("database"),
  document.getElementById("networks")
];

/* ---------------------------------------------------------
   1. Required Rubric Functions (Task 3)
   --------------------------------------------------------- */

function validateForm(name, regNo, marks) {
  if (!name || !regNo) {
    alert("⚠️ Missing Information: Please enter both Student Name and Registration Number.");
    return false;
  }

  const subjects = [
    { key: "programming", label: "Programming" },
    { key: "mathematics", label: "Mathematics" },
    { key: "english", label: "English" },
    { key: "database", label: "Database" },
    { key: "networks", label: "Computer Networks" }
  ];

  for (let i = 0; i < subjects.length; i++) {
    const sub = subjects[i];
    const val = marks[sub.key];

    if (val === "" || Number.isNaN(val)) {
      alert(`⚠️ Missing Marks: Please enter valid numeric marks for ${sub.label}.`);
      document.getElementById(sub.key).focus();
      return false;
    }

    if (val < 0 || val > 100) {
      alert(
        `🚫 Against the Rules! Marks entered for ${sub.label} (${val}) are invalid.\n\nPlease enter marks between 0 and 100 only.`
      );
      document.getElementById(sub.key).focus();
      return false;
    }
  }

  const isDuplicate = students.some(
    (s) => s.regNo.toLowerCase() === regNo.toLowerCase()
  );
  if (isDuplicate) {
    alert(`⚠️ Duplicate Registration Number: "${regNo}" is already registered!`);
    document.getElementById("regNumber").focus();
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
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  return "F";
}

function checkStatus(marks) {
  const failedSubjects = [];
  if (marks.programming < 40) failedSubjects.push("Programming");
  if (marks.mathematics < 40) failedSubjects.push("Mathematics");
  if (marks.english < 40) failedSubjects.push("English");
  if (marks.database < 40) failedSubjects.push("Database");
  if (marks.networks < 40) failedSubjects.push("Computer Networks");

  return {
    status: failedSubjects.length === 0 ? "Pass" : "Fail",
    failedSubjects
  };
}

function calculateClassAverage() {
  if (students.length === 0) return 0;
  const totalPct = students.reduce((sum, s) => sum + s.percentage, 0);
  return Number((totalPct / students.length).toFixed(1));
}

function addStudent(event) {
  if (event) event.preventDefault();

  const rawName = document.getElementById("studentName").value.trim();
  const name = rawName.replace(/\b\w/g, (ch) => ch.toUpperCase());
  const regNo = document.getElementById("regNumber").value.trim().toUpperCase();

  const marks = getEnteredMarks();

  if (!validateForm(name, regNo, marks)) return;

  const total = calculateTotal(marks);
  const percentage = calculatePercentage(total);
  const grade = calculateGrade(percentage);
  const statusInfo = checkStatus(marks);

  const student = {
    id: Date.now(),
    name,
    regNo,
    marks,
    total,
    percentage,
    grade,
    status: statusInfo.status,
    failedSubjects: statusInfo.failedSubjects
  };

  students.push(student);
  saveToLocalStorage();
  renderAll();
  studentForm.reset();
  resetLivePreview();
  showToast(`✓ Added ${name} (${percentage}% • Grade ${grade})`);
  document.getElementById("studentName").focus();
}

/* ---------------------------------------------------------
   2. Real-Time Live Form Preview (While Typing)
   --------------------------------------------------------- */

function getEnteredMarks() {
  const readVal = (id) => {
    const raw = document.getElementById(id).value;
    return raw === "" ? NaN : Number(raw);
  };

  return {
    programming: readVal("programming"),
    mathematics: readVal("mathematics"),
    english: readVal("english"),
    database: readVal("database"),
    networks: readVal("networks")
  };
}

function updateLivePreview() {
  const marks = getEnteredMarks();
  const values = Object.values(marks);

  const previewPctEl = document.getElementById("previewPct");
  const previewGradeEl = document.getElementById("previewGrade");
  const previewStatusEl = document.getElementById("previewStatus");

  if (values.some((v) => !Number.isNaN(v) && (v < 0 || v > 100))) {
    previewPctEl.textContent = "Invalid";
    previewGradeEl.textContent = "!";
    previewGradeEl.className = "grade-badge grade-F";
    previewStatusEl.textContent = "Marks must be 0–100";
    return;
  }

  if (values.some((v) => Number.isNaN(v))) {
    const filledCount = values.filter((v) => !Number.isNaN(v)).length;
    previewPctEl.textContent = "0%";
    previewGradeEl.textContent = "—";
    previewGradeEl.className = "grade-badge grade-neutral";
    previewStatusEl.textContent =
      filledCount === 0 ? "Enter marks to preview" : `${filledCount} of 5 subjects entered`;
    return;
  }

  const total = calculateTotal(marks);
  const pct = calculatePercentage(total);
  const grade = calculateGrade(pct);
  const statusInfo = checkStatus(marks);

  previewPctEl.textContent = `${pct}%`;
  previewGradeEl.textContent = grade;
  previewGradeEl.className = `grade-badge grade-${grade}`;
  previewStatusEl.textContent =
    statusInfo.status === "Pass"
      ? `Pass (${total}/500)`
      : `Fail (${statusInfo.failedSubjects.join(", ")} < 40)`;
}

function resetLivePreview() {
  document.getElementById("previewPct").textContent = "0%";
  const gradeEl = document.getElementById("previewGrade");
  gradeEl.textContent = "—";
  gradeEl.className = "grade-badge grade-neutral";
  document.getElementById("previewStatus").textContent = "Enter marks to preview";
}

/* ---------------------------------------------------------
   3. Dashboard Rendering, Ring Animation, Filters & Storage
   --------------------------------------------------------- */

function renderAll() {
  updateSummaryAndRing();
  renderTable();
}

function updateSummaryAndRing() {
  const total = students.length;
  const passCount = students.filter((s) => s.status === "Pass").length;
  const failCount = total - passCount;
  const avg = calculateClassAverage();

  document.getElementById("totalStudents").textContent = total;
  document.getElementById("classAverage").textContent = `${avg.toFixed(1)}%`;
  document.getElementById("passFail").textContent = `${passCount} / ${failCount}`;

  // Update SVG Circular Progress Ring (circumference = 2 * PI * 50 = 314.16)
  const circumference = 314.16;
  const offset = circumference - (Math.min(avg, 100) / 100) * circumference;
  document.getElementById("ringFill").style.strokeDashoffset = offset.toFixed(2);
  document.getElementById("ringText").textContent = `${avg.toFixed(0)}%`;

  const standingEl = document.getElementById("ringStanding");
  if (total === 0) {
    standingEl.textContent = "No records";
  } else if (avg >= 80) {
    standingEl.textContent = "Excellent standing";
  } else if (avg >= 60) {
    standingEl.textContent = "Satisfactory";
  } else {
    standingEl.textContent = "Needs support";
  }

  // Highest-Scoring Student
  const highestEl = document.getElementById("highestStudent");
  const highestDetailEl = document.getElementById("highestDetail");

  if (total === 0) {
    highestEl.textContent = "—";
    highestDetailEl.textContent = "Top class performer";
  } else {
    const top = students.reduce((best, curr) =>
      curr.percentage > best.percentage ? curr : best
    );
    highestEl.textContent = `${top.name} (${top.percentage}%)`;
    highestDetailEl.textContent = `${top.regNo} • ${top.total}/500 • Grade ${top.grade}`;
  }
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();

  let filtered = students.filter((s) => {
    const matchesSearch =
      s.regNo.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query);
    const matchesStatus =
      activeFilter === "all" ? true : s.status === activeFilter;
    return matchesSearch && matchesStatus;
  });

  if (sortMode === "desc") {
    filtered = [...filtered].sort((a, b) => b.percentage - a.percentage);
  } else if (sortMode === "asc") {
    filtered = [...filtered].sort((a, b) => a.percentage - b.percentage);
  }

  document.getElementById("recordCountText").textContent =
    `Showing ${filtered.length} of ${students.length} record${students.length === 1 ? "" : "s"}`;

  resultsBody.innerHTML = "";

  if (filtered.length === 0) {
    emptyMessage.classList.remove("hidden");
    return;
  }

  emptyMessage.classList.add("hidden");

  filtered.forEach((student, index) => {
    const tr = document.createElement("tr");
    tr.classList.add(student.status === "Pass" ? "row-pass" : "row-fail");

    const m = student.marks;
    const fmt = (score) =>
      score < 40 ? `<span class="mark-low">${score}</span>` : `${score}`;

    const marksSummary = `${fmt(m.programming)} / ${fmt(m.mathematics)} / ${fmt(m.english)} / ${fmt(m.database)} / ${fmt(m.networks)}`;

    const failNote =
      student.failedSubjects.length > 0
        ? `<span class="fail-sub-note">Failed in: ${student.failedSubjects.join(", ")}</span>`
        : "";

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${escapeHTML(student.regNo)}</strong></td>
      <td>${escapeHTML(student.name)}</td>
      <td>${marksSummary}</td>
      <td>${student.total} / 500</td>
      <td><strong>${student.percentage}%</strong></td>
      <td><span class="grade-badge grade-${student.grade}">${student.grade}</span></td>
      <td>
        <span class="${student.status === "Pass" ? "status-pass" : "status-fail"}">
          ${student.status}
        </span>
        ${failNote}
      </td>
      <td>
        <button type="button" class="btn-delete" onclick="deleteStudent(${student.id})">Delete</button>
      </td>
    `;

    resultsBody.appendChild(tr);
  });
}

function deleteStudent(id) {
  students = students.filter((s) => s.id !== id);
  saveToLocalStorage();
  renderAll();
  showToast("Record deleted");
}

function clearAllRecords() {
  if (students.length === 0) return;
  if (confirm("Are you sure you want to clear all student records?")) {
    students = [];
    saveToLocalStorage();
    renderAll();
    showToast("All student records cleared");
  }
}

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) students = JSON.parse(raw);
  } catch (e) {
    students = [];
  }
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/* ---------------------------------------------------------
   4. Twinkling Starfield & Theme Switcher (Multi vs Solid)
   --------------------------------------------------------- */

function createStarfield() {
  const container = document.getElementById("starfield");
  if (!container) return;

  const starSymbols = ["✦", "★", "✧", "⋆"];
  const starCount = 36;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("span");
    star.className = "star";
    star.textContent = starSymbols[i % starSymbols.length];

    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const size = 10 + Math.floor(Math.random() * 12);
    const duration = (5 + Math.random() * 6).toFixed(1);
    const delay = (Math.random() * 4).toFixed(1);

    star.style.left = `${left}%`;
    star.style.top = `${top}%`;
    star.style.fontSize = `${size}px`;
    star.style.setProperty("--dur", `${duration}s`);
    star.style.setProperty("--delay", `${delay}s`);

    container.appendChild(star);
  }
}

function applyTheme(themeName) {
  document.documentElement.dataset.theme = themeName;
  localStorage.setItem(THEME_STORAGE_KEY, themeName);

  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === themeName);
  });
}

/* ---------------------------------------------------------
   5. Event Listeners & Initialization
   --------------------------------------------------------- */

studentForm.addEventListener("submit", addStudent);
markInputs.forEach((input) => input.addEventListener("input", updateLivePreview));
searchInput.addEventListener("input", renderTable);
clearAllBtn.addEventListener("click", clearAllRecords);

sortBtn.addEventListener("click", () => {
  if (sortMode === "default") {
    sortMode = "desc";
    sortBtn.textContent = "Sort %: High → Low";
  } else if (sortMode === "desc") {
    sortMode = "asc";
    sortBtn.textContent = "Sort %: Low → High";
  } else {
    sortMode = "default";
    sortBtn.textContent = "Sort %: Default";
  }
  renderTable();
});

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    filterChips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    activeFilter = chip.dataset.filter;
    renderTable();
  });
});

document.querySelectorAll(".theme-btn").forEach((btn) => {
  btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
});

// Initialize on page load
createStarfield();
applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || "multicolor");
loadFromLocalStorage();
renderAll();
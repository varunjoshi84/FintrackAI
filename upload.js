document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const fileInput = document.getElementById("fileInput");
  const uploadBtn = document.getElementById("uploadBtn");
  const fileNameSpan = document.getElementById("fileName");
  const previewSection = document.getElementById("previewSection");
  const downloadSection = document.getElementById("downloadSection");
  const generateBtn = document.getElementById("generateBtn");
  const downloadButtons = document.querySelectorAll(".download-btn");
  const dropZone = document.querySelector(".drop-zone");

  const maxSizeMB = 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv"
  ];

  // === Drag-and-drop behavior ===
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#3182ce";
    dropZone.style.backgroundColor = "#e6f0fb";
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.style.borderColor = "#cbd5e0";
    dropZone.style.backgroundColor = "#edf2f7";
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#cbd5e0";
    dropZone.style.backgroundColor = "#edf2f7";

    const file = e.dataTransfer.files[0];
    if (!file) return;

    fileInput.files = e.dataTransfer.files;
    fileNameSpan.textContent = file.name;
  });

  // === File select (click) display ===
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    fileNameSpan.textContent = file ? file.name : "Drag and drop or click to upload a file";
  });

  // === Upload logic ===
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const file = fileInput.files[0];

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    if (file.size > maxSizeBytes) {
      alert(`File size exceeds ${maxSizeMB}MB. Please choose a smaller file.`);
      fileInput.value = "";
      fileNameSpan.textContent = "Drag and drop or click to upload a file";
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only PDF, DOC, DOCX, and CSV are allowed.");
      fileInput.value = "";
      fileNameSpan.textContent = "Drag and drop or click to upload a file";
      return;
    }

    // Simulate uploading
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    setTimeout(() => {
      uploadBtn.disabled = false;
      uploadBtn.textContent = "Upload";
      previewSection.style.display = "block";
      fileInput.value = "";
      fileNameSpan.textContent = "Drag and drop or click to upload a file";
    }, 1200);
  });

  // === Generate Report Button ===
  generateBtn.addEventListener("click", () => {
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";

    setTimeout(() => {
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate Report";
      downloadSection.style.display = "block";
    }, 1200);
  });

  // === Dummy Download Buttons ===
  downloadButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      alert("Download functionality will be added soon.");
    });
  });
});

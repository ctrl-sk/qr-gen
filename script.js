// Config
const DEFAULT_URL = "https://shocky.in";
const LIGHT_MODE = "light";
const DARK_MODE = "dark";

// Colors
const COLORS = {
  light: {
    dots: "#141413",
    corners: "#cf4500", // dark orange for light mode
  },
  dark: {
    dots: "#ffffff",
    corners: "#F37338", // light orange for dark mode
  },
};

// State
let currentMode = DARK_MODE; // default to dark theme QR
let qr = null;
let uploadedSvgDataUrl = null;
const PREVIEW_SIZE = 360;

// Elements
const qrContainer = document.getElementById("qr-container");
const previewOutline = document.getElementById("preview-outline");
const urlInput = document.getElementById("url-input");
const modeToggle = document.getElementById("mode-toggle");
const toggleLabel = document.getElementById("toggle-label");
const logoInput = document.getElementById("logo-input");
const downloadPngBtn = document.getElementById("download-png");
const downloadSvgBtn = document.getElementById("download-svg");
const sizeSelect = document.getElementById("export-size");

function createQrInstance(value) {
  const palette = COLORS[currentMode];
  const qrOptions = {
    // render at fixed preview size to ensure no clipping and good fit within outline
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    type: "svg",
    data: value,
    image: uploadedSvgDataUrl || undefined,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.32, // a little larger logo
      margin: 8,
      crossOrigin: "anonymous",
    },
    qrOptions: {
      errorCorrectionLevel: "H",
      margin: 0,
    },
    backgroundOptions: {
      color: "transparent", // no background
    },
    dotsOptions: {
      color: palette.dots,
      type: "dots", // individual circular dots with spacing
    },
    cornersSquareOptions: {
      color: palette.corners,
      type: "extra-rounded",
    },
    cornersDotOptions: {
      color: palette.corners,
      type: "dot",
    },
  };
  return new QRCodeStyling(qrOptions);
}

function mountQr() {
  qrContainer.innerHTML = "";
  qr = createQrInstance(urlInput.value || DEFAULT_URL);
  qr.append(qrContainer);
}

function updateQr() {
  if (!qr) return;
  const palette = COLORS[currentMode];
  const data = urlInput.value || DEFAULT_URL;
  qr.update({
    data,
    image: uploadedSvgDataUrl || undefined,
    imageOptions: { hideBackgroundDots: true, imageSize: 0.32, margin: 8, crossOrigin: "anonymous" },
    backgroundOptions: { color: "transparent" },
    dotsOptions: { color: palette.dots, type: "dots" },
    cornersSquareOptions: { color: palette.corners, type: "extra-rounded" },
    cornersDotOptions: { color: palette.corners, type: "dot" },
  });
}

function setMode(mode) {
  currentMode = mode;
  const pressed = mode === LIGHT_MODE;
  modeToggle.setAttribute("aria-pressed", String(pressed));
  toggleLabel.textContent = pressed ? "Dark QR" : "Light QR";
  previewOutline.setAttribute("data-mode", pressed ? "light" : "dark");
  updateQr();
}

// Handlers
modeToggle.addEventListener("click", () => {
  setMode(currentMode === DARK_MODE ? LIGHT_MODE : DARK_MODE);
});

urlInput.addEventListener("input", () => {
  updateQr();
});

logoInput.addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (file.type !== "image/svg+xml") {
    alert("Please select an SVG file.");
    return;
  }
  const text = await file.text();
  const svgBlob = new Blob([text], { type: "image/svg+xml" });
  uploadedSvgDataUrl = URL.createObjectURL(svgBlob);
  updateQr();
});

async function exportQr(format) {
  if (!qr) return;
  const selected = sizeSelect ? parseInt(sizeSelect.value, 10) || 400 : 400;
  // Create a separate instance for export to avoid touching the preview
  const palette = COLORS[currentMode];
  const dataValue = urlInput.value || DEFAULT_URL;
  const exportQrInstance = new QRCodeStyling({
    width: selected,
    height: selected,
    type: "svg",
    data: dataValue,
    image: uploadedSvgDataUrl || undefined,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.32,
      margin: 8,
      crossOrigin: "anonymous",
    },
    qrOptions: {
      errorCorrectionLevel: "H",
      margin: 0,
    },
    backgroundOptions: { color: "transparent" },
    dotsOptions: { color: palette.dots, type: "dots" },
    cornersSquareOptions: { color: palette.corners, type: "extra-rounded" },
    cornersDotOptions: { color: palette.corners, type: "dot" },
  });

  const dataBlob = await exportQrInstance.getRawData(format);
  const url = URL.createObjectURL(dataBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `qr.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

downloadPngBtn.addEventListener("click", async () => {
  await exportQr("png");
});

downloadSvgBtn.addEventListener("click", async () => {
  await exportQr("svg");
});

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  urlInput.value = DEFAULT_URL;
  mountQr();
  setMode(DARK_MODE);
});



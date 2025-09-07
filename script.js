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

// Elements
const qrContainer = document.getElementById("qr-container");
const previewOutline = document.getElementById("preview-outline");
const urlInput = document.getElementById("url-input");
const modeToggle = document.getElementById("mode-toggle");
const toggleLabel = document.getElementById("toggle-label");
const logoInput = document.getElementById("logo-input");
const downloadPngBtn = document.getElementById("download-png");
const downloadSvgBtn = document.getElementById("download-svg");

function createQrInstance(value) {
  const palette = COLORS[currentMode];
  const qrOptions = {
    // render at 360 to ensure no clipping and good fit within outline
    width: 360,
    height: 360,
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

downloadPngBtn.addEventListener("click", async () => {
  if (!qr) return;
  const data = await qr.getRawData("png");
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "qr.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

downloadSvgBtn.addEventListener("click", async () => {
  if (!qr) return;
  const data = await qr.getRawData("svg");
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "qr.svg";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  urlInput.value = DEFAULT_URL;
  mountQr();
  setMode(DARK_MODE);
});



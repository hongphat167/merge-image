// Lấy các elements
const image1Input = document.getElementById('image1');
const image2Input = document.getElementById('image2');
const textLeftInput = document.getElementById('textLeft');
const textMiddleInput = document.getElementById('textMiddle');
const textRightInput = document.getElementById('textRight');
const mergeBtn = document.getElementById('mergeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultSection = document.getElementById('resultSection');
const loading = document.getElementById('loading');
const preview1 = document.getElementById('preview1');
const preview2 = document.getElementById('preview2');
const rotateOverlay = document.getElementById('rotateOverlay');

// Fullscreen editor elements
const fullscreenEditor = document.getElementById('fullscreenEditor');
const editorCanvas = document.getElementById('editorCanvas');
const editorCtx = editorCanvas.getContext('2d');
const downloadEditorBtn = document.getElementById('downloadEditorBtn');
const closeEditorBtn = document.getElementById('closeEditorBtn');

let img1 = null;
let img2 = null;
let resultShown = false;
let isEditorMode = false;

// Canvas xuất ảnh (full HD - độ phân giải gốc)
let exportCanvas = document.createElement('canvas');
let exportCtx = exportCanvas.getContext('2d');

// Kiểm tra orientation và hiển thị overlay/editor nếu cần
function checkOrientation() {
    const isMobile = window.innerWidth <= 1024;
    const isPortrait = window.innerHeight > window.innerWidth;
    const isLandscape = !isPortrait;

    if (isMobile && resultShown) {
        if (isPortrait) {
            rotateOverlay.style.display = 'flex';
            fullscreenEditor.style.display = 'none';
            isEditorMode = false;
        } else {
            rotateOverlay.style.display = 'none';
            openFullscreenEditor();
        }
    } else {
        rotateOverlay.style.display = 'none';
        if (!isMobile) {
            fullscreenEditor.style.display = 'none';
            isEditorMode = false;
        }
    }
}

// Mở fullscreen editor
function openFullscreenEditor() {
    fullscreenEditor.style.display = 'flex';
    isEditorMode = true;

    editorCanvas.width = canvas.width;
    editorCanvas.height = canvas.height;

    drawCanvas(editorCtx, editorCanvas);
}

// Đóng fullscreen editor
function closeFullscreenEditor() {
    fullscreenEditor.style.display = 'none';
    isEditorMode = false;
    resultShown = false;

    drawCanvas(ctx, canvas);
}

// Lắng nghe sự kiện xoay màn hình
window.addEventListener('orientationchange', () => {
    setTimeout(checkOrientation, 100);
});
window.addEventListener('resize', checkOrientation);

// Xem trước ảnh 1
image1Input.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            img1 = new Image();
            img1.src = event.target.result;
            img1.onload = function () {
                preview1.innerHTML = `<img src="${event.target.result}" alt="Preview 1">`;
            };
        };
        reader.readAsDataURL(file);
    }
});

// Xem trước ảnh 2
image2Input.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            img2 = new Image();
            img2.src = event.target.result;
            img2.onload = function () {
                preview2.innerHTML = `<img src="${event.target.result}" alt="Preview 2">`;
            };
        };
        reader.readAsDataURL(file);
    }
});

// Hàm ghép ảnh
mergeBtn.addEventListener('click', function () {
    if (!img1 || !img2) {
        alert('⚠️ Vui lòng chọn đủ 2 ảnh! ');
        return;
    }

    loading.style.display = 'flex';

    setTimeout(() => {
        mergeImages();
        loading.style.display = 'none';
        resultShown = true;
        checkOrientation();
    }, 300);
});

function mergeImages() {
    // Canvas hiển thị - scale xuống để hiển thị mượt
    const displayMaxHeight = 600;
    const scale1 = displayMaxHeight / img1.height;
    const scale2 = displayMaxHeight / img2.height;
    const img1Width = img1.width * scale1;
    const img2Width = img2.width * scale2;

    canvas.width = img1Width + img2Width;
    canvas.height = displayMaxHeight;

    drawCanvas(ctx, canvas);
    resultSection.style.display = 'block';
    downloadBtn.style.display = 'inline-block';
    resultSection.scrollIntoView({behavior: 'smooth', block: 'nearest'});
}

function drawCanvas(context, targetCanvas) {
    const canvasHeight = targetCanvas.height;
    const scale1 = canvasHeight / img1.height;
    const scale2 = canvasHeight / img2.height;
    const img1Width = img1.width * scale1;
    const img2Width = img2.width * scale2;

    // Enable high-quality image rendering
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    // Vẽ 2 ảnh
    context.drawImage(img1, 0, 0, img1Width, canvasHeight);
    context.drawImage(img2, img1Width, 0, img2Width, canvasHeight);

    // Lấy text từ inputs
    const textLeft = textLeftInput.value.trim() || 'Trước';
    const textMiddle = textMiddleInput.value.trim();
    const textRight = textRightInput.value.trim() || 'Sau';

    const fontSize = 40;
    context.font = `bold ${fontSize}px Arial`;
    context.textBaseline = 'top';

    const padding = 20;

    // Text bên trái (góc dưới trái) - "Trước"
    const leftX = padding;
    const leftY = canvasHeight - fontSize - padding;

    context.strokeStyle = '#ffffff';
    context.lineWidth = 6;
    context.strokeText(textLeft, leftX, leftY);

    context.fillStyle = '#0000ff';
    context.fillText(textLeft, leftX, leftY);

    // Text ở giữa (trên cùng ở giữa) - custom text
    if (textMiddle) {
        const metrics = context.measureText(textMiddle);
        const middleX = (targetCanvas.width - metrics.width) / 2;
        const middleY = padding;

        context.strokeStyle = '#ffffff';
        context.lineWidth = 6;
        context.strokeText(textMiddle, middleX, middleY);

        context.fillStyle = '#ff0000';
        context.fillText(textMiddle, middleX, middleY);
    }

    // Text bên phải (góc dưới phải) - "Sau"
    const metricsRight = context.measureText(textRight);
    const rightX = targetCanvas.width - metricsRight.width - padding;
    const rightY = canvasHeight - fontSize - padding;

    context.strokeStyle = '#ffffff';
    context.lineWidth = 6;
    context.strokeText(textRight, rightX, rightY);

    context.fillStyle = '#0000ff';
    context.fillText(textRight, rightX, rightY);
}

// Hàm vẽ canvas chất lượng cao cho export
function drawHighQualityCanvas() {
    // Sử dụng độ phân giải gốc của ảnh
    const maxHeight = Math.max(img1.height, img2.height);
    const scale1 = maxHeight / img1.height;
    const scale2 = maxHeight / img2.height;
    const img1Width = img1.width * scale1;
    const img2Width = img2.width * scale2;

    exportCanvas.width = img1Width + img2Width;
    exportCanvas.height = maxHeight;

    // Enable high-quality rendering
    exportCtx.imageSmoothingEnabled = true;
    exportCtx.imageSmoothingQuality = 'high';

    // Vẽ ảnh với độ phân giải gốc
    exportCtx.drawImage(img1, 0, 0, img1Width, maxHeight);
    exportCtx.drawImage(img2, img1Width, 0, img2Width, maxHeight);

    // Tính scale factor
    const scaleRatio = maxHeight / canvas.height;

    // Lấy text từ inputs
    const textLeft = textLeftInput.value.trim() || 'Trước';
    const textMiddle = textMiddleInput.value.trim();
    const textRight = textRightInput.value.trim() || 'Sau';

    const fontSize = 40 * scaleRatio;
    exportCtx.font = `bold ${fontSize}px Arial`;
    exportCtx.textBaseline = 'top';

    const padding = 20 * scaleRatio;

    // Text bên trái (góc dưới trái) - "Trước"
    const leftX = padding;
    const leftY = maxHeight - fontSize - padding;

    exportCtx.strokeStyle = '#ffffff';
    exportCtx.lineWidth = 6 * scaleRatio;
    exportCtx.strokeText(textLeft, leftX, leftY);

    exportCtx.fillStyle = '#0000ff';
    exportCtx.fillText(textLeft, leftX, leftY);

    // Text ở giữa (trên cùng ở giữa) - custom text
    if (textMiddle) {
        const metrics = exportCtx.measureText(textMiddle);
        const middleX = (exportCanvas.width - metrics.width) / 2;
        const middleY = padding;

        exportCtx.strokeStyle = '#ffffff';
        exportCtx.lineWidth = 6 * scaleRatio;
        exportCtx.strokeText(textMiddle, middleX, middleY);

        exportCtx.fillStyle = '#ff0000';
        exportCtx.fillText(textMiddle, middleX, middleY);
    }

    // Text bên phải (góc dưới phải) - "Sau"
    const metricsRight = exportCtx.measureText(textRight);
    const rightX = exportCanvas.width - metricsRight.width - padding;
    const rightY = maxHeight - fontSize - padding;

    exportCtx.strokeStyle = '#ffffff';
    exportCtx.lineWidth = 6 * scaleRatio;
    exportCtx.strokeText(textRight, rightX, rightY);

    exportCtx.fillStyle = '#0000ff';
    exportCtx.fillText(textRight, rightX, rightY);
}

// Tải xuống ảnh chất lượng cao từ canvas chính
downloadBtn.addEventListener('click', function () {
    // Vẽ canvas chất lượng cao
    drawHighQualityCanvas();

    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    link.download = `merged-image-${timestamp}.png`;
    link.href = exportCanvas.toDataURL('image/png', 1.0);
    link.click();
});

// Tải xuống ảnh chất lượng cao từ editor
downloadEditorBtn.addEventListener('click', function () {
    // Vẽ canvas chất lượng cao
    drawHighQualityCanvas();

    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    link.download = `merged-image-${timestamp}.png`;
    link.href = exportCanvas.toDataURL('image/png', 1.0);
    link.click();

    // Hiển thị thông báo
    const originalText = downloadEditorBtn.innerHTML;
    downloadEditorBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Đã tải! </span>';
    setTimeout(() => {
        downloadEditorBtn.innerHTML = originalText;
    }, 2000);
});

// Đóng editor
closeEditorBtn.addEventListener('click', closeFullscreenEditor);

// Làm mới form
clearBtn.addEventListener('click', function () {
    if (confirm('🔄 Bạn có chắc muốn làm mới và bắt đầu lại?')) {
        image1Input.value = '';
        image2Input.value = '';
        textLeftInput.value = '';
        textMiddleInput.value = '';
        textRightInput.value = '';
        preview1.innerHTML = '';
        preview2.innerHTML = '';
        img1 = null;
        img2 = null;
        resultShown = false;
        isEditorMode = false;
        resultSection.style.display = 'none';
        downloadBtn.style.display = 'none';
        rotateOverlay.style.display = 'none';
        fullscreenEditor.style.display = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        editorCtx.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
        exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
    }
});
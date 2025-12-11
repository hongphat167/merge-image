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
let texts = [];
let selectedText = null;
let isDragging = false;
let dragOffset = {x: 0, y: 0};
let resultShown = false;
let isEditorMode = false;

// Kiểm tra orientation và hiển thị overlay/editor nếu cần
function checkOrientation() {
    const isMobile = window.innerWidth <= 1024;
    const isPortrait = window.innerHeight > window.innerWidth;
    const isLandscape = !isPortrait;

    if (isMobile && resultShown) {
        if (isPortrait) {
            // Chế độ dọc:  hiện overlay yêu cầu xoay
            rotateOverlay.style.display = 'flex';
            fullscreenEditor.style.display = 'none';
            isEditorMode = false;
        } else {
            // Chế độ ngang: hiện fullscreen editor
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

    // Copy canvas sang editor canvas
    editorCanvas.width = canvas.width;
    editorCanvas.height = canvas.height;

    drawCanvas(editorCtx, editorCanvas);
}

// Đóng fullscreen editor
function closeFullscreenEditor() {
    fullscreenEditor.style.display = 'none';
    isEditorMode = false;
    resultShown = false;

    // Copy lại changes từ editor về canvas chính
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
    const textLeft = textLeftInput.value || '';
    const textMiddle = textMiddleInput.value || '';
    const textRight = textRightInput.value || '';

    const maxHeight = 600;

    const scale1 = maxHeight / img1.height;
    const scale2 = maxHeight / img2.height;
    const img1Width = img1.width * scale1;
    const img2Width = img2.width * scale2;

    canvas.width = img1Width + img2Width;
    canvas.height = maxHeight;

    texts = [];

    if (textLeft) {
        texts.push({
            text: textLeft,
            x: 50,
            y: 50,
            fontSize: 30,
            color: '#0000ff'
        });
    }

    if (textMiddle) {
        texts.push({
            text: textMiddle,
            x: canvas.width / 2 - 50,
            y: canvas.height / 2,
            fontSize: 30,
            color: '#0000ff'
        });
    }

    if (textRight) {
        texts.push({
            text: textRight,
            x: canvas.width - 150,
            y: 50,
            fontSize: 30,
            color: '#0000ff'
        });
    }

    drawCanvas(ctx, canvas);
    resultSection.style.display = 'block';
    downloadBtn.style.display = 'inline-block';
    resultSection.scrollIntoView({behavior: 'smooth', block: 'nearest'});
}

function drawCanvas(context, targetCanvas) {
    const scale1 = targetCanvas.height / img1.height;
    const scale2 = targetCanvas.height / img2.height;
    const img1Width = img1.width * scale1;
    const img2Width = img2.width * scale2;

    context.drawImage(img1, 0, 0, img1Width, targetCanvas.height);
    context.drawImage(img2, img1Width, 0, img2Width, targetCanvas.height);

    texts.forEach((textObj, index) => {
        context.font = `bold ${textObj.fontSize}px Arial`;
        context.textBaseline = 'top';

        const metrics = context.measureText(textObj.text);
        const textWidth = metrics.width;
        const textHeight = textObj.fontSize;

        textObj.width = textWidth;
        textObj.height = textHeight;

        context.strokeStyle = '#ffffff';
        context.lineWidth = 4;
        context.strokeText(textObj.text, textObj.x, textObj.y);

        context.fillStyle = textObj.color;
        context.fillText(textObj.text, textObj.x, textObj.y);

        if (selectedText === index) {
            context.strokeStyle = 'rgba(0, 255, 0, 0.8)';
            context.lineWidth = 2;
            context.setLineDash([5, 5]);
            context.strokeRect(textObj.x - 5, textObj.y - 5, textWidth + 10, textHeight + 10);
            context.setLineDash([]);
        }
    });
}

// Hàm lấy tọa độ chuột/touch
function getPointerPosition(e, targetCanvas) {
    const rect = targetCanvas.getBoundingClientRect();
    const scaleX = targetCanvas.width / rect.width;
    const scaleY = targetCanvas.height / rect.height;

    let clientX, clientY;

    if (e.touches && e.touches. length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e. clientY;
    }

    return {
        x:  (clientX - rect.left) * scaleX,
        y:  (clientY - rect.top) * scaleY
    };
}

// Hàm xử lý bắt đầu kéo
function handleDragStart(e, targetCanvas) {
    e.preventDefault();

    const pos = getPointerPosition(e, targetCanvas);
    const mouseX = pos.x;
    const mouseY = pos.y;

    selectedText = null;
    for (let i = texts.length - 1; i >= 0; i--) {
        const t = texts[i];
        if (mouseX >= t.x - 5 && mouseX <= t.x + t.width + 5 &&
            mouseY >= t.y - 5 && mouseY <= t.y + t.height + 5) {
            selectedText = i;
            isDragging = true;
            dragOffset. x = mouseX - t.x;
            dragOffset.y = mouseY - t.y;
            break;
        }
    }

    const context = isEditorMode ? editorCtx : ctx;
    const canvasTarget = isEditorMode ? editorCanvas : canvas;
    drawCanvas(context, canvasTarget);
}

// Hàm xử lý di chuyển
function handleDragMove(e, targetCanvas) {
    if (isDragging && selectedText !== null) {
        e.preventDefault();

        const pos = getPointerPosition(e, targetCanvas);
        const mouseX = pos.x;
        const mouseY = pos.y;

        texts[selectedText].x = mouseX - dragOffset.x;
        texts[selectedText].y = mouseY - dragOffset.y;

        const context = isEditorMode ? editorCtx : ctx;
        const canvasTarget = isEditorMode ? editorCanvas : canvas;
        drawCanvas(context, canvasTarget);
    }
}

// Hàm xử lý kết thúc kéo
function handleDragEnd(e) {
    isDragging = false;
}

// Sự kiện cho canvas chính (Desktop và Mobile Portrait)
canvas.addEventListener('mousedown', (e) => handleDragStart(e, canvas));
canvas.addEventListener('mousemove', (e) => handleDragMove(e, canvas));
canvas.addEventListener('mouseup', handleDragEnd);
canvas.addEventListener('mouseleave', handleDragEnd);
canvas.addEventListener('touchstart', (e) => handleDragStart(e, canvas), {passive: false});
canvas.addEventListener('touchmove', (e) => handleDragMove(e, canvas), {passive: false});
canvas.addEventListener('touchend', handleDragEnd);
canvas.addEventListener('touchcancel', handleDragEnd);

// Sự kiện cho editor canvas (Mobile Landscape)
editorCanvas.addEventListener('mousedown', (e) => handleDragStart(e, editorCanvas));
editorCanvas.addEventListener('mousemove', (e) => handleDragMove(e, editorCanvas));
editorCanvas.addEventListener('mouseup', handleDragEnd);
editorCanvas.addEventListener('mouseleave', handleDragEnd);
editorCanvas.addEventListener('touchstart', (e) => handleDragStart(e, editorCanvas), {passive: false});
editorCanvas.addEventListener('touchmove', (e) => handleDragMove(e, editorCanvas), {passive: false});
editorCanvas.addEventListener('touchend', handleDragEnd);
editorCanvas.addEventListener('touchcancel', handleDragEnd);

// Tải xuống ảnh từ canvas chính
downloadBtn.addEventListener('click', function () {
    const tempSelected = selectedText;
    selectedText = null;
    drawCanvas(ctx, canvas);

    const link = document.createElement('a');
    link.download = 'merged-image.png';
    link. href = canvas.toDataURL('image/png');
    link.click();

    selectedText = tempSelected;
    drawCanvas(ctx, canvas);
});

// Tải xuống ảnh từ editor
downloadEditorBtn.addEventListener('click', function () {
    const tempSelected = selectedText;
    selectedText = null;
    drawCanvas(editorCtx, editorCanvas);

    const link = document.createElement('a');
    link.download = 'merged-image.png';
    link.href = editorCanvas.toDataURL('image/png');
    link.click();

    // Hiển thị thông báo
    const originalText = downloadEditorBtn.innerHTML;
    downloadEditorBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Đã tải! </span>';
    setTimeout(() => {
        downloadEditorBtn.innerHTML = originalText;
    }, 2000);

    selectedText = tempSelected;
    drawCanvas(editorCtx, editorCanvas);
});

// Đóng editor
closeEditorBtn.addEventListener('click', closeFullscreenEditor);

// Làm mới form
clearBtn.addEventListener('click', function () {
    if (confirm('🔄 Bạn có chắc muốn làm mới và bắt đầu lại? ')) {
        image1Input.value = '';
        image2Input.value = '';
        textLeftInput.value = '';
        textMiddleInput.value = '';
        textRightInput.value = '';
        preview1.innerHTML = '';
        preview2.innerHTML = '';
        img1 = null;
        img2 = null;
        texts = [];
        selectedText = null;
        resultShown = false;
        isEditorMode = false;
        resultSection.style.display = 'none';
        downloadBtn.style.display = 'none';
        rotateOverlay.style.display = 'none';
        fullscreenEditor.style.display = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        editorCtx.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
    }
});
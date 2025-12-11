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
const resultSection = document. getElementById('resultSection');
const loading = document.getElementById('loading');
const preview1 = document.getElementById('preview1');
const preview2 = document.getElementById('preview2');

let img1 = null;
let img2 = null;
let texts = [];
let selectedText = null;
let isDragging = false;
let dragOffset = {x: 0, y: 0};

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
        reader. readAsDataURL(file);
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
                preview2.innerHTML = `<img src="${event.target. result}" alt="Preview 2">`;
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

    drawCanvas();
    resultSection.style.display = 'block';
    downloadBtn.style.display = 'inline-block';
    resultSection.scrollIntoView({behavior: 'smooth', block: 'nearest'});
}

function drawCanvas() {
    const scale1 = canvas.height / img1.height;
    const scale2 = canvas.height / img2.height;
    const img1Width = img1.width * scale1;
    const img2Width = img2.width * scale2;

    ctx. drawImage(img1, 0, 0, img1Width, canvas.height);
    ctx.drawImage(img2, img1Width, 0, img2Width, canvas.height);

    texts.forEach((textObj, index) => {
        ctx.font = `bold ${textObj.fontSize}px Arial`;
        ctx.textBaseline = 'top';

        const metrics = ctx.measureText(textObj.text);
        const textWidth = metrics.width;
        const textHeight = textObj.fontSize;

        textObj.width = textWidth;
        textObj.height = textHeight;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeText(textObj.text, textObj. x, textObj.y);

        ctx.fillStyle = textObj.color;
        ctx.fillText(textObj.text, textObj. x, textObj.y);

        if (selectedText === index) {
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
            ctx.lineWidth = 2;
            ctx. setLineDash([5, 5]);
            ctx.strokeRect(textObj.x - 5, textObj.y - 5, textWidth + 10, textHeight + 10);
            ctx.setLineDash([]);
        }
    });
}

// Hàm lấy tọa độ chuột/touch
function getPointerPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect. height;

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
function handleDragStart(e) {
    e.preventDefault();

    const pos = getPointerPosition(e);
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
    drawCanvas();
}

// Hàm xử lý di chuyển
function handleDragMove(e) {
    if (isDragging && selectedText !== null) {
        e.preventDefault();

        const pos = getPointerPosition(e);
        const mouseX = pos.x;
        const mouseY = pos.y;

        texts[selectedText].x = mouseX - dragOffset.x;
        texts[selectedText].y = mouseY - dragOffset.y;
        drawCanvas();
    }
}

// Hàm xử lý kết thúc kéo
function handleDragEnd(e) {
    isDragging = false;
}

// Sự kiện chuột (Desktop)
canvas.addEventListener('mousedown', handleDragStart);
canvas.addEventListener('mousemove', handleDragMove);
canvas.addEventListener('mouseup', handleDragEnd);
canvas.addEventListener('mouseleave', handleDragEnd);

// Sự kiện touch (Mobile)
canvas.addEventListener('touchstart', handleDragStart, {passive: false});
canvas.addEventListener('touchmove', handleDragMove, {passive: false});
canvas.addEventListener('touchend', handleDragEnd);
canvas.addEventListener('touchcancel', handleDragEnd);

// Tải xuống ảnh
downloadBtn.addEventListener('click', function () {
    const tempSelected = selectedText;
    selectedText = null;
    drawCanvas();

    const link = document.createElement('a');
    link.download = 'merged-image.png';
    link. href = canvas.toDataURL('image/png');
    link.click();

    selectedText = tempSelected;
    drawCanvas();
});

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
        texts = [];
        selectedText = null;
        resultSection.style.display = 'none';
        downloadBtn.style.display = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});
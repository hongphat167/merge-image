// Lấy các elements
const image1Input = document.getElementById('image1');
const image2Input = document.getElementById('image2');
const textLeftInput = document.getElementById('textLeft');
const textMiddleInput = document.getElementById('textMiddle');
const textRightInput = document.getElementById('textRight');
const mergeBtn = document.getElementById('mergeBtn');
const clearBtn = document.getElementById('clearBtn');
const loading = document.getElementById('loading');
const preview1 = document.getElementById('preview1');
const preview2 = document.getElementById('preview2');

let img1 = null;
let img2 = null;

// Canvas xuất ảnh (full HD - độ phân giải gốc)
let exportCanvas = document.createElement('canvas');
let exportCtx = exportCanvas.getContext('2d');

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

// Hàm ghép ảnh và tải xuống luôn
mergeBtn.addEventListener('click', function () {
    if (!img1 || !img2) {
        alert('⚠️ Vui lòng chọn đủ 2 ảnh!');
        return;
    }

    loading.style.display = 'flex';

    setTimeout(() => {
        mergeAndDownload();
        loading.style.display = 'none';
    }, 300);
});

function mergeAndDownload() {
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

    // Lấy text từ inputs
    const textLeft = textLeftInput.value.trim() || 'Trước';
    const textMiddle = textMiddleInput.value.trim();
    const textRight = textRightInput.value.trim() || 'Sau';

    const fontSize = Math.max(40, maxHeight * 0.04);
    exportCtx.font = `bold ${fontSize}px Arial`;
    exportCtx.textBaseline = 'top';

    const padding = Math.max(20, maxHeight * 0.02);

    // Text bên trái (góc dưới trái) - "Trước"
    const leftX = padding;
    const leftY = maxHeight - fontSize - padding;

    exportCtx.strokeStyle = '#ffffff';
    exportCtx.lineWidth = Math.max(6, fontSize * 0.15);
    exportCtx.strokeText(textLeft, leftX, leftY);

    exportCtx.fillStyle = '#0000ff';
    exportCtx.fillText(textLeft, leftX, leftY);

    // Text ở giữa (trên cùng ở giữa) - custom text
    if (textMiddle) {
        const metrics = exportCtx.measureText(textMiddle);
        const middleX = (exportCanvas.width - metrics.width) / 2;
        const middleY = padding;

        exportCtx.strokeStyle = '#ffffff';
        exportCtx.lineWidth = Math.max(6, fontSize * 0.15);
        exportCtx.strokeText(textMiddle, middleX, middleY);

        exportCtx.fillStyle = '#ff0000';
        exportCtx.fillText(textMiddle, middleX, middleY);
    }

    // Text bên phải (góc dưới phải) - "Sau"
    const metricsRight = exportCtx.measureText(textRight);
    const rightX = exportCanvas.width - metricsRight.width - padding;
    const rightY = maxHeight - fontSize - padding;

    exportCtx.strokeStyle = '#ffffff';
    exportCtx.lineWidth = Math.max(6, fontSize * 0.15);
    exportCtx.strokeText(textRight, rightX, rightY);

    exportCtx.fillStyle = '#0000ff';
    exportCtx.fillText(textRight, rightX, rightY);

    // Tải xuống ngay
    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    link.download = `merged-image-${timestamp}.png`;
    link.href = exportCanvas.toDataURL('image/png', 1.0);
    link.click();

    // Hiển thị thông báo thành công
    showSuccessMessage();
}

function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = '✅ Đã tải ảnh xuống thành công!';
    document.body.appendChild(message);

    setTimeout(() => {
        message.classList.add('show');
    }, 10);

    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

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
        exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
    }
});

import { makeDraggable, makeDraggablePhoneTouch } from './element-interactions.mjs';

export function createColorDropper() {
    let currentImage = null; 
    const boxiconsLink = document.createElement('link');
    boxiconsLink.href = 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css';
    boxiconsLink.rel = 'stylesheet';
    document.head.appendChild(boxiconsLink);

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        z-index: 10000;
        justify-content: center;
        align-items: center;
    `;

    const pickerContainer = document.createElement('div');
    pickerContainer.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        position: relative;
        display: block;
        min-width: max-content; 
        max-width: 1200px;
        box-sizing: border-box;
    `;

    const closeButtonContainer = document.createElement('div');
    closeButtonContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = "<i class='bx bx-x'></i>";
    closeButton.style.cssText = `
        border: none;
        background: none;
        font-size: 24px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s, transform 0.2s;
    `;

    closeButton.onmouseenter = () => {
        closeButton.style.backgroundColor = '#f0f0f0';
        closeButton.style.transform = 'scale(1.1)';
    };
    closeButton.onmouseleave = () => {
        closeButton.style.backgroundColor = 'transparent';
        closeButton.style.transform = 'scale(1)';
    };

    const pixelTooltip = document.createElement('div');
    pixelTooltip.style.cssText = `
        position: fixed;
        background: white;
        padding: 8px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        pointer-events: none;
        display: none;
        z-index: 10001;
    `;
    document.body.appendChild(pixelTooltip);

    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        cursor: crosshair;
        display: none;
        width: 100%;
        height: 100%;
    `;

    const dropZone = document.createElement('div');
    dropZone.innerHTML = 'Drop image here or click to upload';
    dropZone.style.cssText = `
        border: 2px dashed #ccc;
        text-align: center;
        cursor: pointer;
        min-width: 204px;
        min-height: 154px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    `;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    const colorPreview = document.createElement('div');
    colorPreview.style.cssText = `
        margin-top: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    const colorBox = document.createElement('div');
    colorBox.style.cssText = `
        width: 50px;
        height: 50px;
        border: 1px solid #ccc;
        border-radius: 4px;
    `;
    const colorValue = document.createElement('span');
    colorPreview.appendChild(colorBox);
    colorPreview.appendChild(colorValue);

    const resetButton = document.createElement('button');
    resetButton.innerHTML = "<i class='bx bx-revision'></i>";
    resetButton.style.cssText = `
        border: none;
        background: #f0f0f0;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        transition: background-color 0.2s, transform 0.2s;
        margin-left: 10px;
    `;
    resetButton.onmouseenter = () => {
        resetButton.style.backgroundColor = '#e0e0e0';
        resetButton.style.transform = 'scale(1.05)';
    };
    resetButton.onmouseleave = () => {
        resetButton.style.backgroundColor = '#f0f0f0';
        resetButton.style.transform = 'scale(1)';
    };

    closeButtonContainer.appendChild(closeButton);
    pickerContainer.appendChild(closeButtonContainer);
    pickerContainer.appendChild(dropZone);
    dropZone.appendChild(canvas);
    pickerContainer.appendChild(colorPreview);
    colorPreview.appendChild(resetButton);
    modal.appendChild(pickerContainer);
    document.body.appendChild(modal);
    document.body.appendChild(fileInput);

    function updatePixelPreview(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top; 
        const scaleX = canvas.width / canvas.clientWidth;
        const scaleY = canvas.height / canvas.clientHeight;
        const canvasX = Math.floor(x * scaleX);
        const canvasY = Math.floor(y * scaleY);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
        const color = rgbToHex(pixel[0], pixel[1], pixel[2]);
        pixelTooltip.style.display = 'block';
        pixelTooltip.style.left = `${e.clientX + 15}px`;
        pixelTooltip.style.top = `${e.clientY + 15}px`;
        pixelTooltip.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 20px; height: 20px; background: ${color}; border: 1px solid #ccc; border-radius: 2px;"></div>
                <span>${color}</span>
            </div>
            <div style="margin-top: 4px; font-size: 12px; color: #666;">
                RGB(${pixel[0]}, ${pixel[1]}, ${pixel[2]})
            </div>
        `;
    }

    let reloadImageTimeout = null;
    function updateDropZoneSize() {
        clearTimeout(reloadImageTimeout);
        const maxScreenWidth = window.innerWidth - 80;
        const maxScreenHeight = window.innerHeight - 160;
        let width, height;
        width = maxScreenWidth;
        height = width * (3/4);
        if (height > maxScreenHeight) {
            height = maxScreenHeight;
            width = height * (4/3);
        }
        width = Math.max(width, 204);
        height = Math.max(height, 154);
        if (dropZone.style.width != `${width}px` || dropZone.style.height != `${height}px`){
            dropZone.style.width = `${width}px`;
            dropZone.style.height = `${height}px`;
        }
        if (width != canvas.width || height != canvas.height){
            canvas.width = width;
            canvas.height = height;
        }
        reloadImageTimeout = setTimeout(loadImage, 100);
    }

    function loadImage(file) {
        if (!file && currentImage) {
            file = currentImage;
        }
        if (!file) {
            canvas.style.display = 'none';
            dropZone.innerHTML = 'Drop image here or click to upload';
            return;
        }
        currentImage = file;
        const img = new Image();
        img.onload = () => {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            let drawWidth = canvas.width;
            let drawHeight = canvas.height;
            let offsetX = 0;
            let offsetY = 0;
            
            const imageAspectRatio = img.width / img.height;
            const targetAspectRatio = 4/3;
            
            if (imageAspectRatio > targetAspectRatio) {
                drawHeight = canvas.height;
                drawWidth = drawHeight * targetAspectRatio;
                offsetX = (canvas.width - drawWidth) / 2;
            } else {
                drawWidth = canvas.width;
                drawHeight = drawWidth / targetAspectRatio;
                offsetY = (canvas.height - drawHeight) / 2;
            }
            
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            
            canvas.style.display = 'block';
            dropZone.innerHTML = '';
            dropZone.appendChild(canvas);
        };

        // Only create object URL if we have a valid file
        if (file instanceof Blob) {
            img.src = URL.createObjectURL(file);
        } else {
            console.error('Invalid file object:', file);
            canvas.style.display = 'none';
            dropZone.innerHTML = 'Drop image here or click to upload';
        }
    }

    closeButton.onclick = () => {
        modal.style.display = 'none';
        pixelTooltip.style.display = 'none';
    };

    dropZone.onclick = () => {
        fileInput.click();
    };

    fileInput.onchange = (e) => {
        if (e.target.files[0]) {
            loadImage(e.target.files[0]);
        }
    };

    dropZone.ondragover = (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#000';
    };

    dropZone.ondragleave = () => {
        dropZone.style.borderColor = '#ccc';
    };

    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ccc';
        if (e.dataTransfer.files[0]) {
            loadImage(e.dataTransfer.files[0]);
        }
    };

    canvas.onclick = (e) => {
        e.stopPropagation();
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const scaleX = canvas.width / canvas.clientWidth;
        const scaleY = canvas.height / canvas.clientHeight;
        const canvasX = Math.floor(x * scaleX);
        const canvasY = Math.floor(y * scaleY);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
        document.getElementById('redSlider').value = pixel[0];
        document.getElementById('greenSlider').value = pixel[1];
        document.getElementById('blueSlider').value = pixel[2];
        updateColorValue();
        const color = rgbToHex(pixel[0], pixel[1], pixel[2]);
        colorBox.style.backgroundColor = color;
        colorValue.textContent = color;
    };

    canvas.onmousemove = (e) => {
        updatePixelPreview(e, canvas);
    };

    canvas.onmouseleave = () => {
        pixelTooltip.style.display = 'none';
    };

    resetButton.onclick = (e) => {
        e.stopPropagation();
        currentImage = null;
        dropZone.innerHTML = 'Drop image here or click to upload';
        canvas.style.display = 'none';
        updateDropZoneSize();
    };

    document.getElementById('colorPreview').addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    window.addEventListener('resize', updateDropZoneSize);
    updateDropZoneSize();

    const colorEditor = document.getElementById('colorEditor');
    makeDraggable(colorEditor, '.color-editor-title');
    makeDraggablePhoneTouch(colorEditor, '.color-editor-title'); 
} 
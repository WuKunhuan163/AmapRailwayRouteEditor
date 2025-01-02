import { options } from './main.mjs';

export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 220, g: 195, b: 36 };
}

export function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function updateSliderBackgrounds() {
    const r = document.getElementById('redSlider').value;
    const g = document.getElementById('greenSlider').value;
    const b = document.getElementById('blueSlider').value;
    document.getElementById('redSlider').style.background = 
        `linear-gradient(to right, rgb(0,${g},${b}), rgb(255,${g},${b}))`;
    document.getElementById('greenSlider').style.background = 
        `linear-gradient(to right, rgb(${r},0,${b}), rgb(${r},255,${b}))`;
    document.getElementById('blueSlider').style.background = 
        `linear-gradient(to right, rgb(${r},${g},0), rgb(${r},${g},255))`;
}

export async function updateColorValue() {
    return new Promise(async (resolve, reject) => { 
        const r = document.getElementById('redSlider').value;
        const g = document.getElementById('greenSlider').value;
        const b = document.getElementById('blueSlider').value;
        const color = rgbToHex(Number(r), Number(g), Number(b));
        document.documentElement.style.setProperty('--slider-color', `${r}, ${g}, ${b}`);
        document.getElementById('colorPreview').style.backgroundColor = color;
        document.getElementById('redValue').textContent = r;
        document.getElementById('greenValue').textContent = g;
        document.getElementById('blueValue').textContent = b;
        updateSliderBackgrounds(); 
        if (options.currentPathIndex !== null && options.pathDatas[options.currentPathIndex] !== undefined) {
            options.pathDatas[options.currentPathIndex].color = color; 
            options.pathDatas[options.currentPathIndex].line.setOptions({
                strokeColor: color
            });
        }
        resolve();
    });
}

export async function openSinglePolylineEditor(polyline, polylineDatas) {
    options.currentPathIndex = polylineDatas.findIndex(item => item.line === polyline);
    if (colorEditor.style.display !== 'block') {
        colorEditor.style.left = '20px';
        colorEditor.style.top = '20px';
    }
    colorEditor.style.display = 'block';
    const color = polylineDatas[options.currentPathIndex].color || '#DCC324'; 
    const rgb = hexToRgb(color);
    document.getElementById('redSlider').value = rgb.r;
    document.getElementById('greenSlider').value = rgb.g;
    document.getElementById('blueSlider').value = rgb.b;
    updateColorValue();
    options.isEditing = true;
    options.polylineEditor.setTarget(polyline);
    options.polylineEditor.open();
    polyline.setOptions({
        strokeColor: color
    });
}

export async function closeSinglePolylineEditor() {
    return new Promise(async (resolve, reject) => {
        colorEditor.style.display = 'none';
        options.isEditing = false;
        options.polylineEditor.setTarget(null);
        options.polylineEditor.close();
        await updateColorValue();
        options.currentPathIndex = null; 
        resolve();
    });
} 
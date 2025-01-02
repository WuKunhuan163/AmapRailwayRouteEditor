import { initializePolylineData } from './polyline-init.mjs';
import { openSinglePolylineEditor, closeSinglePolylineEditor, updateColorValue, updateSliderBackgrounds } from './polyline-editor.mjs';
import { createColorDropper } from './color-editor.mjs';
import { addCheckpoint } from './checkpoint.mjs';
import { downloadZip, createMapJSON, createMapHTML } from './export.mjs';

const map = new AMap.Map("container", {
    center: [116.400274, 39.905812],
    zoom: 14
});
export const options = {
    pathDatas: [],
    isEditing: false,
    currentPathIndex: null,
    map: map,
    polylineEditor: new AMap.PolylineEditor(map)
}

function renderEditor(){
    if (options.currentPathIndex !== null && options.currentPathIndex >= 0) {
        options.polylineEditor.setTarget(options.pathDatas[options.currentPathIndex].line);
        options.polylineEditor.open();
        if (!options.pathDatas[options.currentPathIndex].color) {
            options.pathDatas[options.currentPathIndex].color = '#DCC324';
        }
        options.pathDatas[options.currentPathIndex].line.setOptions({
            strokeColor: options.pathDatas[options.currentPathIndex].color
        }); 
        openSinglePolylineEditor(options.pathDatas[options.currentPathIndex].line, options.pathDatas);
        options.isEditing = true;
    }
}

export function importpolylineDatas(){
    var file = document.createElement('input');
    file.type = 'file';
    file.accept = 'application/json';
    file.onchange = function(event){
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event){
            var loadPaths = JSON.parse(event.target.result);
            if (!Array.isArray(loadPaths)) {
                loadPaths = [loadPaths]; 
            }
            polylineDataNew = loadPaths.map(pathData => {
                const polyline = new AMap.Polyline({
                    path: pathData.line,
                    strokeColor: pathData.color,
                    strokeWeight: 6,
                    strokeOpacity: 0.9,
                    zIndex: 50,
                    bubble: true
                });
                options.map.add(polyline);
                return {
                    line: polyline, 
                    name: pathData.name,
                    path: pathData.path, 
                    color: pathData.color
                };
            });
            polylineDataNew.forEach(item => options.pathDatas.push(item));
            initializePolylineData(options.polylineEditor, polylineDataNew, options.pathDatas);
            renderEditor();
            options.map.setFitView();
            log.info('路线已导入');
        }
        reader.readAsText(file);
    }
    file.click();
}

async function createPolyline(){
    await closeSinglePolylineEditor(); 
    const bounds = options.map.getBounds();
    const north = bounds.northEast.kT;
    const east = bounds.northEast.KL;
    const south = bounds.southWest.kT;
    const west = bounds.southWest.KL;
    const path = [
        [west + (east - west) * 0.3, south + (north - south) * 0.5],
        [west + (east - west) * 0.7, south + (north - south) * 0.5]
    ];
    const polyline = new AMap.Polyline({
        path: path,
        strokeColor: "#DCC324",
        strokeWeight: 6,
        strokeOpacity: 0.9,
        zIndex: 50,
        bubble: true
    });
    options.map.add(polyline);
    const polylineData = {
        line: polyline, 
        name: '路线' + (options.pathDatas.length+1), 
        color: '#DCC324',
        path: path
    }
    options.pathDatas.push(polylineData);
    initializePolylineData(options.polylineEditor, [polylineData], options.pathDatas); 
    options.currentPathIndex = options.pathDatas.length - 1;
    renderEditor();
    options.map.setFitView();
}

export function deletePolyline(){
    if (options.currentPathIndex >= 0){
        if (confirm('确定删除路线？')){ 
            options.map.remove(options.pathDatas[options.currentPathIndex].line);
            options.pathDatas.splice(options.currentPathIndex, 1);
            options.currentPathIndex = options.pathDatas.length - 1;
            if (options.currentPathIndex >= 0){
                renderEditor();
                options.map.setFitView(); 
            } else {
                closeSinglePolylineEditor(); 
            }
        }
    } else {
        log.info('请先选择路线');
    }
}

async function changePolyline(next = true){
    let previousIndex = options.currentPathIndex;
    if (options.isEditing){
        await closeSinglePolylineEditor();
        options.currentPathIndex = previousIndex;
        openSinglePolylineEditor(options.pathDatas[options.currentPathIndex].line, options.pathDatas);
        options.currentPathIndex = (options.currentPathIndex + (next ? 1 : -1) + options.pathDatas.length) % options.pathDatas.length;
        renderEditor();
    } else {
        log.info('请先开始编辑');
    }
}

export async function copyPath(){
    var currentPath = options.pathDatas[options.currentPathIndex]; 
    if (currentPath){
        let pathJSON = createMapJSON('路线', [currentPath]);
        let pathHTML = createMapHTML('路线', [currentPath]);
        try {navigator.clipboard.writeText(pathHTML.content); }
        catch (err) {console.log(err); }
        const files = [
            pathJSON,
            pathHTML
        ];
        await downloadZip(files, '路线');
        log.info('路线已导出');
        closeSinglePolylineEditor(); 
    } else {
        log.info('没有选中路线');
    }
}

export async function copyMap() {
    if (options.pathDatas.length > 0) {
        let mapJSON = createMapJSON('地图', options.pathDatas);
        let mapHTML = createMapHTML('地图', options.pathDatas);
        try {navigator.clipboard.writeText(mapHTML.content); }
        catch (err) {console.log(err); }
        const files = [
            mapJSON,
            mapHTML
        ];
        await downloadZip(files, '地图');
        log.info('地图已导出');
        closeSinglePolylineEditor(); 
    } else {
        log.info('没有路线信息');
    }
}

document.addEventListener('DOMContentLoaded', updateSliderBackgrounds);
document.addEventListener('keydown', function(event) {
    let keycode = event.keyCode || event.charCode;
    if (keycode === 27) {
        closeSinglePolylineEditor();
    }
    if (event.key === 'i') {
        importpolylineDatas();
    }
    if (event.key === 'n'){
        createPolyline();
    }
    if (event.key === 'd' || keycode === 46 || keycode === 8){
        deletePolyline();
    }
    if (event.key === 'e' && !event.ctrlKey) {
        copyPath();
    }
    if (event.key === 'e' && event.ctrlKey) {
        copyMap();
    }
    if (keycode === 38){
        if (options.isEditing){
            changePolyline(true);
            event.preventDefault();
        }
    }
    if (keycode === 40){
        if (options.isEditing){
            changePolyline(false);
            event.preventDefault();
        }
    }
    if (event.key === 'a') {
        addCheckpoint();
    }
});

document.addEventListener('DOMContentLoaded', createColorDropper);
document.getElementById('redSlider').addEventListener('input', updateColorValue);
document.getElementById('greenSlider').addEventListener('input', updateColorValue);
document.getElementById('blueSlider').addEventListener('input', updateColorValue);

document.addEventListener('DOMContentLoaded', () => {
    updateSliderBackgrounds();
    createColorDropper();
    document.getElementById('createPolylineBtn').addEventListener('click', createPolyline);
    document.getElementById('deletePolylineBtn').addEventListener('click', deletePolyline);
    document.getElementById('addCheckpointBtn').addEventListener('click', addCheckpoint);
    document.getElementById('importpolylineDatasBtn').addEventListener('click', importpolylineDatas);
    document.getElementById('copyPathBtn').addEventListener('click', copyPath);
    document.getElementById('copyMapBtn').addEventListener('click', copyMap);
});

export { createPolyline };

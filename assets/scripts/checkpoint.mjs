import { options } from './main.mjs';
import { openSinglePolylineEditor, closeSinglePolylineEditor } from './polyline-editor.mjs';

export function addCheckpoint() {
    if (options.isEditing) {
        closeSinglePolylineEditor();
    }

    const isEnteringCheckpointMode = !options.map.hasOwnProperty('checkpointMode');
    options.map.checkpointMode = isEnteringCheckpointMode;

    options.pathDatas.forEach(pathData => {
        if (isEnteringCheckpointMode) {
            const originalColor = pathData.color || '#DCC324';
            pathData.originalColor = originalColor;
            
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(originalColor);
            const rgb = result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 220, g: 195, b: 36 };
            
            pathData.line.setOptions({
                strokeColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`
            });

            pathData.line.off('click');
        } else {
            pathData.line.setOptions({
                strokeColor: pathData.originalColor
            });
            delete pathData.originalColor;

            pathData.line.on('click', function(e) {
                const polyline = e.target;
                options.currentPathIndex = options.pathDatas.findIndex(item => item.line === polyline);
                if (options.polylineEditor.getTarget() !== polyline) {
                    openSinglePolylineEditor(polyline, options.pathDatas);
                } else {
                    closeSinglePolylineEditor();
                }
            });
        }
    });

    if (isEnteringCheckpointMode) {
        log.info('进入添加站点模式');
    } else {
        log.info('退出添加站点模式');
    }
} 

export function getPathLabelColor(backgroundcolor){
    return backgroundcolor.replace('#', '').slice(0, 6).match(/../g).map(x => parseInt(x, 16)).reduce((a, b) => a + b, 0) > 128 ? 'white' : 'black';
}

export function findPathNames(polylineDatas) {
    return polylineDatas.map(item => item.name);
}

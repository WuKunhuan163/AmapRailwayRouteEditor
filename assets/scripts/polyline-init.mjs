import { options } from './main.mjs';
import { openSinglePolylineEditor, closeSinglePolylineEditor } from './polyline-editor.mjs';

export function initializePolylineData(polylineEditor, targets) {
    function polylineClickHandler(e) {
        const polyline = e.target; 
        options.currentPathIndex = options.pathDatas.findIndex(item => item.line === polyline); 
        if (polylineEditor.getTarget() !== polyline){
            openSinglePolylineEditor(polyline, options.pathDatas);
        } else {
            closeSinglePolylineEditor();
        }
    }
    
    function addStartMarker(polyline){
        var starttext = new AMap.Text({
            text: '起点',
            anchor: 'middle-right', 
            offset: [-15, 0],
            draggable: true,
            cursor: 'pointer',
            style: {
                'border-width': 0,
                'box-shadow': `0 2px 6px 0 rgba(${polyline.getOptions().strokeColor.replace('#', '').slice(0, 6)}, .5)`,
                'text-align': 'center',
                'font-size': '16px',
                'background-color': polyline.getOptions().strokeColor,
                'color': getPathLabelColor(polyline.getOptions().strokeColor)
            },
            position: polyline.getPath()[0]
        });
        starttext.setMap(options.map);
    } 
    
    targets.forEach(item => {
        item.line.on('click', polylineClickHandler);
    });
} 
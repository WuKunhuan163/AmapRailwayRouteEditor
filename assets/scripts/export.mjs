export async function downloadZip(files, zipname) {
    const zip = new JSZip();
    files.forEach(file => {
        zip.file(file.name, file.content);
    }); 
    const content = await zip.generateAsync({type: "blob"});
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${zipname}.zip`;
    a.click();
    URL.revokeObjectURL(url);
}

export function createMapJSON(filename, paths) {
    var pathStrings = paths.map(path => ({
        'line': path.line.getPath().map(point => [point.getLng(), point.getLat()]),
        'color': path.color, 
        'name': path.name
    }));
    var jsonContent = JSON.stringify(pathStrings, null, 2);
    return {
        name: `${filename}.json`,
        content: jsonContent
    };
}

export function createMapHTML(filename, paths) {
    var pathStrings = paths.map(path => JSON.stringify(path.line.getPath().map(point => [point.getLng(), point.getLat()])));
    var pathColors = paths.map(path => `'${path.color}'`);
    var pathNames = paths.map(path => `'${path.name}'`);
    var htmlContent = `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no, width=device-width">
    <style>
    html,
    body,
    #container {
        width: 100%;
        height: 100%;
    }
    </style>
    <title>${filename}</title>
    <link rel="stylesheet" href="https://a.amap.com/jsapi_demos/static/demo-center/css/demo-center.css" />
    <script src="https://webapi.amap.com/maps?v=2.0&key=7eb5d7683b1644871030b447e7a1df8f&plugin=AMap.PolylineEditor"></scr` + `ipt>
    <script src="https://a.amap.com/jsapi_demos/static/demo-center/js/demoutils.js"></scr` + `ipt>
</head>
<body>
<div id="container"></div>
<script type="text/javascript">
    var map = new AMap.Map("container", {
        center: [116.400274, 39.905812],
        zoom: 14
    });
    var paths = [${pathStrings}];
    var pathColors = [${pathColors}];
    var pathNames = [${pathNames}];
    var polylineDatas = paths.map((_, index) => new AMap.Polyline({
        path: paths[index],
        strokeColor: pathColors[index],
        strokeWeight: 6,
        strokeOpacity: 0.9,
        zIndex: 50,
        bubble: true,
    }));
    map.add(polylineDatas);
    map.setFitView(); 
    if (polylineDatas.length > 0){
        log.info('路线信息已加载');
    } else {
        log.info('没有路线信息');
    }
</sc` + `ript>
</body>
</html>
    `;
    return {
        name: `${filename}.html`,
        content: htmlContent
    };
} 
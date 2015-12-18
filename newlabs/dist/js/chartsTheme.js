var myChart = [];
var domMain = $("[md='main']");

/**
 * 主题名称
 *
 * @type {string}
 */
var themeName = 'infographic';

/**
 * 主题对象
 *
 * @type {Object}
 */
var theme = null;

$('[name=theme-select]').on('change', function(){
    selectChange($(this).val());
});

function selectChange(value){
    themeName = value;
    showLoading();
    $('[name=theme-select]').val(themeName);
    if (themeName != 'default') {
        window.location.hash = value;
        require(['theme/' + themeName], function(curTheme){
            theme = curTheme;
            setTimeout(refreshAll, 500);
        })
    }
    else {
        window.location.hash = '';
        setTimeout(refreshAll, 500);
    }
}

function showLoading() {
    for (var i = 0, l = domMain.length; i < l; i++) {
        myChart[i].showLoading();
    }
}

function refreshAll() {
    for (var i = 0, l = domMain.length; i < l; i++) {
        myChart[i].hideLoading();
        myChart[i].setTheme(theme);
    }
}

function download() {
    if (themeName) {
        window.open('theme/' + themeName + '.js');
    }
}

var hash = window.location.hash.replace('#','') || 'infographic';
if ($('[name=theme-select]').val(hash).val() != hash) {
    $('[name=theme-select]').val('infographic');
    hash = 'infographic';
}

var developMode = false;
if (developMode) {
    window.esl = null;
    window.define = null;
    window.require = null;
    (function () {
        var script = document.createElement('script');
        script.async = true;

        var pathname = location.pathname;

        var pathSegs = pathname.slice(pathname.indexOf('doc')).split('/');
        var pathLevelArr = new Array(pathSegs.length - 1);
        script.src = pathLevelArr.join('../') + 'asset/js/esl/esl.js';
        if (script.readyState) {
            script.onreadystatechange = fireLoad;
        }
        else {
            script.onload = fireLoad;
        }
        (document.getElementsByTagName('head')[0] || document.body).appendChild(script);
        
        function fireLoad() {
            script.onload = script.onreadystatechange = null;
            setTimeout(loadedListener,100);
        }
        function loadedListener() {
            // for develop
            require.config({
                packages: [
                    {
                        name: 'echarts',
                        location: '../../src',
                        main: 'echarts'
                    },
                    {
                        name: 'zrender',
                        //location: 'http://ecomfe.github.io/zrender/src',
                        location: '../../../zrender/src',
                        main: 'zrender'
                    }
                ]
            });
            launchExample();
        }
    })();
}
else {
    // for echarts online home page
    require.config({
        paths: {
            echarts: './www/js'
        }
    });
    launchExample();
}

var isExampleLaunched;
function launchExample() {
    if (isExampleLaunched) {
        return;
    }

    // 按需加载
    isExampleLaunched = 1;
    // 按需加载
    require(
        [
            'echarts',
            'theme/' + hash,
            'echarts/chart/line',
            'echarts/chart/bar',
            'echarts/chart/scatter',
            'echarts/chart/k',
            'echarts/chart/pie',
            'echarts/chart/radar',
            'echarts/chart/force',
            'echarts/chart/chord',
            'echarts/chart/map',
            'echarts/chart/gauge',
            'echarts/chart/funnel'
        ],
        requireCallback
    );
}

var echarts;
function requireCallback (ec, defaultTheme) {
    echarts = ec;
    for (var i = 0, l = domMain.length; i < l; i++) {
        myChart[i] = echarts.init(domMain[i], defaultTheme);
        myChart[i].setOption(option[i]);
    }
    
    window.onresize = function(){
        for (var i = 0, l = myChart.length; i < l; i++) {
            myChart[i].resize && myChart[i].resize();
        }
    };
    
    window.saveAsImage = function(){
        var domG = document.getElementById('graphic');
        var domGWidth = domG.clientWidth;
        var domGHeight = domG.clientHeight;
    
        var zrDom = document.createElement('div');
        zrDom.style.position = 'absolute';
        zrDom.style.left = '-4000px';
        zrDom.style.width = domGWidth + 'px';
        zrDom.style.height = domGHeight + 'px';
        document.body.appendChild(zrDom);
        
        var _zr = require('zrender').init(zrDom);
        /*
        _zr.addShape({
            shape:'rectangle',
            style : {
                x : 0,
                y : 0,
                width : domGWidth * 2,
                height : domGHeight / 2,
                color: theme.backgroundColor || '#fff'
            }
        });
        */
        var domGLeft =0; domG.offsetLeft;
        var domGTop =0; domG.offsetTop;
        var ImageShape = require('zrender/shape/Image');
        for (var i = 0, l = domMain.length; i < l; i++) {
            _zr.addShape(new ImageShape({
                style : {
                    x : domMain[i].offsetParent.offsetLeft - domGLeft,
                    y : domMain[i].offsetParent.offsetTop - domGTop,
                    image : myChart[i].getDataURL()
                }
            }));
        }
        _zr.render();
        
        setTimeout(function() {
            var bgColor = theme.backgroundColor
                          && theme.backgroundColor.replace(' ','') == 'rgba(0,0,0,0)'
                          ? '#fff' : theme.backgroundColor;
            var image = _zr.toDataURL('image/png', bgColor);
            _zr.dispose();
            zrDom.parentNode.removeChild(zrDom);
            zrDom = null;
            
            var downloadDiv = document.createElement('div');
            downloadDiv.id = '__saveAsImage_download_wrap__';
            downloadDiv.style.cssText = 'position:fixed;'
                + 'z-index:99999;'
                + 'display:block;'
                + 'top:0;left:0;'
                + 'background-color:rgba(33,33,33,0.5);'
                + 'text-align:center;'
                + 'width:100%;'
                + 'height:100%;'
                + 'line-height:' 
                + document.documentElement.clientHeight + 'px;';
        
            var downloadLink = document.createElement('a');
            downloadLink.href = image
            downloadLink.setAttribute(
                'download', 'EChartsTheme-' + $('[name=theme-select]').val() + '.png'
            );
            downloadLink.innerHTML = '<img style="height:80%" src="' + image 
                + '" title="'
                + (!!(window.attachEvent && navigator.userAgent.indexOf('Opera') === -1)
                   ? '右键->图片另存为'
                   : '点击保存')
                + '"/>';
            
            downloadDiv.appendChild(downloadLink);
            document.body.appendChild(downloadDiv);
            
            downloadDiv.onclick = function () {
                var d = document.getElementById(
                    '__saveAsImage_download_wrap__'
                );
                d.onclick = null;
                d.innerHTML = '';
                document.body.removeChild(d);
                d = null;
            };
                
            downloadLink = null;
            downloadDiv = null;
        }, 100);
    }

}
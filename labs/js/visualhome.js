function jsonError(d, textStatus, error) {
    $("#error_info").html("getJSON failed; <br>status: " + textStatus + "; <br> " + error + ".");
    $("#error_data").html("responsText:<br>" + d.responseText);
    $("#example_tips").html("注意: key必须是带双引号的字符串<br> 一个典型的Json的参考格式如下:<br>");
    $("#image_tip").attr("src", "./img/json_example.png");
    $(".configpage").hide();
    $(".error_tips").show();
}


function parseError(error, imgstr) {
    $("#error_info").html("数据格式正确，但是数据有缺失; <br> " + error + ".");
    //$("#error_data").html("responsText:<br>" + d.responseText);
    $("#example_tips").html("注意: key必须是带双引号的字符串<br> 一个典型的Json的参考格式如下:<br>");
    $("#image_tip").attr("src", imgstr);
    $(".configpage").hide();
    $("#backhome").show();
    $(".error_tips").show();
}

function initPage() {
    $(function () {
            $(".error_tips").hide();
                $("#backhome").hide();
                $("#backhome").click(
                    function () {
                        $(".error_tips").hide();
                        $(".container").hide();
                        $("#backhome").hide();
                        $(".configpage").show();
                    }
                 );
                $("#brow").click(function () {
                    $("#file").click();
                    //if ($.browser.msie)
                    // showimg();
                });

                $("#file").click(function () {
                    this.value = null;
                });

                $("#file").change(function () {
                    //showimg();
                    var graphType = getGraphType(getGraphName());
                    console.log(graphType);
                    var fileArry = getFileURL(this);
                    if ("csv" == fileArry[0] && 
                        ("bar" == graphType ||
                        "line" == graphType)
                        ) {
                        var ecOption = parseCsv(fileArry[1]);
                        $("#backhome").show();
                    } else if ("json" == fileArry[0]) {
                        var ecOption = parseJson(fileArry[1]);
                       
                    }
                    
                    
                });

                $("#charttype").change(function () {
                    var x = document.getElementById("charttype");
                    $("#typeimg").attr("src", "./img/" + x.options[x.selectedIndex].value + ".png");
                });
                
            });

            require.config({
                packages: [
                    {
                        name: 'echarts',
                        location: './src',
                        main: 'echarts'
                    },
                    {
                        name: 'zrender',
                        location: './zrender/src',
                        main: 'zrender'
                    }
                ]
            });

            var url = location.search;

            if (url.indexOf("?") != -1) {
                varstr = url.substr(1)//
                //console.log(varstr);
                $(".configpage").hide();
            
                $(document).ready(function () {
                    $.getJSON(varstr, function (result) {
                        paintGraph(result);
                        $(".error_tips").hide();
                        $("#backhome").hide();
                    }).fail(
                    function (d, textStatus, error) {
                      
                        jsonError(d, textStatus, error);
                        //alert("getJSON failed, status: " + textStatus + ", error: " + error);
                    });
                });

            }
	
}


function getFileURL(node) {
    var fileURL = "";
   
    try {
        var file = null;
        if (node.files && node.files[0]) {
            file = node.files[0];
        } else if (node.files && node.files.item(0)) {
            file = node.files.item(0);
        }
	
        try {
            //Firefox7.0 
            fileURL = file.getAsDataURL();
            //alert("//Firefox7.0"+fileURL);             			
        } catch (e) {
            //Firefox8.0               			
            fileURL = window.URL.createObjectURL(file);
        }
    } catch (e) {

        if (node.files && node.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                fileURL = e.target.result;
            };
            reader.readAsDataURL(node.files[0]);
        }
    }
    var dotIdx = file.name.lastIndexOf(".");  
    var filesuffix = file.name.substr(dotIdx+1);  
    console.log(filesuffix);
    var res = new Array(filesuffix, fileURL);
    return res;
}

function checkCSVFormat(iNum){
    var gType = getGraphName();
    if(gType=="bar"){
        if(iNum < 3){
            alert("您选择的图形需要的CSV行序列小于3！");
        }
    }
    else if(gType=="line"){
        if(iNum < 2){
            alert("您选择的图形需要的CSV行序列小于2！");
        }
    }
    else{
        
    }  
}

function isNull(exp){
    //return exp == null || typeof exp == "undefined" || exp == 0;
    return exp == null;
}

function checkJSONIntegrity(option) {
    if (isNull(option.type)) {
        parseError("The field type is null", "./img/json_example.png");
        return false;
    }
    if ("bar" == option.type ||
   "line" == option.type) {
        if (isNull(option.series)) {
            parseError("The field series is null", "./img/json_example.png");
            return false;
        }
        if (0 == option.series.length) {
            parseError("The length of field series is 0", "./img/json_example.png");
            return false;
        }
        if (isNull(option.xAxis)) {
            parseError("The field xAxis is null", "./img/json_example.png");
            return false;
        }
        if (0 == option.xAxis.length) {
            parseError("The length of field xAxis is 0", "./img/json_example.png");
            return false;
        }
        if (isNull(option.xAxis[0].data)) {
            parseError("The field xAxis[0].data is null", "./img/json_example.png");
            return false;
        }
        var reflen = option.xAxis[0].data.length;
        var errorStr = null;
        $.each(option.series, function (i, item) {
            if (item.data.length != reflen) {
                errorStr = "The series." + item.name + "'s data length doesn't equal to xAxis's";
                return;
            }
        });
        if (errorStr != null) {
            parseError(errorStr, "./img/json_example.png");
            return false;
        }
    } else if ("pie" == option.type) {
        var pieImg = "./img/json_pie.png";
        if (isNull(option.series)) {
            parseError("The field series is null", pieImg);
            return false;
        }
        if (0 == option.series.length) {
            parseError("The length of field series is 0", pieImg);
            return false;
        }
        if(isNull(option.series[0].data)){
            parseError("The field series.data is null", pieImg);
            return false;
        }
        if(0 == option.series[0].data.length){
            parseError("The length of field series.data is 0", pieImg);
            return false;
        }
        var errorStr = null;
        $.each(option.series[0].data, function (i, item) {
            if (isNull(item.value)) {
                errorStr = "The series.data.value is null";
                return;
            }
            if (isNull(item.name)) {
                errorStr = "The series.data.name is null"
                return;
            }
        });
        if (errorStr != null) {
            parseError(errorStr, pieImg);
            return false;
        }
    } else if ("radar" == option.type) {
        var radarImg = "./img/json_radar.png";
        if(isNull(option.polar)){
             parseError("The field polar is null", radarImg);
             return false;
        }
        if (0 == option.polar.length) {
            parseError("The length of field polar is 0", radarImg);
            return false;
        }
        if (isNull(option.polar[0].indicator)) {
            parseError("The field polar.indicator is null", radarImg);
            return false;
        }
        var myIndicator = option.polar[0].indicator;
        if(0 == myIndicator.length){
            parseError("The length of field polar.indicator is 0", radarImg);
            return false;
        }
        var errorStr = null;
        $.each(myIndicator, function (i, item) {
            if (isNull(item.text)) {
                errorStr = "The series.data.text is null";
                return;
            }
            if (isNull(item.max)) {
                errorStr = "The series.data.max is null"
                return;
            }
        });
        if (errorStr != null) {
            parseError(errorStr, radarImg);
            return false;
        }
        var inLen = myIndicator.length;
        if (isNull(option.series)) {
            parseError("The field series is null", radarImg);
            return false;
        }
        if (0 == option.series.length) {
            parseError("The length of field series is 0", radarImg);
            return false;
        }

        if (isNull(option.series[0].data)) {
            parseError("The field series.data is null", radarImg);
            return false;
        }
        if (0 == option.series[0].data.length) {
            parseError("The length of field series.data is 0", radarImg);
            return false;
        }
        $.each(option.series[0].data, function (i, item) {
            if (isNull(item.value)) {
                errorStr = "The series.data.value is null";
                return;
            }
            if (item.value.length != inLen) {
                errorStr = "The series.data.value's length doesn't equal to polar.indicator's length";
                return;
            }
            if (isNull(item.name)) {
                errorStr = "The series.data.name is null"
                return;
            }
        });
        if (errorStr != null) {
            parseError(errorStr, radarImg);
            return false;
        }
    } else if ("funnel" == option.type) {
        var funnelImg = "./img/json_funnel.png";
        if (isNull(option.series)) {
            parseError("The field series is null", funnelImg);
            return false;
        }
        if (0 == option.series.length) {
            parseError("The length of field series is 0", funnelImg);
            return false;
        }
        if (isNull(option.series[0].data)) {
            parseError("The field series.data is null", funnelImg);
            return false;
        }
        if (0 == option.series[0].data.length) {
            parseError("The length of field series.data is 0", funnelImg);
            return false;
        }
        var errorStr = null;
        $.each(option.series[0].data, function (i, item) {
            if (isNull(item.value)) {
                errorStr = "The series.data.value is null";
                return;
            }
            if (item.value.length != inLen) {
                errorStr = "The series.data.value's length doesn't equal to polar.indicator's length";
                return;
            }
            if (isNull(item.name)) {
                errorStr = "The series.data.name is null"
                return;
            }
        });
        if (errorStr != null) {
            parseError(errorStr, funnelImg);
            return false;
        }

    } else if ("force" == option.type) {
        var forceImg = "./img/json_force.png";
        if (isNull(option.series)) {
            parseError("The field series is null", forceImg);
            return false;
        }
        if (0 == option.series.length) {
            parseError("The length of field series is 0", forceImg);
            return false;
        }
        if (isNull(option.series[0].categories)) {
            parseError("The field series.categories is null", forceImg);
            return false;
        }
        var catSize = option.series[0].categories.length;
        if (0 == catSize) {
            parseError("The length of field series.categories is 0", forceImg);
            return false;
        }
        var nameSet = new Set();
        if (isNull(option.series[0].nodes)) {
            parseError("The field series.nodes is null", forceImg);
            return false;
        }
        var errorStr = null;
        $.each(option.series[0].nodes, function (i, item) {
            if (isNull(item.category)) {
                errorStr = "The series.nodes.category is null";
                return;
            }
            if (item.category >= catSize) {
                errorStr = "The series.category isn't less than the size of categories";
                return;
            }
            if (isNull(item.name)) {
                errorStr = "The series.nodes.name is null"
                return;
            }
            nameSet.add(item.name);
            if (isNull(item.value)) {
                errorStr = "The series.nodes.value is null"
                return;
            }
        });

        if (errorStr != null) {
            parseError(errorStr, forceImg);
            return false;
        }
        if (isNull(option.series[0].links)) {
            parseError("The field series.links is null", forceImg);
            return false;
        }

        $.each(option.series[0].links, function (i, item) {
            if (isNull(item.source)) {
                errorStr = "The series.links.source is null";
                return;
            }
            if (!nameSet.has(item.source)) {
                errorStr = "The series.links.source " + item.source + " doesn't exist in nodes";
                return;
            }

            if (isNull(item.target)) {
                errorStr = "The series.links.target is null";
                return;
            }
            if (!nameSet.has(item.target)) {
                errorStr = "The series.links.target " + item.target + " doesn't exist in nodes";
                return;
            }
     
            if (isNull(item.weight)) {
                errorStr = "The series.links.weight is null"
                return;
            }
        });
        if (errorStr != null) {
            parseError(errorStr, forceImg);
            return false;
        }
        
    } else if ("map" == option.type) {
        //此处添加修改内容
    }
    else if ("scatter" == option.type) {
        //此处添加修改内容
    }
    else {
        alert("不支持的图表类型");
    }

    return true;
}

function getGraphName(){
      var x = document.getElementById("charttype");
      return x.options[x.selectedIndex].value;
}

function getGraphType(name){
	return name.replace(/\d+/, "");
}

function parseJson(fileURL) {
    console.log(fileURL);
    $.getJSON(fileURL, function (data) {
            var graphType = getGraphName();
            if (data.type != graphType) {
                alert("您选择的图形展示类型(" + graphType + ")与JSON文件格式(" + data.type + ") 不匹配！");
                 console.log(data);
                 return;
             }
             $("#backhome").show();
             paintGraph(data);
            //after方法:在每个匹配的元素之后插入内容。

    }).fail(
        function (d, textStatus, error) {
            jsonError(d, textStatus, error);
            //alert("getJSON failed, status: " + textStatus + ", error: " + error);
     });
}


function parseCsv(fileURL) {
    console.log(fileURL);
    var csv = d3.dsv(",", "text/csv;charset=gb2312");
    //var tsv = d3.dsv("	", "text/tab-separated-values;charset=gb2312");
    var option = new Object();
    csv(fileURL, function (error, rows) {
        console.log("文件数据展示如下：");
        console.log(rows);
        checkCSVFormat(rows.length);
        var timeList = new Array();
        var aline;

        aline = new Array();
        for (var i in rows[0]) {
            timeList.push(i);
            aline.push(rows[0][i]);
        }
        option.xAxis = [
                {
                    data: timeList
                }
        ]
   
        option.series = [];
        option.series.push({
            name: 1,
            data: aline
        });
        for (var i = 1; i < rows.length; i++) {
            aline = new Array();
            for (var j in rows[i]) {
                aline.push(rows[i][j]);
            }
            option.series.push({
                name: i+1,
                data: aline
            });
        }
       
        option.type =getGraphName();
        console.log(option);
        paintGraph(option);
    });
}


function paintGraph(option) {
    var isIntegrity = checkJSONIntegrity(option);
    if (!isIntegrity) return;
    $(".error_tips").hide();
    $(".configpage").hide();
    $(".container").show();
    option.type = getGraphType(option.type);
    console.log(option.type);
    option.calculable = true;
    option.series[0].type = option.type;
    //console.log(option);
   
    option.toolbox = {
        show: true,
        feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            // magicType: { show: true, type: chartType },
            restore: { show: true },
            saveAsImage: { show: true }
        }
    };
    if("bar" == option.type ||
	"line" == option.type){
        var legends = new Array();
        $.each(option.series, function (i, item) {
            item.type = option.type;
            legends.push(item.name);
        });
        option.legend = {
            data: legends
        };
        $.each(option.xAxis, function (i, item) {
            item.type = 'category';
        });
        option.tooltip = {
            trigger: 'axis'
        };
       
        option.yAxis = [
                {
                    type: 'value',
                    splitArea: { show: true }
                }
        ];
    } else if ("pie" == option.type
       ) {
        var legends = new Array();
        $.each(option.series[0].data, function (i, item) {
            item.type = option.type;
            legends.push(item.name);
        });
        option.legend = {
            data: legends
        };
        option.legend.orient = 'vertical';
        option.legend.x = 'left';
        option.tooltip = {
            "trigger": 'item',
            "formatter": "{a} <br/>{b} : {c} ({d}%)"
        };
        //option.title.x = 'center';
       // console.log(option.title.text);
        //option.series[0].name = option.title.text;
        
        option.series[0].center = ['50%', '60%'];
        option.series[0].radius = '55%';
    } else if ("radar" == option.type) {
        option.tooltip = {
            trigger: 'axis'
        };
        var legends = new Array();
        option.series[0].type = option.type;
        $.each(option.series[0].data, function (i, item) {
            item.type = option.type;
            legends.push(item.name);
        });
        option.legend = {
            orient: 'vertical',
            x: 'right',
            y: 'bottom',
            data: legends
        };
    } else if ("funnel" == option.type) {
        option.tooltip = {
            "trigger": "item",
            "formatter": "{a} <br/>{b} : {c}%"
        }
        var legends = new Array();
        $.each(option.series[0].data, function (i, item) {
            item.type = option.type;
            legends.push(item.name);
        });
        option.legend = {
            data: legends
        };
        option.series[0].type = option.type;
        option.series[0].width = "50%";
    }
    else if ("force" == option.type) {
        var legends = new Array();
        $.each(option.series[0].categories, function (i, item) {
            item.type = option.type;
            if (i != 0) {
                legends.push(item.name);
            }
        });
        option.legend = {
            "data": legends
        }
        option.tooltip = {
            trigger: 'item',
            formatter: '{a} : {b}'
        }
        option.series[0].itemStyle = {
            "normal": {
                "label": {
                    "show": true,
                    "textStyle": {
                        "color": "#333"
                    }
                },
                "nodeStyle": {
                    "brushType": "both",
                    "borderColor": "rgba(255,215,0,0.4)",
                    "borderWidth": 1
                },
                "linkStyle": {
                    "type": "curve"
                }
            },
            "emphasis": {
                "label": {
                    "show": false
                },
                "nodeStyle": {
                },
                "linkStyle": {}
            }
        }
        option.series[0].useWorker = false;
        option.series[0].minRadius = 15;
        option.series[0].maxRadius = 25;
        option.series[0].gravity = 1.1;
        option.series[0].scaling = 1.1;
        option.series[0].roam = "move";
        option.series[0].ribbonType = false;       
    }
    else if ("map" == option.type) {
        //此处添加修改内容
    }
    else if ("scatter" == option.type) {
        //此处添加修改内容
    } 
        
    console.log(option);
  

    require(
        [
            'echarts',
             'echarts/chart/'+ option.type
        ],
        function (ec) {
            var myChart = ec.init(document.getElementById('main'));
            myChart.setOption(option);
        }
    )
}

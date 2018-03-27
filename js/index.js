(function ($) {
    var GETCLASSES = "http://imoocnote.calfnote.com/inter/getClasses.php";
    var GETCLASSCHAPTER = "http://imoocnote.calfnote.com/inter/getClassChapter.php";
    var courseNum = 0;
    var courseTitle = [];
    var searchData = [];
    var flag = false;

    $.ajaxSetup({
        error: function () {
            alert('调用接口失败')
            return
        }
    })
    //获得所有课程标题信息
    function init(index){
        var list = [];
        $.getJSON(GETCLASSES,{curPage:index},function(data){
            
            var data = data.data;
            data.forEach(function(item,index){
                var summary = {};
                summary.id = item.id
                summary.hasnote = item.hasnote
                summary.image = item.image
                summary.title = item.title
                summary.subtitle = item.subtitle
                summary.timespan = item.timespan
                list.push(summary)
            })
            
        })
        return list;
    }
    //搜索课程
    function search(){
        searchData = [];
        var str = document.getElementById("course").value.toLowerCase();
       
        courseTitle.forEach(function(item,index){
            item.forEach(function(el,i){
                var title =String(el.title).toLowerCase();
                if(str && title.indexOf(str)!=-1){
                    searchData.push(el)
                }
            })
        })
        
        
        if(searchData.length>0){
            flag = true;
            var list = formatSearchData(searchData);
            console.log(list)
            renderTemplate("#class-template",list[0].data, "#classes");

            renderTemplate("#pag-template", formatPag(list[0]), "#pag");
        }
    }
    //整理搜索出来的数据
    function formatSearchData(data){
        var arr = [];
        var total = Math.ceil(data.length/6);
        var list = []
        data.forEach(function(item,index){
            if(index%6==0){
                list = []
            }
            list.push(item)
           
            arr[Math.floor(index/6)] = {
                curPage:Math.ceil(index/6),
                data:list,
                totalCount:total
                
            }

        })

        return arr
    }


    $.getJSON(GETCLASSES, { curPage: 1 }, function (data) {
        console.log(data)
        courseNum = data.totalCount;

        renderTemplate("#class-template", data.data, "#classes");
        // pages
        renderTemplate("#pag-template", formatPag(data), "#pag");

        for (var i =1;i<=courseNum;i++) {
            courseTitle.push(init(i))		
        }
        // console.log(courseTitle)

    })

    $('#pag').on('click','.clickable',function(){
        $this = $(this);
        console.log($this)
        refreshClasses($(this).data('id'))
    })
    $('#btn').on('click',function(){
        search()
    })
	document.getElementById('course').addEventListener('keyup', function(e) {
		if(e.keyCode == 13) {
			search()
		};
	}, false);
	
    function renderTemplate(templateSelector, data, htmlSelector) {
      
        var t = $(templateSelector).html();
        var f = Handlebars.compile(t);
        var h = f(data);
        $(htmlSelector).html(h);
    }

    function refreshClasses(curpage) {
        if(flag){
            // console.log(formatSearchData(searchData));
            var go = parseInt(curpage) -1;
            var list = formatSearchData(searchData)[go];
            console.log(go)
            console.log(list)
            renderTemplate("#class-template",list.data, "#classes");

            renderTemplate("#pag-template", formatPag(list), "#pag");
            return

        }
        $.getJSON(GETCLASSES, {
            curPage: curpage
        }, function (data) {
            // classes
            
            renderTemplate("#class-template", data.data, "#classes");
            // pages
            renderTemplate("#pag-template", formatPag(data), "#pag");

        });
    }
    $('.overlap').on('click',function(){
        showNote(false)
    })
    $('#classes').on('click','li',function(){
        $this = $(this);
        var cid = $this.data('id')
        $.getJSON(GETCLASSCHAPTER, { cid: cid}, function (data) {
            console.log(data)
            renderTemplate("#chapter-template", data, "#chapterdiv");
            showNote(true)
        });

       
    })
    function showNote(show) {
        if (show) {
            $(".overlap").css("display", "block");
            $(".notedetail").css("display", "block");
        } else {
            $(".overlap").css("display","none");
            $(".notedetail").css("display","none");
        }
    }

    Handlebars.registerHelper("equal", function (v1, v2, options) {
        if (v1 == v2) {
            return options.fn(this)
        } else {
            return options.inverse(this)
        }
    })
    Handlebars.registerHelper("long", function (v, options) {
        if (v.indexOf('小时') != -1) {
            return options.fn(this)
        } else {
            return options.inverse(this)
        }
    })
    
    Handlebars.registerHelper("addone", function (v, options) {
        return v+1
    })



    // 构建分页逻辑所需要的数据
    // registerHelper的使用原则：不要在里面拼接大段的HTML代码。
    // 类似本利中的分页组件，最好是构造一份适合Handlebars的数据，然后传给它，来生成html。
    function formatPag(pagData) {
        var arr = [];
        var total = parseInt(pagData.totalCount);
        var cur = parseInt(pagData.curPage);

        // 处理首页的逻辑：<<
        var toLeft = {};
        toLeft.index = 1; // index代表点击按钮的时候可以跳转到的页面
        toLeft.text = '&laquo;'; // text代表button的文本

        if (cur != 1) {
            toLeft.clickable = true;
        }
        arr.push(toLeft);

        // 处理到上一页的逻辑
        var pre = {};
        pre.index = cur - 1;
        pre.text = '&lsaquo;';

        if (cur != 1) {
            pre.clickable = true;
        }

        arr.push(pre);

        // 处理到cur页前的逻辑
        if (cur <= 5) {
            for (var i = 1; i < cur; i++) {
                var pag = {};
                pag.text = i;
                pag.index = i;
                pag.clickable = true;
                arr.push(pag);
            }
        } else {
            // 如果cur>5，那么cur前的页要显示为...
            var pag = {};
            pag.text = 1;
            pag.index = 1;
            pag.clickable = true;
            arr.push(pag);
            var pag = {};
            pag.text = '...';
            arr.push(pag);
            // 当前页前面2个页数显示出来
            for (var i = cur - 2; i < cur; i++) {
                var pag = {};
                pag.text = i;
                pag.index = i;
                pag.clickable = true;
                arr.push(pag);
            }
        }

        // 处理当前页
        var pag = {};
        pag.text = cur;
        pag.index = cur;
        pag.cur = true;
        arr.push(pag);

        // 处理cur页后的逻辑
        if (cur >= total - 4) {
            for (var i = cur + 1; i <= total; i++) {
                var pag = {};
                pag.text = i;
                pag.index = i;
                pag.clickable = true;
                arr.push(pag);
            }
        } else {
            // 如果cur < total - 4, 那么cur后的页面显示为...
            // 显示以当前页后面的2个页数
            for (var i = cur + 1; i <= cur + 2; i++) {
                var pag = {};
                pag.text = i;
                pag.index = i;
                pag.clickable = true;
                arr.push(pag);
            }

            var pag = {};
            pag.text = '...';
            arr.push(pag);
            var pag = {};
            pag.text = total;
            pag.index = total;
            pag.clickable = true;
            arr.push(pag);
        }

        // 处理到下一页的逻辑
        var next = {};
        next.index = cur + 1;
        next.text = '&rsaquo;';

        if (cur != total) {
            next.clickable = true;
        }

        arr.push(next);

        // 处理到尾页的逻辑
        var toRight = {};
        toRight.index = total; // index代表点击按钮的时候可以跳转到的页面
        toRight.text = '&raquo;'; // text代表button的文本

        if (cur != total) {
            toRight.clickable = true;
        }
        arr.push(toRight);
       
        return arr;
    }
})(jQuery)
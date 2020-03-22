$(function () {
    /*-----页面pannel内容区高度自适应 -----*/
    $(window).resize(function () {
        setCenterHeight();
    });
    setCenterHeight();

    function setCenterHeight() {
        var height = $(window).height();
        var centerHight = height - 120;
        $(".chapter-sidebar").height(centerHight).css("overflow", "auto");
        $("#content_list").height(centerHight).css("overflow", "auto");
    }

    // 左侧菜单
    onLoad();
    BindEvent();
    var conentHtml = "[TOC]\n### 您好!\n## 欢迎使用云笔记";
    // 初始化富文本
    var editor = editormd("editor", {
        markdown: conentHtml, // Also, you can dynamic set Markdown text
        htmlDecode: true,  // Enable / disable HTML tag encode.
        htmlDecode: "style,script,iframe",  // Note: If enabled, you should filter some dangerous HTML tags for website security.
        path: "bower_components/editor.md/lib/"  // Autoload modules mode, codemirror, marked... dependents libs path
    });

    //页面加载
    function onLoad() {
        $.ajax({
            type: 'get',
            url: "/admin/category/menus",
            asyc: false,
            data: {},
            error: function (error) {
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    text: '网络异常，请刷新页面',
                    timeout: '5000'
                }).show();
            },
            success: function (result) {
                if (result.code != 0) {
                    new Noty({
                        type: 'error',
                        layout: 'topCenter',
                        text: result.msg || '网络异常，请刷新页面',
                        timeout: '2000'
                    }).show();
                } else {
                    //渲染树
                    $('#left-tree').treeview({
                        data: result.data,
                        levels: 1,
                        onNodeSelected: function (event, data) {
                            $("#currentCategory").val(data._id);
                            if (data.code == 'myFolder') {
                                getCenterPositionContent(data, 0);
                            } else if (data.code == 'newDoc') {
                                getCenterPositionContent(data, 1);
                            } else if (data.code == 'share') {
                                getCenterPositionContent(data, 2);
                            } else if (data.code == 'tags') {
                                getCenterPositionContent(data, 3);
                            } else if (data.code == 'star') {
                                getCenterPositionContent(data, 4);
                            } else if (data.code == 'trash') {
                                getCenterPositionContent(data, 5);
                            } else {
                                getCenterPositionContent(data, 0);
                            }
                            $("#categoryTest").html('<i class="fa fa-arrows" aria-hidden="true"></i>&nbsp;' + data.name);
                        },
                        //是否显示多选
                        showCheckbox: false
                    });
                }
            }
        });
    };

    //事件注册
    function BindEvent() {
        //保存-新增
        $("#Save").click(function () {
            $('#addOperation-dialog').modal('hide')
            //静态添加节点
            var parentNode = $('#left-tree').treeview('getSelected');
            if (parentNode && parentNode.length > 0) {
                var obj = {
                    icon: 'fa fa-folder-o',
                    name: $('#categoryName').val(),
                    pid: parentNode[0]._id,
                    level: parentNode[0].level + 1,
                };
                addCategory(obj, function (node) {
                    $('#left-tree').treeview('addNode', [node, parentNode], 0);
                });
            } else {
                new Noty({
                    type: 'warning',
                    layout: 'topCenter',
                    text: '新增失败，请重试',
                    timeout: '5000'
                }).show();
            }
        });
    }

    //保存-编辑
    $('#Edit').click(function () {
        var node = $('#left-tree').treeview('getSelected');
        var newNode = {
            text: $('#categoryName').val()
        };
        $('#left-tree').treeview('updateNode', [node, newNode]);
    });
    //显示-添加
    $("#btnAdd").click(function () {
        var node = $('#left-tree').treeview('getSelected');
        if (node.length == 0) {
            new Noty({
                type: 'warning',
                layout: 'topCenter',
                text: '请选择分类',
                timeout: '5000'
            }).show();
            return;
        }
        if (!isMyFolder(node[0])) {
            $(".myFolder").trigger("click");
        }
        $('#categoryName').val('');
        $('#addOperation-dialog').modal('show');
    });
    //显示-编辑
    $("#btnEdit").click(function () {
        var node = $('#left-tree').treeview('getSelected');
        $('#editShow').show();

    });
    //删除
    $("#btnDel").click(function () {
        var node = $('#left-tree').treeview('getSelected');
        if (node.length == 0) {
            new Noty({
                type: 'warning',
                layout: 'topCenter',
                text: '请选择分类',
                timeout: '5000'
            }).show();
            return;
        }
        del();

        function del() {
            $('#left-tree').treeview('removeNode', [node, {silent: true}]);
        }

    });
    // 搜索
    $("#search").click(function () {
        var keywords = $("#keywords").val();
        if (!keywords) {
            new Noty({
                type: 'info',
                layout: 'topCenter',
                text: '请输入关键字',
                timeout: '15000'
            }).show();
            $("#keywords").focus();
        }
        getCenterPositionContent(keywords, 6);
    });
    // Control+C 保存
    $(document).keydown(function (e) {
        var key = undefined;
        var possible = [e.key, e.keyIdentifier, e.keyCode, e.which];
        while (key === undefined && possible.length > 0) {
            key = possible.pop();
        }
        if (key && (key == '115' || key == '83') && (e.ctrlKey || e.metaKey) && !(e.altKey)) {
            e.preventDefault();
            var title = $("#titleInput").val();
            var contentId = $("#contentId").val();
            var value = editor.getMarkdown();       // 获取 Markdown 源码
            //testEditor.getHTML();           // 获取 Textarea 保存的 HTML 源码
            //testEditor.getPreviewedHTML();  // 获取预览窗口里的 HTML，在开启 watch 且没有开启 saveHTMLToTextarea 时使用
            addContent(contentId, title, value);
            return false;
        }
        return true;
    });
    // 点击保存按钮保存
    $("#saveContent").click(function () {
        var title = $("#titleInput").val();
        var contentId = $("#contentId").val();
        var value = editor.getMarkdown();       // 获取 Markdown 源码
        //testEditor.getHTML();           // 获取 Textarea 保存的 HTML 源码
        //testEditor.getPreviewedHTML();  // 获取预览窗口里的 HTML，在开启 watch 且没有开启 saveHTMLToTextarea 时使用
        addContent(contentId, title, value);
    });
    // 标题输入后自动显示到重要区域列表
    $("#titleInput").on('input', function (e) {
        $(".selectedFocus #title").html("<i class='fa fa-file-o'></i>&nbsp;" + $(this).val());
    });
    // 右键事件
    $.contextMenu({
        selector: '#left-tree li.context',
        callback: function (key, options, bbb, aaa) {
            var m = "clicked: " + key + " on " + $(this).text();
            var data = JSON.parse($(this).attr("data"));
            if (key == 'add') {
                addContentInit(data);
            } else {
                window.console && console.log(data) || alert(data);
            }
        },
        items: {
            "add": {name: "新建文档", icon: "edit"},
            "moveTo": {name: "移动到", icon: "copy"},
            "delete": {name: "删除", icon: "delete"},
            "rename": {name: "重命名", icon: "edit"},
            "sep1": "---------",
            "quit": {
                name: "Quit", icon: function () {
                    return 'context-menu-icon context-menu-icon-quit';
                }
            }
        }
    });

    function isMyFolder(data) {
        if (data.code != "myFolder" && (data.nodeId + "").indexOf("0.2.") != 0) {
            return false;
        }
        return true
    }

    function addContentInit(rdata, type) {
        if (!isMyFolder(rdata)) {
            $(".myFolder").trigger("click");
            $(".myFolder span").eq(0).trigger("click");
        }
        addContent("", "新建文档", conentHtml, function (data) {
            getCenterPositionContent(rdata, 0);
        });
    }

    $("#noteAdd").click(function () {
        addDoc();
    });

    function addDoc() {
        var parentNode = $('#left-tree').treeview('getSelected');
        if (parentNode && parentNode.length > 0) {
            addContentInit(parentNode[0]);
        } else {
            new Noty({
                type: 'warning',
                layout: 'topCenter',
                text: '请选择一个分类',
                timeout: '5000'
            }).show();
        }
    }

    // 获取中间列表
    function getCenterPositionContent(data, type) {
        $.ajax({
            type: 'get',
            url: "/admin/content?pid=" + (data._id || "0") + "&type=" + type,
            asyc: false,
            error: function (error) {
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    text: '网络异常，请刷新页面',
                    timeout: '5000'
                }).show();
            },
            success: function (result) {
                if (result.code != 0) {
                    new Noty({
                        type: 'error',
                        layout: 'topCenter',
                        text: result.msg || '网络异常，请刷新页面',
                        timeout: '2000'
                    }).show();
                } else {
                    if (typeof data == "string") {
                        $(".myFolder").trigger("click");
                    } else {
                        var rdata = result.data;
                        renderItem(data, rdata);
                    }
                    if (typeof data == 'object' && data.code == 'myFolder') {
                        $(".myFolder span").eq(0).trigger("click");
                    }
                }
            }
        });

    }

    getCenterPositionContent("5e74d421bd68c4301208cf5b", 0);

    function renderItem(cdata, data) {
        var html = "";
        var category = data.category;
        var content = data.content;
        for (var i = 0; i < category.length; i++) {
            var obj = category[i];
            html += "<li class='list-li' data='" + JSON.stringify({
                _id: obj._id,
                type: 1,
                name: obj.name
            }) + "' title='" + obj.title + "'><div id='title'> <i class='fa fa-folder'></i>&nbsp;" + obj.name + "</div><div id='date-size'>" + moment(obj.createdAt).format("YYYY-MM-DD HH:mm:ss") + "</div></li>";
        }
        for (var i = 0; i < content.length; i++) {
            var obj = content[i];
            html += "<li class='list-li " + (i == 0 ? "selected selectedFocus" : "") + "' data='" + JSON.stringify({
                _id: obj._id,
                type: 2,
                title: obj.title
            }) + "' title='" + obj.title + "'><div id='title'> <i class='fa fa-file-o'></i>&nbsp;" + obj.title + "</div><div id='date-size'><span>" + moment(obj.createdAt).format("YYYY-MM-DD HH:mm:ss") + "</span></div></li>";
            if (i == 0) {
                renderContent(obj._id);
            }
        }
        if (content.length == 0 && category.length == 0) {
            html = '<li class="addDocLi"><p>暂无文档</p>';
            if (isMyFolder(cdata)) {
                html += '<button type="button" id="noteAddDoc" class="btn btn-default"><i class="glyphicon glyphicon-plus"></i>&nbsp;新建文档</button>';
            }
            html += '</li>';
        }
        if (content.length == 0) {
            //addContentInit();
            /*initForm({
                title: "新建文档",
                _id:"",
                content: conentHtml
            });*/
        }
        $("#content_list").html(html);
        $("ul#content_list li.list-li").click(function () {
            $(this).addClass("selected").siblings().removeClass("selected");
            $(this).addClass("selectedFocus").siblings().removeClass("selectedFocus");
            var data = JSON.parse($(this).attr('data'));
            if (data.type == 1) {
                $("#currentCategory").val(data._id);
                getCenterPositionContent(data._id, 0);
            } else {
                renderContent(data._id);
            }
        });
        $("ul#content_list li.addDocLi button").click(function () {
            addDoc();
        });
    }

    // 初始化内容到富文本
    function renderContent(id) {
        $.ajax({
            type: 'get',
            url: "/admin/content/detail?id=" + id,
            asyc: false,
            error: function (error) {
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    text: '网络异常，请刷新页面',
                    timeout: '5000'
                }).show();
            },
            success: function (result) {
                if (result.code != 0) {
                    new Noty({
                        type: 'error',
                        layout: 'topCenter',
                        text: result.msg || '网络异常，请刷新页面',
                        timeout: '2000'
                    }).show();
                } else {
                    var data = result.data;
                    if (data) {
                        initForm(data);
                    }
                }
            }
        });
    }

    function initForm(data) {
        $("#titleInput").val(data.title);
        $("#contentId").val(data._id);
        editor = editormd("editor", {
            markdown: data.content, // Also, you can dynamic set Markdown text
            htmlDecode: true,  // Enable / disable HTML tag encode.
            htmlDecode: "style,script,iframe",  // Note: If enabled, you should filter some dangerous HTML tags for website security.
            path: "bower_components/editor.md/lib/"  // Autoload modules mode, codemirror, marked... dependents libs path
        });
    }

    // 保存文本
    function addContent(contentId, title, value, cb) {
        var isSave = false;
        var parentNode = $('#left-tree').treeview('getSelected');
        if (parentNode && parentNode.length > 0) {
            if (isMyFolder(parentNode[0])) {
                isSave = true;
            }
        }
        if(isSave) {
            $.ajax({
                type: 'POST',
                url: "/admin/content",
                asyc: false,
                data: {categoryId: $("#currentCategory").val(), title: title, content: value, id: contentId},
                error: function (error) {
                    new Noty({
                        type: 'error',
                        layout: 'topCenter',
                        text: '网络异常，请刷新页面',
                        timeout: '5000'
                    }).show();
                },
                success: function (result) {
                    if (result.code != 0) {
                        new Noty({
                            type: 'error',
                            layout: 'topCenter',
                            text: result.msg || '网络异常，请刷新页面',
                            timeout: '2000'
                        }).show();
                    } else {
                        new Noty({
                            type: 'success',
                            layout: 'topCenter',
                            text: '保存成功',
                            timeout: '2000'
                        }).show();
                        cb && cb(result.data);
                    }
                }
            });
        }
    }

    // 保存分类
    function addCategory(data, cb) {
        $.ajax({
            type: 'POST',
            url: "/admin/category/add",
            asyc: false,
            data: data,
            error: function (error) {
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    text: '网络异常，请刷新页面',
                    timeout: '5000'
                }).show();
            },
            success: function (result) {
                if (result.code != 0) {
                    new Noty({
                        type: 'error',
                        layout: 'topCenter',
                        text: result.msg || '网络异常，请刷新页面',
                        timeout: '2000'
                    }).show();
                } else {
                    new Noty({
                        type: 'success',
                        layout: 'topCenter',
                        text: '保存成功',
                        timeout: '2000'
                    }).show();
                    cb && cb(result.data);
                }
            }
        });
    }

    function rename(el) {
        alert(el.text())
    }

    function moveTo(el) {
        alert(el.text())
    }
});

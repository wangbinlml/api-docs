$(function () {
    // 左侧菜单
    //$.sidebarMenu($('.sidebar-menu'));
    var conentHtml = "[TOC]\n### 您好!\n## 欢迎使用云笔记";
    // 初始化富文本
    var editor = editormd("editor", {
        markdown: conentHtml, // Also, you can dynamic set Markdown text
        htmlDecode: true,  // Enable / disable HTML tag encode.
        htmlDecode: "style,script,iframe",  // Note: If enabled, you should filter some dangerous HTML tags for website security.
        path: "bower_components/editor.md/lib/"  // Autoload modules mode, codemirror, marked... dependents libs path
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
        $(".selectedFocus #title .file-name").text($(this).val());
    });

    // 左侧菜单点击
    $(".sidebar-menu a").click(function () {
        var data = JSON.parse($(this).attr('data'));
        $("#currentCategory").val(data._id);
        $(this).parent("li").addClass("active").siblings().removeClass("active");
        if (data.name == '我的文件夹') {
            getCenterPositionContent(data._id, 0);
        } else if (data.name == '最新文档') {
            getCenterPositionContent(data._id, 1);
        } else if (data.name == '与我分享') {
            getCenterPositionContent(data._id, 2);
        } else if (data.name == '标签') {
            getCenterPositionContent(data._id, 3);
        } else if (data.name == '加星文件') {
            getCenterPositionContent(data._id, 4);
        } else if (data.name == '回收站') {
            getCenterPositionContent(data._id, 5);
        } else {
            getCenterPositionContent(data._id, 0);
        }
    });

    // 新建文件夹按钮
    $("#folder").click(function () {
        var li = "<ul class=\"treeview-menu menu-open\" style=\"display: block;\"><li class=\"treeview active menu-open\"><a href=\"#\"><i class=\"fa fa-circle-o text-aqua\"></i><span>新建文件夹</span></a></li></ul>"
        $(".sidebar-menu li.context").append(li);
    });
    // 右键事件
    $.contextMenu({
        selector: '.sidebar-menu li.context a',
        callback: function (key, options, bbb, aaa) {
            var m = "clicked: " + key + " on " + $(this).text();
            var data = $(this).attr("data");
            window.console && console.log(data) || alert(data);
        },
        items: {
            "add": {name: "新建文档", icon: "edit"},
            "rename": {name: "重命名", icon: "cut"},
            "moveTo": {name: "移动到", icon: "copy"},
            "delete": {name: "删除", icon: "delete"},
            "sep1": "---------",
            "quit": {
                name: "Quit", icon: function () {
                    return 'context-menu-icon context-menu-icon-quit';
                }
            }
        }
    });

    var recursion2 = function (data, id) {
        var list = [];
        for (var index in data) {
            var v = data[index];
            if (v['pid'] == id) {
                v['children'] = recursion2(data, v['_id']);
                list.push(v);
            }
        }
        return list;
    };

    //menu_list为json数据
    //parent为要组合成html的容器
    function sliderMenu(menu_list, parent) {
        for (var menu in menu_list) {
            var obj = {
                _id: menu_list[menu]._id,
                name:menu_list[menu].name,
                isDefault: menu_list[menu].isDefault,
                pid:menu_list[menu].pid,
                level:menu_list[menu].level
            };
            //如果有子节点，则遍历该子节点
            if (menu_list[menu].children.length > 0) {
                //创建一个子节点li
                var li = $('<li class="treeview"></li>');
                var a =  $('<a href="javascript:void(0);" data='+JSON.stringify(obj)+'></a>').append('<i class="glyphicon glyphicon-folder-open"></i>').append("<span>&nbsp;"+menu_list[menu].name+"</span>").append('<i class="fa fa-angle-left pull-right"></i>');
                //将li的文本设置好，并马上添加一个空白的ul子节点，并且将这个li添加到父亲节点中
                $(li).append(a).append('<ul class="treeview-menu"></ul>').appendTo(parent);
                //将空白的ul作为下一个递归遍历的父亲节点传入
                sliderMenu(menu_list[menu].children, $(li).children().eq(1));
            }
            //如果该节点没有子节点，则直接将该节点li以及文本创建好直接添加到父亲节点中
            else {
                var a =  $('<a href="javascript:void(0);" data='+JSON.stringify(obj)+'></a>').append('<i class="glyphicon glyphicon-folder-open"></i>').append("<span>&nbsp;"+menu_list[menu].name+"</span>")
                $("<li></li>").append(a).appendTo(parent);
            }
        }
    };


    // 获取文档文件夹下子分类
    $.ajax({
        type: 'get',
        url: "/category/getCategory",
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
                var data = result.data;
                if (data.length > 0) {
                    var showlist = $('<ul class="treeview-menu"></ul>');
                    var menus = recursion2(data, '5e74d421bd68c4301208cf5b');
                    sliderMenu(menus, showlist);
                    $(".myfolder").append(showlist);
                }
            }
        }
    });

    // 获取中间列表
    function getCenterPositionContent(pid, type) {
        $.ajax({
            type: 'get',
            url: "/content",
            asyc: false,
            data: {pid: pid, type: type},
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
                    renderItem(data);
                }
            }
        });
    }

    getCenterPositionContent("5e74d421bd68c4301208cf5b", 0);

    function renderItem(data) {
        var html = "";
        var category = data.category;
        var content = data.content;
        for (var i = 0; i < category.length; i++) {
            var obj = category[i];
            html += "<li class='list-li' data='" + JSON.stringify({
                _id: obj._id,
                type: 1,
                name: obj.name
            }) + "'><div id='title'> <i class='glyphicon glyphicon-folder-open'></i><div class='file-name'>" + obj.name + "</div></div><div id='date-size'>" + obj.createdAt + "</div></li>";
        }
        for (var i = 0; i < content.length; i++) {
            var obj = content[i];
            html += "<li class='list-li " + (i == 0 ? "selected selectedFocus" : "") + "' data='" + JSON.stringify({
                _id: obj._id,
                type: 2,
                title: obj.title
            }) + "'><div id='title'> <i class='glyphicon glyphicon-file'></i><div class='file-name'>" + obj.title + "</div></div><div id='date-size'><span>" + obj.createdAt + "</span></div></li>";
            if (i == 0) {
                renderContent(obj._id);
            }
        }
        if (content.length == 0) {
            initForm({
                title: "新建文档",
                _id:"",
                content: conentHtml
            });
        }
        $("#content_list").html(html);
        $("ul#content_list li").click(function () {
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
    }

    // 初始化内容到富文本
    function renderContent(id) {
        $.ajax({
            type: 'get',
            url: "/content/detail?id=" + id,
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
    function addContent(contentId, title, value) {
        $.ajax({
            type: 'POST',
            url: "/content",
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

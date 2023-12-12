// ==UserScript==
// @name         leetcode-helper
// @namespace    https://github.com/tonngw
// @version      1.1.2
// @description  LeetCode 题解助手 | 复制 LeetCode 题目描述 | 生成当前题目题解模板
// @author       tonngw
// @run-at       document-end
// @match        https://leetcode.cn/problems/*
// @icon         https://leetcode.cn/favicon.ico
// @require      https://cdn.staticfile.org/jquery/3.4.1/jquery.min.js
// @require      https://unpkg.com/sweetalert/dist/sweetalert.min.js
// @require      https://unpkg.com/turndown/dist/turndown.js
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @license 	 MIT
// ==/UserScript==

(function () {
    'use strict';

    // 初始化 html to markdown 转换工具
    var turndownService = new TurndownService();

    const window = unsafeWindow;
    const description = '.description__2b0C';
    var content = '';

    // 注入菜单
    GM_registerMenuCommand("复制 LeetCode 题目为 Markdown，并存入剪切板", copy);
    GM_registerMenuCommand("生成当前题目的题解模板，并存入剪切板", generateSolution);

    // 按钮样式
    var buttonStyle = {
        width: "50px",
        height: "25px",
        fontSize: "14px",
        color: "orange",
        align: "center",
        marginLeft: "10px",
    };
    
    // 添加复制按钮
    var copyBtn = document.createElement("button"); //创建一个 input 对象（提示框按钮）
    copyBtn.id = "copyBtn";
    copyBtn.innerHTML = '<i class="fa fa-copy"></i> 复制';
    Object.assign(copyBtn.style, buttonStyle);
    copyBtn.title = "复制题目为 Markdown 格式";

    // 添加生成题解按钮
	var generateSolutionBtn = document.createElement("button"); // 创建一个input对象（提示框按钮）
	generateSolutionBtn.id = "generateSolutionBtn";
	generateSolutionBtn.innerHTML = '<i class="fa fa-edit"></i> 生成';
    Object.assign(generateSolutionBtn.style, buttonStyle);
    generateSolutionBtn.title = "生成 Markdown 格式题解";

    window.onload = function () {
        setTimeout(function () {
            // 筛选出符合格式的href: '/problems/.*/'，使用两个selector串联，获取到的第一个为 /problems/，跳过
            var x = $("a[href^='/problems/'][href$='/']")[1]
            
            // 等价于以下代码
            // var elements =$("a");
            // var pattern = /^\/problems\/.*\/$/; // 根据 href 属性筛选元素，匹配以 /problems/ 开头，并以 / 结尾的正则表达式
            // // 遍历所有 <a> 元素，找到匹配的元素
            // var matchedElements = Array.from(elements).filter(element => {
            //     var hrefValue = element.getAttribute('href');
            //     return hrefValue && pattern.test(hrefValue);
            // });              
            // var x = matchedElements[0]; // 第0个为该题目的title元素

            console.log("I was invoked...");
            x.parentNode.appendChild(copyBtn);
            x.parentNode.appendChild(generateSolutionBtn);
        }, 3000);
    };
    
    // 为复制按钮绑定点击功能
	copyBtn.onclick = function (e) {
		e.preventDefault();
		copy();
	};

    // 为复制按钮绑定点击功能
	generateSolutionBtn.onclick = function (e) {
		e.preventDefault();
		generateSolution();
	};

    // 监听键盘按键，为功能绑定快捷键
	unsafeWindow.addEventListener("keydown", (evt) => {
		// console.log('evt', evt);
		if (evt.altKey) {
            // Alt + T 复制题目
			if (evt.keyCode == 84) {
                copy();
			}
			// Alt + C 生成当前题目题解模板
			if (evt.keyCode == 67) {
                generateSolution();
			}
		}
	});

    // 题目复制功能实现
	function copy() {
		copyImpl();
        GM_setClipboard(content);
		swal({
			icon: "success",
			title: "复制成功",
		});
	}

    function copyImpl() {
        // 题目描述 内容 Dom
        // var contentDom = $('div[data-track-load="description_content"]')[0].outerHTML; # 加上详细内容也可以
        // 新版leetcode随机生成id，无法通过id筛选，但是有‘data-track-load’属性
        var contentDom = $('div[data-track-load]')[0].outerHTML;
        console.log(contentDom);
        content = handleHtml(contentDom);
    }

    // 生成题解功能实现
	function generateSolution() {
		generateSolutionImpl();
		swal({
			icon: "success",
			title: "生成成功",
		});
	}

	function generateSolutionImpl() {
		var solutionTemplate = "";
		var problemDescConst = "### 题目描述\n";
		copyImpl();
		var problemDesc = content;
		var splitLine = "\n\n---\n";
		var algorithmConst = "### 算法\n"
		var specificAlgorithmConst = "#### (暴力枚举)  $O(n^2)$";
		var solution = "\nwrite here...\n\n"
		var timeComplexityConst = "#### 时间复杂度";
		var timeComplexity = "\nwrite here...\n\n"
		var spaceComplexityConst = "#### 空间复杂度";
		var spaceComplexity = "\nwrite here...\n\n";
		var codeConst = "#### C++ 代码\n";
		var code = "```\n" + "my code...\n" + "```";
		solutionTemplate = problemDescConst + problemDesc + splitLine + algorithmConst + specificAlgorithmConst +
			solution + timeComplexityConst + timeComplexity + spaceComplexityConst + spaceComplexity + codeConst + code;
		GM_setClipboard(solutionTemplate);
	}

    /**
     * html 转 markdown
     * @param html
     * @returns {void|*}
     */
    function handleHtml(html) {
        turndownService.addRule('strikethrough', {
            filter: ['pre'],
            replacement: function (content, node) {
                // console.log(node.innerText);
                return '\n```\n' + node.innerText.trim() + '\n```\n\n';
            }
        });
        turndownService.addRule('strikethrough', {
            filter: ['strong'],
            replacement: function (content) {
                return '**' + content + "**"
            }
        });
        turndownService.addRule('strikethrough', {
            filter: ['code'],
            replacement: function (content) {
                return '$' + content + "$"
            }
        });
        turndownService.addRule('strikethrough', {
            filter: ['sup'],
            replacement: function (content) {
                return '^{' + content + "}"
            }
        });

        var markdown = turndownService.turndown(html);
        return markdown
    }
})();
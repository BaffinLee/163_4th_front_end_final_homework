/**
 * 用GET方式的Ajax向一个url请求数据
 * 并通过回调函数处理数据
 * @param  {String}   url      请求的url
 * @param  {Function} callback 回调函数
 */
function getDataFromUrl (url, callback) {
	var xmlhttp = false,
		data = {},
		changeFun = function () {
			
			// XDomainRequest 与 XMLHttpRequest 的表示状态的对象不一样
			var isXDR = window.XDomainRequest ? true : false;
			if (isXDR || (xmlhttp.readyState === 4 && xmlhttp.status === 200)) {
				
				// 用eval函数转化json等文本数据为js数据类型
				data = eval("(" + xmlhttp.responseText + ")");
				callback(data);
			}
		};
	
	// IE 里用 XDomainRequest 来跨域
	// XMLHttpRequest 支持跨域
	if (window.XDomainRequest) {
		xmlhttp = new XDomainRequest();
	} else if (window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	}

	// 这个项目只用到GET
	xmlhttp.open("GET", url, true);

	// XDomainRequest 与 XMLHttpRequest 的表示状态的对象不一样
	if (xmlhttp.onreadystatechange) {
		xmlhttp.onreadystatechange = changeFun;
	} else {
		xmlhttp.onload = changeFun;
	}
	xmlhttp.send(null);
}

/**
 * 绑定事件处理函数
 * @param {Object} domObject DOM对象
 * @param {String} event     事件
 * @param {Function} listener  处理函数
 */
function addEvent (domObject, event, listener) {
	
	// 标准浏览器使用addEventListener
	if (domObject.addEventListener) {
		domObject.addEventListener(event, listener, false);
	
	// IE 里用 attachEvent
	} else if (domObject.attachEvent) {
		domObject.attachEvent('on' + event, listener);
	
	// 防御性代码，DOM 0级接口，确保事件会执行，一般用不到
	} else {
		domObject['on' + event] = callback;
	}
}

/**
 * DOM完成之后执行回调函数
 * @param  {Function} callback 回调函数
 */
function onReady (callback) {
	
	// readyState 为 "complete" 表示已完成
	if (document.readyState === "complete") {
		callback();

	//有addEventListener的浏览器支持DOMContentLoaded事件
	} else if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', callback, false);
	
	// IE 里监听onreadystatechange事件
	} else if (document.attachEvent) {
		document.attachEvent('onreadystatechange', function () {
			if (document.readyState === 'complete') {
				callback();
			}
		});
	
	// 防御型代码，确保回调函数一定会执行，一般用不上
	} else {
		window.onload = callback;
	}
}

/**
 * cookie操作对象
 * @type {Object}
 */
var CookieUtil = {
	
	// 读取名为name的Cookie
	get: function (name) {
		var cookieName = encodeURIComponent(name) + '=',
			cookieStart = document.cookie.indexOf(cookieName),
			cookieValue = null;
		if (cookieStart > -1) {
			var cookieEnd = document.cookie.indexOf(';', cookieStart);
			if (cookieEnd === -1) {
				cookieEnd = document.cookie.length;
			}
			cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
		}
		return cookieValue;
	},
	
	// 设置cookie
	set: function (name, value, expires, path, domain, secure) {
		var cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value);
		if (expires instanceof Date) {
			cookieText += "; expires=" + expires.toGMTString();
		}
		if (path) {
			cookieText += "; path=" + path;
		}
		if (domain) {
			cookieText += "; domain=" + domain;
		}
		if (secure) {
			cookieText += "; secure";
		}
		document.cookie = cookieText;
	},
	
	//清除某一cookie
	unset: function (name, path, domain, secure) {
		this.set(name, "", new Date(0), path, domain, secure);
	}
}

/**
 * 显示或者隐藏顶部提示
 * @param  {String} onload 传入此参数则代表页面刚载入，检查是否需要显示提示
 *                         否则是处理点击事件
 */
function hideNotice (onload) {
	if (!CookieUtil.get('hideNotice')) {
		if (onload === 'onload') {
			document.getElementById('notice').style.display = "block";
		} else {
			document.getElementById('notice').style.display = "none";
			CookieUtil.set('hideNotice', 1);
		}
	}
}

/**
 * 关注我们 处理函数
 */
function followUs () {

	// 已经登录，调用接口关注
	if (CookieUtil.get('loginSuc') == 1) {
		getDataFromUrl('https://study.163.com/webDev/attention.htm', followUs);

	// 未登录弹出登录弹窗
	} else {
		showPopup('login');
	}
}

/**
 * 检查是否关注成功
 * @param  {Number} result 关注结果，为1表示关注成功
 */
function followUsCheck (result) {
	if (result == 1) {
		CookieUtil.set('followSuc', 1);
	}
	if (CookieUtil.get('followSuc') == 1) {
		document.getElementById('followBtn').style.display = 'none';
		document.getElementById('cancelFollowBtn').style.display = 'block';
	}
}

/**
 * 显示弹窗
 * @param  {String} which 'login'为登录弹窗 'video'为视频弹窗 默认关闭弹窗
 */
function showPopup (which) {
	var loginPopup = document.getElementById('loginPopup'),
		videoPopup = document.getElementById('videoPopup'),
		video = document.getElementById('introduceVideo'),
		popup = document.getElementById('popup'),
		popupCon = popup.getElementsByTagName('div')[0];
	switch (which) {
		case 'login':
			// 暂停视频
			if (video.pause) {
				video.pause();
			}
			videoPopup.style.display = 'none';
			popupCon.setAttribute('id', 'p-showLogin');
			loginPopup.style.display = 'block';
			popup.style.display = 'block';
			break;
		case 'video':
			loginPopup.style.display = 'none';
			popupCon.setAttribute('id', 'p-showVideo');
			videoPopup.style.display = 'block';
			popup.style.display = 'block';
			break;
		default:
			// 暂停视频
			if (video.pause) {
				video.pause();
			}
			popup.style.display = 'none';
			videoPopup.style.display = 'none';
			loginPopup.style.display = 'none';
	}
}

/**
 * 登录框提交接管函数
 * @param  {Event} event 提交事件
 */
function toLogin (event) {
	var userName = document.getElementById('userName'),
		password = document.getElementById('password'),
		err = 0;
	
	// 清空两边空格
	var userNameText = userName.value.replace(/\s+/g, ''),
		passwordText = password.value.replace(/\s+/g, '');

	// 阻止提交事件，兼容IE
	event.preventDefault ? event.preventDefault() : (event.returnValue = false);

	// 用户名为空，提示错误
	if (userNameText == "") {
		userName.setAttribute('class', 'error');
		err += 1;
	} else {
		userName.removeAttribute('class');
	}

	// 密码为空，提示错误
	if (passwordText == "") {
		password.setAttribute('class', 'error');
		err += 1;
	} else {
		password.removeAttribute('class');
	}

	// 有错误就退出
	if (err > 0) {
		return false;
	}

	// 没错误就 Ajax 登录
	getDataFromUrl("https://study.163.com//webDev/login.htm?userName=" + md5(userNameText) + "&password=" + md5(passwordText), loginCallback);
}

/**
 * 登录回调函数
 * @param  {Number} result 登录结果，为 1 表示成功
 */
function loginCallback (result) {
	
	// 登录成功，设置cookie，调用关注接口
	if (result == 1) {
		showPopup();
		CookieUtil.set('loginSuc', 1);
		followUsCheck(1);
	
	// 登录失败，提醒用户
	} else {
		document.getElementById('userName').setAttribute('class', 'error');
		document.getElementById('password').setAttribute('class', 'error');
	}
}

/**
 * 元素淡出效果
 * @param  {Element}   element  dom元素
 * @param  {Function} callback 回调函数
 */
function fadeIn (element, callback) {
	// 透明度
    var opacity = 0;
    // 定时器
    var timer = setInterval(function() { 
                    setOpacity(element, opacity);
                    // 10次，每次透明度减小0.1
                    opacity += 0.1;
                    // 从1到0，小于0就清除定时器
                    if(opacity > 1){
                        clearInterval(timer);
                        callback();
                    }
                }, 50); // 50毫秒一次，半秒10次，人眼已经无法察觉
    //设置透明度
    function setOpacity(element,value){
        // 兼容IE
        element.style.filter = 'alpha(opacity=' + 100 * value + ')';
        element.style.opacity = value;
    }
}

/**
 * 轮播图片
 * @param  {Event} event 小圆点的点击事件
 */
function switchBanner (event) {
	var banner = document.getElementById('banner'),
		img = banner.getElementsByTagName('img'),
		bannerImgDot = banner.getElementsByTagName('i');
		i = j = 0;

	// 找到当前显示的图片序号
	for (; i < img.length; i++) {
		if(img[i].getAttribute('class') == 'on') {
			img[i].removeAttribute('class');
			break;
		}
	}

	// 确定下一张要显示的图片
	j = (i === img.length - 1) ? 0 : i + 1;
	
	// 点击的是小圆点，就取小圆点的参数为下一个图片序号
	if (event) {
		j = event.target ? parseInt(event.target.getAttribute('data')) : parseInt(event.srcElement.getAttribute('data'));
	}
	
	// 显示下一张图片
	img[j].style.display = 'block';
	
	// 切换对应的小圆点
	bannerImgDot[i].setAttribute('class', 'icon-circle');
	bannerImgDot[j].setAttribute('class', 'icon-circle on');
	
	// 淡入
	fadeIn(img[j], function () {
		img[j].setAttribute('class', 'on');
		img[j].removeAttribute('style');
	});
}

/**
 * 轮播图片定时器
 * @param  {Event} event 鼠标进入出去的事件
 */
function switchBannerInTimer (event) {
	var banner = document.getElementById('banner'),
		img = banner.getElementsByTagName('img');
	
	// 没有定时器就初始化
	if (!window.bannerTimer) {
		window.bannerTimer = setInterval(function () {
			switchBanner();
		}, 5000);
	}
	
	// 已经设置了定时器，并且鼠标移出，清除定时器
	if (event && event.type === 'mouseover') {
		clearInterval(window.bannerTimer);
		window.bannerTimer = null;
	}
}

/**
 * 获取课程列表
 * @param  {String} type   哪个课程列表
 * @param  {Number} pageNo 页码
 */
function loadCourseList (type, pageNo) {
	var psize = document.documentElement.offsetWidth > 1205 ? 20 : 15,
		typeNo = 30;
	
	// 设计课程
	if (type === "design") {
		typeNo = 10;
	
	// 语言课程
	} else if (type === "language") {
		typeNo = 20;
	}
	
	if (typeNo === 10 || typeNo === 30) {
		getDataFromUrl('https://study.163.com/webDev/couresByCategory.htm?pageNo=' + pageNo + '&psize=' + psize + '&type=10', function (result) {
			updateCourseList(result, 'design');
		});
		window.pageNow["design"] = pageNo;
	} 
	
	if (typeNo === 20 || typeNo === 30) {
		getDataFromUrl('https://study.163.com/webDev/couresByCategory.htm?pageNo=' + pageNo + '&psize=' + psize + '&type=20', function (result) {updateCourseList(result, 'language');
		});
		window.pageNow["language"] = pageNo;
	}
}

/**
 * 更新课程列表
 * @param  {Object} result Ajax的结果
 * @param  {String} type   哪种课程
 */
function updateCourseList (result, type) {
	
	// 获取传入参数所对应的课程列表和分页
	var currentCourseList = document.getElementById(type + 'CourseList'),
		currentPaging = document.getElementById(type + 'Paging');
	
	// 按照Ajax的结果更新
	currentCourseList.innerHTML = buildCourseList(result.list);
	currentPaging.innerHTML = buildPaging(result.pagination);
}

/**
 * 构建课程列表html
 * @param  {Object} list 课程列表对象
 * @return {String}      返回html字符串
 */
function buildCourseList (list) {
	var html = "";
	for (var i = 0; i < list.length; i++) {
		html +=  '<li><div><a href="http://study.163.com/course/introduction/'
				+list[i].id
			 	+'.htm"><img src="'
		 		+list[i].middlePhotoUrl
		 		+'" alt="'
		 		+list[i].name
		 		+'"></a><div class="c-l-l-left"><a href="http://study.163.com/course/introduction/'
				+list[i].id
			 	+'.htm" title="'
				+list[i].name
			 	+'"><h4 title="'
			 	+list[i].name
			 	+'">'
		 		+list[i].name
		 		+'</h4></a><div class="num"><i class="icon-user"></i>'
		 		+list[i].learnerCount
		 		+'人在学</div><div class="name"><span>发布者：'
		 		+list[i].provider
		 		+'</span></div><div class="type"><span>分类：未分类</span></div></div><div class="c-l-l-bom"><a href="http://study.163.com/course/introduction/'
				+list[i].id
			 	+'.htm"><h4 title="'
			 	+list[i].name
			 	+'">'
		 		+list[i].name
		 		+'</h4></a><span>'
		 		+list[i].provider
		 		+'</span><span class="num"><i class="icon-user"></i>'
		 		+list[i].learnerCount
		 		+'</span><span class="price">¥ '
		 		+parseFloat(list[i].price)
		 		+'</span></div><p class="c-l-l-desc">'
		 		+list[i].description
		 		+'</p></div></li>';
	}
	return html;
}

/**
 * 构建分页
 * @param  {Object} pagination Ajax返回的分页信息对象
 * @return {String}            返回html字符串
 */
function buildPaging (pagination) {
	var pageNow = pagination.pageIndex,
		pageStart = parseInt(pagination.pageIndex / 8) * 8 + 1
		html = '<li class="prev">&lt;</li>';
	for (var i = 0; i < 8; i++) {
		if (pageNow === i + pageStart ) {
			html +=  '<li class="on">'
				 	+(i + pageStart)
				 	+'</li>';
		} else {
			html += '<li>'
				 	+(i + pageStart)
				 	+'</li>';
		}
	}
	html += '<li class="next">&gt;</li>';
	return html;
}

/**
 * 切换课程列表Tab
 * @param  {String} which 要显示的课程列表
 */
function switchCourseTab (which) {
	var designCourseList = document.getElementById('designCourseList'),
		languageCourseList = document.getElementById('languageCourseList'),
		designTab = document.getElementById('designTab'),
		languageTab = document.getElementById('languageTab'),
		designPaging = document.getElementById('designPaging'),
		languagePaging = document.getElementById('languagePaging')
		;
	
	// 显示设计课程列表
	if (which === "design") {
		designTab.setAttribute('class', 'on');
		languageTab.removeAttribute('class');
		languageCourseList.style.display = 'none';
		designCourseList.style.display = 'block';
		languagePaging.style.display = 'none';
		designPaging.style.display = 'block';
		window.tabNow = "design";
	
	// 显示语言课程列表
	} else {
		languageTab.setAttribute('class', 'on');
		designTab.removeAttribute('class');
		designCourseList.style.display = 'none';
		languageCourseList.style.display = 'block';
		designPaging.style.display = 'none';
		languagePaging.style.display = 'block';
		window.tabNow = "language";
	}
}

/**
 * 获取最热课程列表
 */
function loadHotCourseList () {
	getDataFromUrl('https://study.163.com/webDev/hotcouresByCategory.htm', updateHotCourseList);
}

/**
 * 构建最热课程列表html
 * @param  {Object} result Ajax获得的课程列表信息对象
 * @return {String}        返回html字符串
 */
function bulidHotCourseList (result) {
	var html = "";
	for (var i = 0; i < result.length; i++) {
		html +=  '<li><a href="http://study.163.com/course/introduction/'
				+result[i].id
			 	+'.htm" title="'
			 	+result[i].name
			 	+'"><img src="'
			 	+result[i].smallPhotoUrl
			 	+'" alt="'
			 	+result[i].name
			 	+'"><h4>'
			 	+result[i].name
			 	+'</h4></a><span><i class="icon-user"></i>'
			 	+result[i].learnerCount
			 	+'</span></li>';
	}
	return html;
}

/**
 * 更新最热课程列表
 * @param  {Object} result Ajax获取的课程列表信息对象
 */
function updateHotCourseList (result) {
	var hotCourseList = document.getElementById('hotCourseList'),
		list = hotCourseList.getElementsByTagName('li');
	
	// Ajax回调传入数据
	if (result) {
		hotCourseList.innerHTML = bulidHotCourseList(result);
	}
	
	// 设置定时器，滚动最热课程列表
	if (!window.hotCourseListTimer) {
		window.hotCourseListTimer = setInterval(function () {
			list[0].style.opacity = 0;
			list[0].style.filter = 'alpha(opacity = 0)';
			hotCourseList.className += ' trans';
			hotCourseList.style.marginTop = '-72px';
			setTimeout(function () {
				hotCourseList.className = 'c-r-h-list';
				list[0].removeAttribute('style');
				hotCourseList.removeAttribute('style');
				hotCourseList.appendChild(list[0]);
			}, 1000);
		}, 5000);
	}
}

/**
 * 切换页码
 * @param  {Event} event 点击事件
 */
function switchPage (event) {
	var pageNo = null,
		// 点击事件的元素，兼容IE
		eventTarget = event ? (event.target ? event.target : event.srcElement) : null;
	if (eventTarget && eventTarget.tagName.toLowerCase() === "li") {
		
		// 点击 上一个 按钮
		if (eventTarget.innerHTML.match(/&lt;/)) {
			pageNo = window.pageNow[window.tabNow] - 1;
			if (pageNo < 1) {
				return false;
			}
		
		// 点击 下一个 按钮
		} else if (eventTarget.innerHTML.match(/&gt;/)) {
			pageNo = window.pageNow[window.tabNow] + 1;
		
		// 点击 页码
		} else {
			pageNo = parseInt(eventTarget.innerHTML.match(/\d+/)[0]);
		}
		
		// 按照点击项目获取对应数据
		loadCourseList(window.tabNow, pageNo);
	}
}

/**
 * 压面载入后处理入口
 */
onReady(function () {
	
	var hideNoticeBtn = document.getElementById('hideNoticeBtn'),
		followBtn = document.getElementById('followBtn'),
		closeBtn = document.getElementById('closeBtn'),
		designTab = document.getElementById('designTab'),
		languageTab = document.getElementById('languageTab'),
		loginForm = document.getElementById('loginForm'),
		showVideoBtn = document.getElementById('showVideoBtn'),
		banner = document.getElementById('banner'),
		bannerImgDot = document.getElementById('bannerImgDot'),
		paging = document.getElementById('paging');
	
	// 当前展示的课程列表和分页
	window.tabNow = "design";
	window.pageNow = {'design': 1, 'language': 1};
	
	// 检查是否需要显示顶部提示
	hideNotice('onload');
	
	// 检查是否关注我们
	followUsCheck();
	
	// 设置轮播图
	switchBannerInTimer();
	
	// 拉取两种课程数据
	loadCourseList('both', 1);
	
	// 拉取最热课程数据
	loadHotCourseList();
	
	// 绑定各种事件
	addEvent(hideNoticeBtn, 'click', hideNotice); // 隐藏顶部提示
	addEvent(followBtn, 'click', followUs); // 关注我们
	addEvent(closeBtn, 'click', showPopup); // 弹出层关闭按钮
	addEvent(paging, 'click', switchPage); // 切换页码
	addEvent(loginForm, 'submit', toLogin); // 登陆提交
	addEvent(banner, 'mouseover', switchBannerInTimer); // 鼠标进入轮播图
	addEvent(banner, 'mouseout', switchBannerInTimer); // 鼠标出去轮播图
	addEvent(bannerImgDot, 'click', switchBanner); // 轮播图小圆点
	addEvent(showVideoBtn, 'click', function () { // 显示介绍视频
		showPopup('video');
	});
	addEvent(designTab, 'click', function () { // 切换到设计课程Tab
		switchCourseTab('design');
	});
	addEvent(languageTab, 'click', function () { // 切换到语言课程Tab
		switchCourseTab('language');
	});
});

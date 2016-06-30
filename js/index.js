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
			var isXDR = window.XDomainRequest ? true : false;
			if (isXDR || (xmlhttp.readyState === 4 && xmlhttp.status === 200)) {
				data = eval("(" + xmlhttp.responseText + ")");
				callback(data);
			}
		};
	if (window.XDomainRequest) {
		xmlhttp = new XDomainRequest();
	} else if (window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	}
	xmlhttp.open("GET", url, true);
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
	if (domObject.addEventListener) {
		domObject.addEventListener(event, listener, false);
	} else if (domObject.attachEvent) {
		domObject.attachEvent(event, listener);
	} else {
		domObject['on' + event] = callback;
	}
}

/**
 * DOM完成之后执行回调函数
 * @param  {Function} callback 回调函数
 */
function onReady (callback) {
	if (document.readyState === "complete") {
		callback();
	} else if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', callback, false);
	} else if (document.attachEvent) {
		document.attachEvent('onreadystatechange', function () {
			if (document.readyState === 'complete') {
				callback();
			}
		});
	} else {
		window.onload = callback;
	}
}

/**
 * cookie操作对象
 * @type {Object}
 */
var CookieUtil = {
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
	unset: function (name, path, domain, secure) {
		this.set(name, "", new Date(0), path, domain, secure);
	}
}

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

function followUs () {
	if (CookieUtil.get('loginSuc') == 1) {
		getDataFromUrl('http://study.163.com/webDev/attention.htm', followUs);
	} else {
		showPopup('login');
	}
}

function followUsCheck (result) {
	if (result == 1) {
		CookieUtil.set('followSuc', 1);
	}
	if (CookieUtil.get('followSuc') == 1) {
		document.getElementById('followBtn').style.display = 'none';
		document.getElementById('cancelFollowBtn').style.display = 'block';
	}
}

function showPopup (which) {
	var loginPopup = document.getElementById('loginPopup'),
		videoPopup = document.getElementById('videoPopup'),
		video = document.getElementById('introduceVideo'),
		popup = document.getElementById('popup'),
		popupCon = document.getElementsByClassName('p-content')[0];
	switch (which) {
		case 'login':
			video.pause();
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
			video.pause();
			popup.style.display = 'none';
			videoPopup.style.display = 'none';
			loginPopup.style.display = 'none';
	}
}

function toLogin (event) {
	var userName = document.getElementById('userName'),
		password = document.getElementById('password'),
		err = 0;
	var userNameText = userName.value.replace(/\s+/g, ''),
		passwordText = password.value.replace(/\s+/g, '');

	event.preventDefault();

	if (userNameText == "") {
		userName.setAttribute('class', 'error');
		err += 1;
	} else {
		userName.removeAttribute('class');
	}

	if (passwordText == "") {
		password.setAttribute('class', 'error');
		err += 1;
	} else {
		password.removeAttribute('class');
	}

	if (err > 0) {
		return false;
	}

	getDataFromUrl("http://study.163.com//webDev/login.htm?userName=" + md5(userNameText) + "&password=" + md5(passwordText), loginCallback);
}

function loginCallback (result) {
	if (result == 1) {
		showPopup();
		CookieUtil.set('loginSuc', 1);
		followUsCheck(1);
	} else {
		document.getElementById('userName').setAttribute('class', 'error');
		document.getElementById('password').setAttribute('class', 'error');
	}
}

function loadCourseList (type, pageNo) {
	var psize = document.documentElement.offsetWidth > 1205 ? 20 : 15,
		typeNo = 30;
	if (type === "design") {
		typeNo = 10;
	} else if (type === "language") {
		typeNo = 20;
	}
	if (typeNo === 10 || typeNo === 30) {
		getDataFromUrl('http://study.163.com/webDev/couresByCategory.htm?pageNo=' + pageNo + '&psize=' + psize + '&type=10', function (result) {updateCourseList(result, 'design');
		});
		window.pageNow["design"] = pageNo;
	} 
	if (typeNo === 20 || typeNo === 30) {
		getDataFromUrl('http://study.163.com/webDev/couresByCategory.htm?pageNo=' + pageNo + '&psize=' + psize + '&type=20', function (result) {updateCourseList(result, 'language');
		});
		window.pageNow["language"] = pageNo;
	}
}

function updateCourseList (result, type) {
	var currentCourseList = document.getElementById(type + 'CourseList'),
		currentPaging = document.getElementById(type + 'Paging');
	currentCourseList.innerHTML = buildCourseList(result.list);
	currentPaging.innerHTML = buildPaging(result.pagination);
}

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
			 	+'.htm"><h4>'
		 		+list[i].name
		 		+'</h4></a><div class="num"><i class="icon-user"></i>'
		 		+list[i].learnerCount
		 		+'人在学</div><div class="name"><span>发布者：'
		 		+list[i].provider
		 		+'</span></div><div class="type"><span>分类：未分类</span></div></div><div class="c-l-l-bom"><a href="http://study.163.com/course/introduction/'
				+list[i].id
			 	+'.htm"><h4>'
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

function switchCourseTab (which) {
	var designCourseList = document.getElementById('designCourseList'),
		languageCourseList = document.getElementById('languageCourseList'),
		designTab = document.getElementById('designTab'),
		languageTab = document.getElementById('languageTab'),
		designPaging = document.getElementById('designPaging'),
		languagePaging = document.getElementById('languagePaging')
		;
	if (which === "design") {
		designTab.setAttribute('class', 'on');
		languageTab.removeAttribute('class');
		languageCourseList.style.display = 'none';
		designCourseList.style.display = 'block';
		languagePaging.style.display = 'none';
		designPaging.style.display = 'block';
		window.tabNow = "design";
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

function loadHotCourseList () {
	getDataFromUrl('http://study.163.com/webDev/hotcouresByCategory.htm', updateHotCourseList);
}

function updateHotCourseList (result) {
	var hotCourseList = document.getElementById('hotCourseList'),
		html = "";
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
	hotCourseList.innerHTML = html;
}

function switchPage (event) {
	var pageNo = null;
	if (event && event.target && event.target.tagName.toLowerCase() === "li") {
		if (event.target.innerHTML.match(/&lt;/)) {
			pageNo = window.pageNow[window.tabNow] - 1;
			if (pageNo < 1) {
				return false;
			}
		} else if (event.target.innerHTML.match(/&gt;/)) {
			pageNo = window.pageNow[window.tabNow] + 1;
		} else {
			pageNo = parseInt(event.target.innerHTML.match(/\d+/)[0]);
		}
		loadCourseList(window.tabNow, pageNo);
		/*for (var i = 0; i < event.target.parentNode.childNodes.length; i++) {
			if (event.target.parentNode.childNodes[i].nodeType === 1) {
				if (event.target.parentNode.childNodes[i].getAttribute('class') === 'on') {
					event.target.parentNode.childNodes[i].removeAttribute('class');
				}
				if (event.target.parentNode.childNodes[i].innerHTML == pageNo) {
					event.target.parentNode.childNodes[i].setAttribute('class', 'on');
				}
			}
		}*/
	}
}

onReady(function () {
	var hideNoticeBtn = document.getElementById('hideNoticeBtn'),
		followBtn = document.getElementById('followBtn'),
		closeBtn = document.getElementById('closeBtn'),
		designTab = document.getElementById('designTab'),
		languageTab = document.getElementById('languageTab'),
		loginForm = document.getElementById('loginForm'),
		showVideoBtn = document.getElementById('showVideoBtn'),
		paging = document.getElementById('paging');
	window.tabNow = "design";
	window.pageNow = {'design': 1, 'language': 1};
	hideNotice('onload');
	followUsCheck();
	loadCourseList('both', 1);
	loadHotCourseList();
	addEvent(hideNoticeBtn, 'click', hideNotice);
	addEvent(followBtn, 'click', followUs);
	addEvent(closeBtn, 'click', showPopup);
	addEvent(paging, 'click', switchPage);
	addEvent(loginForm, 'submit', toLogin);
	addEvent(showVideoBtn, 'click', function () {
		showPopup('video');
	});
	addEvent(designTab, 'click', function () {
		switchCourseTab('design');
	});
	addEvent(languageTab, 'click', function () {
		switchCourseTab('language');
	});
});

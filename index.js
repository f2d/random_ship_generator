
//* Config *-------------------------------------------------------------------

var	URL_API = window.URL || window.webkitURL
,	BLOB_PREFIX = 'blob:'
,	DATA_PREFIX = 'data:'
,	TYPE_TP = 'text/plain'
,	TOS = ['object', 'string']
,	SPLIT_SEC = 60
,	checkbox = {
		'auto_redraw': true
	,	'auto_save': false
	,	'draw_frames': false
	,	'transprent_bg': false
	,	'ver_symmetry': false
	}
,	param = {
		'pixel_size': 4
	,	'black_ratio': 50
	,	'colors_per_sprite': 3
	,	'sprite_border': 1
	,	'sprite_width': 7
	,	'sprite_height': 7
	// ,	'sprites_per_row': 30
	// ,	'sprites_per_col': 30
	,	'canvas_max_width': 1080
	,	'canvas_max_height': 1080
	}
,	MIN_0  = ['black_ratio']	//* <- else 1
,	MAX_99 = ['black_ratio']	//* <- else none
,	regSpace = /\s+/g
,	regClassHid = getClassReg('hid')
,	regTrimPun = getTrimReg(':,.')
	;

//* Common utility functions *-------------------------------------------------

function getTrimReg(c) {return new RegExp('^['+c+']+|['+c+']+$', 'gi');}
function getClassReg(c) {return new RegExp('(^|\\s)('+c+')($|\\s)', 'i');}

function id(i) {return document.getElementById(i);}
function cre(e,p,b) {
	e = document.createElement(e);
	if (b) p.insertBefore(e, b); else
	if (p) p.appendChild(e);
	return e;
}

function del(e) {
	var p;
	if (!e) return;
	if (e.map) e.map(del); else
	if (p = e.parentNode) p.removeChild(e);
	return p;
}

function delAllChildNodes(p) {
	var e;
	while (e = p.lastChild) del(e);
	return p;
}

function toggleHide(e,d) {e.style.display = (e.style.display != (d?d:d='')?d:'none');}
function toggleHideNext(e) {
	toggleClass(h = e.parentNode.nextElementSibling, 'hid');
	toggleClass(e, 'open', regClassHid.test(h.className)?-1:1);
}

function toggleClass(e,c,keep) {
var	j = orz(keep)
,	k = 'className'
,	old = e[k] || e.getAttribute(k) || ''
,	a = old.split(regSpace)
,	i = a.indexOf(c)
	;
	if (i < 0) {
		if (j >= 0) a.push(c);
	} else {
		if (j <= 0) a.splice(i, 1);
	}
	if (a.length) {
		j = a.join(' ');
		if (old != j) e[k] = j;
	} else if (old) e[k] = '', e.removeAttribute(k);
}

function orz(n,d) {return (isNaN(d) ? parseInt(n||0) : parseFloat(n||d))||0;}
function orzFloat(n) {return orz(n, 4);}
function leftPad(n, len, pad) {
	n = '' + orz(n);
	len = orz(len) || 2;
	pad = '' + (pad || 0);
	while (n.length < len) n = pad+n;
	return n;
}

function getFormattedTimezoneOffset(t) {
	return (
		(t = (t && t.getTimezoneOffset ? t : new Date()).getTimezoneOffset())
		? (t < 0?(t = -t, '+'):'-') + leftPad(Math.floor(t/SPLIT_SEC)) + ':' + leftPad(t%SPLIT_SEC)
		: 'Z'
	);
}

function getFormattedHMS(msec) {
var	t = orz(msec)
,	a = [0, 0, Math.floor(Math.abs(t) / 1000)]
,	i = a.length
	;
	while (--i) {
		if (a[i] >= SPLIT_SEC) {
			a[i - 1] = Math.floor(a[i] / SPLIT_SEC);
			a[i] %= SPLIT_SEC;
		}
		if (a[i] < 10) a[i] = '0' + a[i];
	}
	return (t < 0?'-':'') + a.join(':');
}

function getLogTime() {return getFormattedTime(0,0,1);}
function getFormattedTime(sec, for_filename, for_log, plain, only_ymd) {
var	t = sec;
	if (TOS.indexOf(typeof t) > -1) {
	var	text = '' + t
	,	n = orz(sec)
		;
		if (typeof t === 'string' && Date.parse) {
			t = Date.parse(t.replace(regHMS, '$1:$2:$3'));
		} else {
			t = n * 1000;
		}
		if (!t && text) return text;
	}
var	d = (t ? new Date(t+(t > 0 ? 0 : new Date())) : new Date())
,	a = (
		only_ymd
		? ['FullYear', 'Month', 'Date']
		: ['FullYear', 'Month', 'Date', 'Hours', 'Minutes', 'Seconds']
	).map(function(v,i) {
		v = d['get'+v]();
		if (i == 1) ++v;
		return leftPad(v);
	})
,	YMD = a.slice(0,3).join('-')
,	HIS = a.slice(3).join(for_filename?'-':':') + (for_log?'.'+((+d) % 1000):'')
	;
	return (
		for_log || for_filename || plain
		? YMD + (for_filename?'_':' ') + HIS
		: (
			'<time datetime="'
		+	YMD + 'T'
		+	HIS
		+	getFormattedTimezoneOffset(t)
		+	'" data-t="' + Math.floor(d/1000)
		+	'">'
		+		YMD
		+		' <small>'
		+			HIS
		+		'</small>'
		+	'</time>'
		)
	);
}

function logTime(k, v) {
var	t = getLogTime();
	if (typeof k !== 'undefined') t += ' - ' + k;
	if (typeof v !== 'undefined') {
		if (v.join) v = v.join('\n');
		if (v.indexOf && v.indexOf('\n') >= 0) {
			if (
				(v[0] == '(' && ')' == v.slice(-1))
			||	(v[0] == '{' && '}' == v.slice(-1))
			||	(v[0] == '[' && ']' == v.slice(-1))
			) {
				t += ':\n' + v;
			} else {
				t += ':\n[\n' + v + '\n]';
			}
		} else {
			t += ' = "' + v + '"';
		}
	}
	console.log(t);
}

function dataToBlob(data) {
	if (URL_API && URL_API.createObjectURL) {
	var	type = TYPE_TP;
		if (data.slice(0, k = DATA_PREFIX.length) == DATA_PREFIX) {
		var	i = data.indexOf(',')
		,	meta = data.slice(k,i)
		,	data = data.slice(i+1)
		,	k = meta.indexOf(';')
			;
			if (k < 0) {
				type = meta;
				data = decodeURIComponent(data);
			} else {
				type = meta.slice(0,k);
				if (meta.slice(k+1) == 'base64') data = atob(data);
			}
		}
	var	data = Uint8Array.from(TOS.map.call(data, v => v.charCodeAt(0)))
	,	size = data.length
	,	url = URL_API.createObjectURL(new Blob([data], {'type': type}))
		;
		if (url) {
			return {
				size: size
			,	type: type
			,	url: url
			};
		}
	}
}

function saveDL(data, fileName, param) {
	if (typeof param !== 'object') param = {};
var	type = TYPE_TP
,	ext = param.ext || ''
,	addTime = param.addTime || 0
	;
	if (addTime == 'after') addTime = 1; else
	if (addTime == 'before') addTime = -1; else addTime = orz(addTime);

var	data = (
		typeof data === 'object'
		? JSON.stringify(
			data
		,	param.jsonReplacerFunc || null
		,	'\t'
		)
		: ''+data
	);
	if (data.slice(0, BLOB_PREFIX.length) == BLOB_PREFIX) {
	var	dataURI = data
	,	blob = true
		;
	} else
	if (data.slice(0, DATA_PREFIX.length) == DATA_PREFIX) {
		dataURI = data;
	} else {
		dataURI = DATA_PREFIX + type + ',' + encodeURIComponent(data);
	}

var	size = dataURI.length
,	a = cre('a', document.body)
	;
	logTime('saving "' + fileName + '", data = ' + data.length + ' bytes, dataURI = ' + size + ' bytes');

	if ('download' in a) {
		try {
			if (
				!blob
			&&	(param.tryAsBlob || typeof param.tryAsBlob === 'undefined')
			) {
				if (blob = dataToBlob(data)) {
					size = blob.size;
					type = blob.type;
					dataURI = blob.url;
				} else {
					type = dataURI.split(';', 1)[0].split(':', 2)[1];
				}
				if (!ext) {
					ext = type.split('/').slice(-1)[0];
				}
			}
			if (ext == 'plain') ext = 'txt';

		var	time = (
				!fileName || addTime
				? getFormattedTime(0,1)
				: ''
			)
		,	baseName = (
				function() {
					if (!fileName) return time;
					if (addTime > 0) return fileName + '_' + time;
					if (addTime < 0) return time + '_' + fileName;
					return fileName;
				}
			)()
		,	fileName = baseName + (ext ? '.' + ext : '')
			;
			a.href = ''+dataURI;
			a.download = fileName;
			a.click();

			logTime('saving "' + fileName + '"');
		} catch (error) {
			console.log(error);
		}
	} else {
		window.open(dataURI, '_blank');

		logTime('opened file to save');
	}

	setTimeout(
		function() {
			if (blob) URL_API.revokeObjectURL(blob.url);
			del(a);
		}
	,	Math.max(Math.ceil(size / 1000), 12345)
	);

	return size;
}

function pause(msec) {
	return new Promise(
		(resolve, reject) => {
			setTimeout(resolve, msec || 1000);
		}
	);
}

function getRandomInt(min, max) {
var	a = Math.min(min, max)
,	b = Math.max(min, max) - a
	;
	return Math.floor(a + Math.random() * b);
}

//* Page-specific functions: internal, utility *-------------------------------

function getRandomColorValue() {
	return getRandomInt(50, 215);
}

function getRandomColorSet(n) {
	return getArrayOfZero(n).map(getRandomRGB);
}

function getRandomRGB() {
	return getArrayOfZero().map(getRandomColorValue);
}

function getArrayOfZero(n) {
	return (new Array(n || 3)).fill(0);
}

function getToggleButtonHTML(content, open) {
	return (
		'<a href="javascript:void this'
	+	'" onClick="toggleHideNext(this)'
	+	'" class="toggle'+(open?' open':'')
	+	'">'
	+		content.replace(regTrimPun, '')
	+	'</a>'
	);
}

async function draw() {

	function drawRandomSprite(
		x0
	,	y0
	,	pixel_cols
	,	pixel_rows
	,	pixel_size
	,	colors_count
	,	colors_random_max
	,	ver_symmetry
	,	hor_symmetry
	,	drawFrameFileNamePefix
	) {

		function drawPixelRect(x, y) {
			ctx.fillRect(
				pixel_size * x
			,	pixel_size * y
			,	pixel_size
			,	pixel_size
			);
		}

	var	random_cols = pixel_cols
	,	random_rows = pixel_rows
		;
		if (typeof ver_symmetry === 'undefined') ver_symmetry = false;
		if (typeof hor_symmetry === 'undefined') hor_symmetry = true;

		if (hor_symmetry) {
		var	half_cols = random_cols = Math.ceil(pixel_cols / 2)
		,	center_col = pixel_cols % 2
			;
		}

		if (ver_symmetry) {
		var	half_rows = random_rows = Math.ceil(pixel_rows / 2)
		,	center_row = pixel_rows % 2
			;
		}

		if (colors_count < 1) {
			colors_count = 1;
		} else
		if (
			colors_count > pixel_cols
		||	colors_count > pixel_rows
		) {
			colors_count = Math.max(pixel_cols, pixel_rows);
		}

		if (!colors_random_max) {
			colors_random_max = colors_count * 2;
		} else
		if (colors_random_max < colors_count) {
			colors_random_max = colors_count;
		}

	var	colors = getRandomColorSet(colors_count).map(v => ('rgb(' + v.join(',') + ')'))
		;
		for (var y = 0; y < random_rows; y++)
		for (var x = 0; x < random_cols; x++) {
		var	r = getRandomInt(0, colors_random_max);

			if (r < colors.length) {
				ctx.fillStyle = colors[r];
				drawPixelRect(x0 + x, y0 + y);
			var	reflect_row = (ver_symmetry && (!center_row || y < half_rows - 1))
			,	reflect_col = (hor_symmetry && (!center_col || x < half_cols - 1))
				;
				if (reflect_row) {
				var	y1 = y0 + pixel_rows - y - 1;
					drawPixelRect(x0 + x, y1);
				}
				if (reflect_col) {
				var	x1 = x0 + pixel_cols - x - 1;
					drawPixelRect(x1, y0 + y);
				}
				if (reflect_row && reflect_col) {
					drawPixelRect(x1, y1);
				}
				if (drawFrameFileNamePefix) {
					saveDL(
						canvas.toDataURL()
					,	[drawFrameFileNamePefix, 'y'+y, 'x'+x].join('_')
					,	{ext: 'png', tryAsBlob: false}
					);
				}
			}
		}
	}

	logTime('started drawing');

var	canvas = cre('canvas')
,	ctx = canvas.getContext('2d')
,	w = canvas.width  = param.canvas_width
,	h = canvas.height = param.canvas_height
,	colors_random_max = (
		param.black_ratio < 1
		? param.colors_per_sprite
		: (param.colors_per_sprite / (100 - Math.min(99, param.black_ratio)) * 100)
	)
,	save_draw_frames = (
		checkbox.auto_save
	&&	checkbox.draw_frames
	)
,	fileName = (
		[
			getFormattedTime(0,1)
		,	'canvas'
		,	[param.canvas_width,    param.canvas_height  ].join('x')
		,	'with'
		,	[param.sprites_per_row, param.sprites_per_col].join('x')
		,	'sprites'
		,	[param.sprite_width,    param.sprite_height  ].join('x')
		,	param.pixel_size + 'px'
		,	param.colors_per_sprite + '_colors'
		].join('_')
	);

	if (!checkbox.transprent_bg) {
		ctx.fillStyle = 'black';
		ctx.fillRect(0,0, w,h);
	}

var	e = id('image');
	if (!e) {
		e = cre('img', id('render') || document.body);
		e.title = e.alt = la.drawing;
		e.id = 'image';
	}

	for (var row_i = 0; row_i < param.sprites_per_row; row_i++)
	for (var col_i = 0; col_i < param.sprites_per_col; col_i++) {
	var	x0 = row_i * (param.sprite_width  + param.sprite_border * 2) + param.sprite_border
	,	y0 = col_i * (param.sprite_height + param.sprite_border * 2) + param.sprite_border
		;
		drawRandomSprite(
			x0
		,	y0
		,	param.sprite_width
		,	param.sprite_height
		,	param.pixel_size
		,	param.colors_per_sprite
		,	colors_random_max
		,	checkbox.ver_symmetry
		,	true
		,	(
				save_draw_frames
				? [fileName, 'row'+row_i, 'col'+col_i].join('_')
				: false
			)
		);
		if (checkbox.draw_frames) {
			e.src = canvas.toDataURL();
			await pause(checkbox.auto_save ? 500 : 100);
		}
	}

	logTime('finished drawing ' + fileName);

	e.title = e.alt = fileName;

	if (!checkbox.draw_frames) {
		e.src = canvas.toDataURL();
	}
	if (checkbox.auto_save) save();

	if (e = id('save_size')) e.textContent = w + 'x' + h;
	if (e = id('save')) e.disabled = false;
}

function save() {
var	e = id('image');
	if (!e) {
		if (e = id('save')) e.disabled = true;
		return;
	}

	logTime('started saving');

	saveDL(e.src, e.alt, {ext: 'png', tryAsBlob: true});
}

function updateSwitch(e) {
	if (e) e.checked = checkbox[e.id || e.name] = !!e.checked;
	if (checkbox.auto_redraw) draw();
}

function updateValue(e) {
	if (e) e.value = param[e.id || e.name] = orz(e.value);

var	sprite_w = param.pixel_size * ((param.sprite_border * 2) + param.sprite_width)
,	sprite_h = param.pixel_size * ((param.sprite_border * 2) + param.sprite_height)
	;
	if (param.canvas_max_width ) param.sprites_per_row = Math.max(1, Math.floor(param.canvas_max_width  / sprite_w));
	if (param.canvas_max_height) param.sprites_per_col = Math.max(1, Math.floor(param.canvas_max_height / sprite_h));

var	w = param.canvas_width  = param.sprites_per_row * sprite_w
,	h = param.canvas_height = param.sprites_per_col * sprite_h
	;
	if (e = id('draw_size')) e.textContent = w + 'x' + h;
	if (checkbox.auto_redraw) draw();
}

//* Runtime: prepare UI *------------------------------------------------------

function init() {
var	container = delAllChildNodes(document.body)
,	table = cre('table', cre('section', container))
	;

	for (var i in la.checkboxes) if (i in checkbox) {
	var	p = cre('tr', table)
	,	t = cre('td', p)
	,	n = cre('input', cre('td', p))
		;
		t.textContent = (la.checkboxes[i] || i) + ':';
		n.id = i;
		n.type = 'checkbox';

		n.checked = !!checkbox[i];
		n.setAttribute('onchange', 'updateSwitch(this)');
	}

	table = cre('table', cre('section', container));
	for (var i in la.inputs) if (i in param) {
		if (i == 'sprite_width') {
			table = cre('table', cre('section', container));
		}
	var	p = cre('tr', table)
	,	t = cre('td', p)
	,	n = cre('input', cre('td', p))
		;
		t.textContent = (la.inputs[i] || i) + ':';
		n.id = i;
		n.type = 'number';

		n.min = (MIN_0.indexOf(i) < 0 ? 1 : 0);
		if (MAX_99.indexOf(i) >= 0) n.max = 99;

		n.value = param[i];
		n.setAttribute('onchange', 'updateValue(this)');
	}

	table = cre('table', cre('section', container));
	for (var i in la.buttons) if (i in window) {
	var	p = cre('tr', table)
	,	b = cre('button', cre('td', p))
	,	t = cre('td', p)
		;
		t.id = i + '_size';
		b.id = i;
		b.textContent = (la.buttons[i] || i);
		b.setAttribute('onclick', i + '()');

		if (i == 'save') b.disabled = true;
	}

var	a = {
		'src': 'https://github.com/f2d/random_ship_generator'
	,	'en': 'https://medium.freecodecamp.org/how-to-create-generative-art-in-less-than-100-lines-of-code-d37f379859f'
	,	'ru': 'https://habr.com/company/pixonic/blog/429078/'
	}
,	e = cre('section', container)
,	n = cre('header', e)
,	t = cre('div', e)
	;
	t.className = 'hid';
	n.innerHTML = getToggleButtonHTML(la.about.header);
	cre('p', t).innerHTML = la.about.lines.join('<br>');
	cre('img', t).src = 'demo.gif';
	cre('p', t).innerHTML = la.about.links;

	for (var i in a) cre('p', t).innerHTML = (
		'<a href="'
	+		a[i]
	+	'">'
	+		la.links[i]
	+	'</a>'
	);

	cre('br', container);
	cre('section', container).id = 'render';

	updateValue();

	logTime('ready to work');
}

document.addEventListener('DOMContentLoaded', init, false);

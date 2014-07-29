({
	appDir : "./",
	baseUrl : "js",
	dir : "../web-built",
	paths : {
		json2 : "lib/json2",
		jquery : 'lib/jquery',
		helper: "lib/helper",
		underscore : "lib/underscore",
		backbone : "lib/backbone",
		zero_clipboard:"lib/zero_clipboard"
		//text: "lib/text",
		// lazyload:"lib/lazyload",
		// jrecorder:"lib/jrecorder",
		// belatedpng:"lib/belatedpng",
		// jquery_ujs:"lib/jquery_ujs",
		// webcam:"lib/webcam",
		// jcrop:"lib/jquery.jcrop",
		//"zero_clipboard" : "lib/zero_clipboard",
		//"jquery.parser" : "plugin/jquery.parser",
		//"face.lib":"plugin/face.lib"
		//"jquery.attextbox":"plugin/jquery.attextbox",
		//"jquery.combobox":"plugin/jquery.combobox",
		//"jquery.default_image":"plugin/jquery.default_image",
		//"jquery.easydrag" : "plugin/jquery.easydrag",
		//"jquery.eyscroll":"plugin/jquery.eyscroll",
		//"jquery.face":"plugin/jquery.face",
		//"jquery.jcrop":"plugin/jquery.jcrop",
	},
	optimizeCss : "none",
	//optimize: 'none',
	modules : [ {
		name : "almond",
		include: ["almond_main"]
	}]
})
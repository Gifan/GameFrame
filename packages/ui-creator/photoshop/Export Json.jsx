#target photoshop

#include "json2.js"

const _c2Id = charIDToTypeID;
const _s2Id = stringIDToTypeID;

//const kReg = /(副本\d*)|(copy\d*)/g;

var m_docWidth = 0;
var m_docHeight = 0;

function isTextLayer(descriptor) {
	return descriptor.hasKey(_s2Id("textKey"));
}

function hasEffects(descriptor) {
	return descriptor.hasKey(_s2Id("layerEffects"));
}

//描边效果
function hasEffectOutline(descriptor) {
	return descriptor.getObjectValue(_s2Id("layerEffects")).hasKey(_s2Id("frameFx"));
}

function getEffectOutline(descriptor) {
	var effect = descriptor.getObjectValue(_s2Id("layerEffects")).getObjectValue(_s2Id("frameFx"));
	var alpha = effect.getUnitDoubleValue(_s2Id("opacity")) / 255;
	var size = effect.getUnitDoubleValue(_s2Id("size"));
	var origColor = effect.getObjectValue(_s2Id("color"));
	var color = new SolidColor();
	color.rgb.red = origColor.getDouble(_s2Id("red"));
	color.rgb.green = origColor.getDouble(_s2Id("green"));
	color.rgb.blue = origColor.getDouble(_s2Id("blue"));
	//color.rgb.alpha = origColor.getDouble(_s2Id("alpha"));
	return {type:'outline', alpha:alpha, size:size, color:color.rgb.hexValue};
}

//阴影效果
function hasEffectShadow(descriptor) {
	return descriptor.getObjectValue(_s2Id("layerEffects")).hasKey(_s2Id("dropShadow"));
}

function getEffectShadow(descriptor) {
	var effect = descriptor.getObjectValue(_s2Id("layerEffects")).getObjectValue(_s2Id("dropShadow"));
	var alpha = effect.getUnitDoubleValue(_s2Id("opacity")) / 255;
	var angle = effect.getDouble(_s2Id("localLightingAngle"));
	var distance = effect.getDouble(_s2Id("distance"));
	var origColor = effect.getObjectValue(_s2Id("color"));
	var color = new SolidColor();
	color.rgb.red = origColor.getDouble(_s2Id("red"));
	color.rgb.green = origColor.getDouble(_s2Id("green"));
	color.rgb.blue = origColor.getDouble(_s2Id("blue"));
	//color.rgb.alpha = origColor.getDouble(_s2Id("alpha"));
	return {type:'shadow', distance:distance, alpha:alpha, angle:angle, color:color.rgb.hexValue};
}

function hasEffectSolidFill(descriptor) {
	return descriptor.getObjectValue(_s2Id("layerEffects")).hasKey(_s2Id("solidFill"));
}

function getEffectSolidFill(descriptor) {
	var stroke = descriptor.getObjectValue(_s2Id("layerEffects")).getObjectValue(_s2Id("solidFill"));
	var alpha = stroke.getUnitDoubleValue(_s2Id("opacity")) / 255;
	var origColor = style.getObjectValue(_s2Id("color"));
	var color = new SolidColor();
	color.rgb.red = origColor.getDouble(_s2Id("red"));
	color.rgb.green = origColor.getDouble(_s2Id("green"));
	color.rgb.blue = origColor.getDouble(_s2Id("blue"));
	//color.rgb.alpha = origColor.getDouble(_s2Id("alpha"));
	return {type:'fill', alpha:alpha, color:color.rgb.hexValue};
}

function getBounds(descriptor) {
	var bounds = descriptor.getObjectValue(_s2Id("bounds"));
	var left = bounds.getUnitDoubleValue(_s2Id("left"));
	var top = bounds.getUnitDoubleValue(_s2Id("top"));
	var right = bounds.getUnitDoubleValue(_s2Id("right"));
	var bottom = bounds.getUnitDoubleValue(_s2Id("bottom"));
    var width = right - left;
    var height = bottom - top;
    var x = left + width / 2;
    var y = m_docHeight - (top + height / 2);
    
	//return [left, top, right, bottom]
    return [x,  y,  width,  height]
}

function getAlpha(descriptor) {
	return descriptor.getUnitDoubleValue(_s2Id("opacity")) / 255;
}

function getName(descriptor) {
	var name = descriptor.getString(_s2Id("name"));
	//if (name.match(kReg) != null) {
	//	retrun name.split(kReg)[0];
	//}
	return name;
}

function getSection(descriptor) {
	return typeIDToStringID(descriptor.getEnumerationValue(_s2Id("layerSection")));
}

function getDescriptor(layerIndex) {
	var ref = new ActionReference();
	ref.putIndex(_s2Id("layer"), layerIndex);
	return executeActionGet(ref);
}

function getDocLayerCount() {
	var ref = new ActionReference();
	ref.putEnumerated(_s2Id("document"),  _s2Id("ordinal"),  _s2Id("targetEnum"));
	var desc = executeActionGet(ref);
	var count = desc.getInteger(_s2Id("numberOfLayers"));
	return count;	
}

function getTextFormats(descriptor) {
	var formats = [];
	var textStyle = descriptor.getObjectValue(_s2Id("textKey"));
	var content = textStyle.getString(_s2Id("textKey"));
	var styleRangeList = textStyle.getList(_s2Id("textStyleRange"));
    var styleRange = styleRangeList.getObjectValue(0);
    var start = styleRange.getInteger(_s2Id("from"));
    var end = styleRange.getInteger(_s2Id("to"));
    var style = styleRange.getObjectValue(_s2Id("textStyle"));
    var text = content.substring(start, end);
    var font = style.getString(_s2Id("fontName"));
    var size = style.getDouble(_s2Id("size"));
	if (textStyle.hasKey(stringIDToTypeID('transform'))) {  
		var factor = textStyle.getObjectValue(stringIDToTypeID('transform')).getUnitDoubleValue (stringIDToTypeID("yy") );  
		size = (size* factor).toFixed(0);  
    }
    var origColor = style.getObjectValue(_s2Id("color"));
    var color = new SolidColor();
    color.rgb.red = origColor.getDouble(_s2Id("red"));
    color.rgb.green = origColor.getDouble(_s2Id("green"));
    color.rgb.blue = origColor.getDouble(_s2Id("blue"));
    return {text:text, font:font, size:size, color:color.rgb.hexValue};
}

function getEffects(descriptor) {
	if (hasEffects(descriptor) == false) {
		return [];
	}

	var effects = [];
	if (hasEffectOutline(descriptor)){
		effects.push(getEffectOutline(descriptor));
	}
	if (hasEffectShadow(descriptor)){
		effects.push(getEffectShadow(descriptor));
	}
	return effects;
}

function genImageLayerData(descriptor) {
	var data = {
		type : "image",
		name : getName(descriptor),
		alpha : getAlpha(descriptor),
		bounds : getBounds(descriptor),
		//effect : getEffects(descriptor),
	}
	
	return data;
}

function genTextLayerData(descriptor) {
	var data = {
		type : "text",
		name : getName(descriptor),
		alpha : getAlpha(descriptor),
		bounds : getBounds(descriptor),
		effect : getEffects(descriptor),
		format : getTextFormats(descriptor)
	}
	
	return data;
}

function Decycle(object, name) {
	if (object.type != "folder")
		return;
	delete object.parent;
	//object.path = name;            
	for (var _i = 0; _i < object.children.length; _i++) {
		var iterator = object.children[_i];
		Decycle(iterator, name + "/" + object.name);
	}
}

function generate(doc) {
	var startTime = new Date().getTime();
	
    // setup the units in case it isn't pixels
    var savedRulerUnits = app.preferences.rulerUnits;
    var savedTypeUnits = app.preferences.typeUnits;
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;
    
    var docName = doc.name;
    docName = docName.substring(0, docName.lastIndexOf("."))
    m_docWidth = doc.width.value;
    m_docHeight = doc.height.value;
    
	var layerCount = getDocLayerCount(doc);
	var data = { type: "folder",  name: docName,  parent:null,  children:[] };
	var current = data;	
	var skipSection = false;
	var skipSectionNode = null;
	for (var i = layerCount; i >= 1; i--) {
		var descriptor = getDescriptor(i);
		var layerSection = getSection(descriptor);
		switch(layerSection) {
			case "layerSectionStart":
				var node = { type: "folder",  name: getName(descriptor), parent:current, children:[] };
				if(skipSection) {
					
				} else if(node.name[0] == "_") {
					//跳过导出
					skipSection = true;
					skipSectionNode = node;
				} else {
					current.children.push(node);					
				}
				current = node;
			break;
			case "layerSectionContent":
				if(skipSection) {
					break;
				}
				var node;
				if (isTextLayer(descriptor)) {
					node = genTextLayerData(descriptor);
				} else {
					node = genImageLayerData(descriptor);
				}
				if(node.name[0] == "_") {
					//跳过导出					
				} else {
					current.children.push(node);					
				}
			break;
			case "layerSectionEnd":		
				if(skipSection && skipSectionNode == current) {
					skipSection = false;
				}	
				if(current.parent == null) {
					 var ddcurrent = null;
				}				
				current = current.parent;
			break;
		}	
	}
	
	var exportFolder = new Folder('C:/PsdExport/');  
    exportFolder.create(); 
	
    //写入Json导出文件
    Decycle(data, "");
    var jsonString = JSON.stringify(data);
	var filePath = "C:/PsdExport/_newest.json";
	var file = new File(filePath);
    file.encoding = "utf-8";   //写文件时指定编码，不然中文会出现乱码
	file.open('w');
	file.writeln(jsonString);
	file.close();
	
	filePath = "C:/PsdExport/"+ docName +".json";
	file = new File(filePath);
    file.encoding = "utf-8";
	file.open('w');
	file.writeln(jsonString);
	file.close();
    
    //reset ruler units
    app.preferences.rulerUnits = savedRulerUnits;
    app.preferences.typeUnits = savedTypeUnits;
	
	alert("Export Complete! time:" + (new Date().getTime() - startTime) + "\n path:" + filePath)
}

generate(app.activeDocument);












## SCFile Javascript Proxy Generator

In HP Service Manager, it's not easy to operate array/structure type field within record. For example, consider to append or insert a structure into an array. 

This script used to generate JavaScript Proxy to operator complex Service Manager object by JavaScript.
### Follows the steps to use this tool:
1. Create JavaScript Proxy Object, taking `Template` as example.
 	```javascript
	var script = lib.[GENERATOR].constructJSObject('Template');
	```
2. Then you will get Proxy JavaScript code   [Template_Proxy](samples/TemplateJSProxy.js "SCFile_Template_Proxy")
3. And now you can use this piece of code to operate Template record, for example add a new line 
 
	```javascript
	var templateRecord = new SCFile('Template');
	templateRecord.doSelect("name='XXX'");
	
	//Create a new field to be appended.
	var newField = new lib.[PROXY].templateInfo();
	newField.field="XXX";
	newField.display="YYY";
	newField.caption="ZZZ";
	
	//Append the new field to the end of array.
	templateRecord.templateInfo.push(newField.toSCFile());
	

	```

 
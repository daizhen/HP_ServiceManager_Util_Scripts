#1. [SCFile Javascript Proxy Generator](src/SCFileProxyGenerator.js "SCFile Javascript Proxy Generator")

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

#2. [Full Content Searching Tool ](src/FullContentCodeSearch.js "Full content searching")
###In HP Service Manager, we have to search for a variable, or a piece of string content, within database for trouble shooting. We can use the system embedded tool, *afind.string, to search the data within a *single* table. And the search result shows which records contain the target string. 
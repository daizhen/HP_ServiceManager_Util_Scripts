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
In HP Service Manager, we have to search for a variable, or a piece of string content, within database for trouble shooting. We can use the system embedded tool, *afind.string, to search the data within a *single* table. And the search result shows which records contain the target string. But there are 2 points, which are not perfect:
    1. Search in single table one time.
    2. The result does not show the exact place, which columns and which line, to hold the target string.

By using this tool, you can search string in all tables one time.You can pre-configure  the tables in function `BuildTables`.
It's very easy to call this method.

```javascript
var result_list = GetAllString("TARGET STRING");
```
And the result_list is an array of object `SearchResult` 

```javascript

function SearchResult()
{
	this.table="";
	this.key="";
	this.field="";
};

```

Followings are a list of search result, when searching for ***$lo.operator***. 

``` javascript
Process  process=reportscheduleDefinition.new.init   	descriptor.pre.expressions[8].pre.expressions
Process  process=cm.open.save_BFPD   					descriptor.rad[4].post.rad.expressions[1].post.rad.expressions
Process  process=cc.first.log_backup_160106   			descriptor.javascript.post
Process  process=cc.first.log_backup   					descriptor.javascript.post
Process  process=cc.first.log   						descriptor.javascript.post
```

#3. [Hash Util](src/Hash_Util.js "Hash Util")

It's an simple script implement HashSet and Hashtable.

#4. [Json Util](src/Json_Util.js "Json Util")

A script to generate json string from java object.
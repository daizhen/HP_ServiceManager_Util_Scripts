## SCFile Javascript Proxy Generator

In service Manager, it's not easy to operate array/structure type field within record. For example, consider to append or insert a structure into an array. 

This script used to generate JavaScript Proxy to operator complex Service Manager object by JavaScript.
### Follows the steps to use this tool:
1. Create JavaScript Proxy Object, taking Template as example.
 `var script = lib.[GENERATOR].constructJSObject('Template')`
2. Then you will get Proxy JavaScript code   [Template_Proxy](samples/TemplateJSProxy.js "SCFile_Template_Proxy")
3. Then you can use this piece of code to operate Template record, for example add a new line 
4. `dddddd`


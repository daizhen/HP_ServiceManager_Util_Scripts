/*
	Column info.
*/
function ColumnInfo()
{
	//Column name
	this.name = "";
	
	//Column type: 8: array, 9: structure,and other primitive types.
	this.type = "";
	
	//Column level
	this.level= 0;
	
	//Children of this column
	this.children = new Array();
	
	//Parent column.
	this.parent = null;
};
ColumnInfo.prototype.toJSFunction = function()
{
	var str = "";
	
	for(var i=0;i<this.children.length;i++)
	{
		var childFunction = this.children[i].toJSFunction();
		if(childFunction == null || childFunction == "")
		{
			//Nothing do to
		}
		else
		{
			str+=childFunction;
			str+="\n";
		}
	}
	//Structure type
	if(this.type == 9)
	{
		var functionName = makeFunctionName(this.name);
		var childrenName = new Array();
		str = str+ "function "+functionName+"()\n";
		str = str +"{\n";
		for(var i=0;i<this.children.length;i++)
		{
			var fieldName = makeFieldName(this.children[i].name);
			var childType = this.children[i].type;
			
			if(isReservedWord(fieldName))
			{
				str = str + "\tthis['"+fieldName+"']";
			}
			else
			{
				str = str + "\tthis."+fieldName;
			}
			if(childType == 9)
			{
				str = str + " = new "+makeFunctionName(this.children[i].name)+"()";
			}
			else if(childType == 8)
			{
				str = str + " = new Array()"
			}
			else
			{
				//nothing to do
			}
			str +=';\n';
			
			childrenName.push(fieldName);
		}
		str = str + "\tthis.$$children = ['"+childrenName.join("','")+"'];\n";
		str = str +"}\n";
		
		str = str + functionName+'.prototype.toSCFile = toSCFile;'
		
	}
	return str;
}

function isReservedWord(fieldName)
{
	var reservedWords = ['class','function','Array','package','default'];
	
	return reservedWords.indexOf(fieldName)>=0;
}

function makeFieldName(columnName)
{
	return columnName.replace(/\./g,'_');;
}

function makeFunctionName(columnName)
{
	return columnName.replace(/\./g,'_');;
}

/*
	Get Columns Info
	return: Array of ColumnInfo
*/
function GetColumnInfo(dbdict)
{
	var rootColumn = null;	

	var index = 0;
	var lastIndex = 0;
	while(dbdict.field[index].name!=null)
	{
		var columnName = dbdict.field[index].name;
		var columnType = dbdict.field[index].type;
		var columnLevel = dbdict.field[index].level;
		var columnIndex = dbdict.field[index].index;
		
		var currentColumn = new ColumnInfo();
		currentColumn.name = columnName;
		/*
		if(columnType == 9)
		{
			currentColumn.type="structure";
		}
		else if(columnType ==8)
		{
			currentColumn.type="array";
		}
		else
		{
			currentColumn.type="primitive"; 
		}
		*/
		currentColumn.type = columnType;
		currentColumn.level = columnLevel;
		if(currentColumn.name == "descriptor")
		{
			rootColumn = currentColumn;
		}
		else
		{
			//Gets the parent column
			var parentColumn = rootColumn;
			var temLevel = 0;
			while(temLevel<currentColumn.level-1)
			{
				parentColumn = parentColumn.children[parentColumn.children.length - 1];
				temLevel++;
			}
			
			//print("columnName:"+columnName+" and parent:"+parentColumn.name);
			//Check if the field is vj or not, if vj just ignore it.
			if(parentColumn.children.length < columnIndex)
			{
				parentColumn.children.push(currentColumn);
				currentColumn.parent = parentColumn;
			}
			//parentColumn.children.push(currentColumn);
			//currentColumn.parent = parentColumn;
		}
		index++;
	}
	
	//print(dbdict.key);
	return rootColumn;
}

function constructJSFile(objectName, scRecord)
{
	var jsFile = {};
	var dbdict = new SCFile("dbdict");
	dbdict.doSelect("name =\""+objectName+"\"");
	var descriptor = GetColumnInfo(dbdict);
	jsFile[descriptor.name] = constructStruct(scRecord,descriptor.children);
	
	return jsFile;
}

function constructStruct(record, fields)
{
	var structFile = {};
	for(var i=0;i<fields.length;i++)
	{
		//array
		if(fields[i].type == 8)
		{
			structFile[fields[i].name] = constructArray(record[fields[i].name],fields[i].children[0]);
		}
		//Struct
		else if(fields[i].type == 9)
		{
			structFile[fields[i].name] = constructStruct(record[fields[i].name],fields[i].children);
		}
		else
		{
			/*
			if(fields[i].name == "calculation")
			{
				print(system.functions.str(record[fields[i].name]));
			}
			*/
			structFile[fields[i].name] = system.functions.str(record[fields[i].name]);
		}
	}
	return structFile;
}

function constructArray(record, childField)
{
	var arrayFile = new Array();
	
	for(var i=0;i<system.functions.lng(record);i++)
	{
		if(childField.type == 8)
		{
			arrayFile.push(constructArray(record[i],childField.children[0]));
		}
		//Struct
		else if(childField.type == 9)
		{
			arrayFile.push(constructStruct(record[i],childField.children));
		}
		else
		{
			arrayFile.push(system.functions.str(record[i]));
		}
	}
	
	return arrayFile;
}

function constructJSObject(objectName)
{
	var dbdict = new SCFile("dbdict");
	dbdict.doSelect("name =\""+objectName+"\"");
	
	var descriptor = GetColumnInfo(dbdict);
	var str = descriptor.toJSFunction();
	str+="\n\n//-----------------Common methods-----------------------\n"
	str+="Array.prototype.toSCFile = toSCFileFromArray;\n";
	str+="function toSCFileFromArray()\n";
	str+="{\n";
	str+="	var scFile = new SCFile();\n";
	str+="	scFile.setType(8);\n";
	str+="	for(var i=0;i<this.length;i++)\n";
	str+="	{\n";
	str+="		if(this[i] && this[i].toSCFile)\n";
	str+="		{\n";
	str+="			scFile.push(this[i].toSCFile());\n";
	str+="		}\n";
	str+="		else\n";
	str+="		{\n";
	str+="			scFile.push(this[i]);\n";
	str+="		}\n";
	str+="	}\n";
	str+="		//print(field+this[field]);\n";
	str+="	return scFile;\n";
	str+="}\n";
	
	str+="function toSCFile()\n";
	str+="{\n";
	str+="	var scFile = new SCFile();\n";
	str+="	scFile.setType(9);\n";
	str+="	for(var i=0;i<this.$$children.length;i++)\n";
	str+="	{\n";
	str+="		var field = this.$$children[i];\n";
			
	str+="		if(field != 'toSCFile')\n";
	str+="		{\n";
	str+="			if(this[field]==undefined)\n";
	str+="			{\n";
	str+="				scFile.push(null);\n";
	str+="			}\n";
	str+="			else\n";
	str+="			{\n";
	str+="				if(this[field] && this[field].toSCFile)\n";
	str+="				{\n";
	str+="					scFile.push(this[field].toSCFile());\n";
	str+="				}\n";
	str+="				else\n";
	str+="				{\n";
	str+="					scFile.push(this[field]);\n";
	str+="				}\n";
	str+="			}\n";
	str+="		}\n";
	str+="	}\n";
	str+="	return scFile;\n";
	str+="}\n";
	//print(descriptor.toJSFunction());
	system.vars.$G_test = str;
	return str;
	
}

function test()
{
	constructJSObject("Process");
}
/*
var fProcess = new SCFile("formatctrl");
fProcess.doSelect("name =\"probsummary\"");

var jsFile = constructJSFile("formatctrl", fProcess);

for(i in jsFile["descriptor"])
{
	print(i);
}
*/
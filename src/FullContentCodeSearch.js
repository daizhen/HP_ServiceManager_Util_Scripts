/*
	Column info.
*/
function ColumnInfo()
{
	//Column name
	this.name = "";
	
	//Column type: array, structure,primitive.
	this.type = "";
	
	//Column level
	this.level= 0;
	
	//Children of this column
	this.children = new Array();
	
	//Parent column.
	this.parent = null;
};

function CallResult()
{
	this.success = false;
	this.message = "";
};


function SearchResult()
{
	this.table="";
	this.key="";
	this.field="";
};

/*
	Stored table info.
*/
function TableInfo(name)
{
	this.column = null;
	this.primaryKey=new Array();
	this.tableName=name;
}

//Builds the column and primary key by looking 
//up data from dbdict.
TableInfo.prototype.Build = function()
{
	var dbdict = new SCFile("dbdict");
	dbdict.doSelect("name =\""+this.tableName+"\"");
	this.column = GetColumnInfo(dbdict);
	for(var i=0;i<dbdict.key.length();i++)
	{
		var flag = dbdict.key[i].flags;
		if(flag == 12)// Unique
		{
			for(var j=0;j<dbdict.key[i].name.length();j++)
			{
				this.primaryKey.push(dbdict.key[i].name[j].replace(/\./g,"_"));
			}
		}
	}	
}
/*
	Builds tables to be searched in.
*/
function BuildTables()
{
	var tableNames = new Array();
	
	//tableNames.push("application");

	tableNames.push("Process");
	
	tableNames.push("ScriptLibrary");
	
	tableNames.push("eventregister");

	tableNames.push("triggers");	
    tableNames.push("extaccess");

	//tableNames.push("inbox");	

	tableNames.push("formatctrl");	
	//tableNames.push("notification");

	tableNames.push("link");
	tableNames.push("displayoption");
	
	tableNames.push("schedule");
	tableNames.push("globallists");
	tableNames.push("scripts");
	tableNames.push("eventmap");

	tableNames.push("subtotals");
	tableNames.push("displayscreen");

	tableNames.push("cm3rcatphase");
	tableNames.push("activityactions");
	tableNames.push("validity");
	
	tableNames.push("scaccess");
	tableNames.push("cascadeupd");

	tableNames.push("wizard");

	tableNames.push("ApprovalDef");
	tableNames.push("Alert");
	tableNames.push("category");
	tableNames.push("querystored");
	tableNames.push("format");
	
	//For Process Designer
	tableNames.push("RuleSet");

	var tables = [];
	for(var i=0;i<tableNames.length;i++)
	{
		var temTable = new TableInfo(tableNames[i]);
		temTable.Build();
		tables.push(temTable);
	}	
	return tables;
}

/**
	* Finds data from single table.
	* searchStr: string to be found.
	* table: given table
	* tableInfo: table info.
	* return: Array of string, to indicate which column contain the given string.
	*
*/
function FindForSingleTable(searchStr,tableRecord,tableInfo)
{
	
	//Opetimize the formatctrl.

	if(tableInfo.tableName == "format")
	{
		return FindFormatTable(searchStr,tableRecord,tableInfo);
	}

	var searchResults = new Array();
	//print(table);
	do
	{
		var result = CheckSingleRecord(searchStr,tableRecord,tableInfo.column);
		if(result.success)
		{
			var keyValue ="";
			for(var i=0;i<tableInfo.primaryKey.length;i++)
			{
				var currentKey = tableInfo.primaryKey[i];
			 	keyValue= keyValue+ currentKey+"="+eval("tableRecord."+currentKey)+" and ";
			}
			if(keyValue.length>0)
			{
				keyValue = keyValue.substring(0,keyValue.length-4);
			}
			//var temString = "Table:"+tableInfo.tableName+"  key:"+keyValue+"            field:"+result.message;
			var currentSearchResult = new SearchResult();
			currentSearchResult.table = tableInfo.tableName;
			currentSearchResult.key = keyValue;
			currentSearchResult.field = result.message;
			
			searchResults.push(currentSearchResult);
			print("" +currentSearchResult.table + "  " + currentSearchResult.key + "  " + currentSearchResult.field);
		}
	}
	while(tableRecord.getNext()==RC_SUCCESS)
	return searchResults;
}

function CheckSingleRecord(searchStr,record,columnInfo)
{
	if(record!=null)
	{
		if(columnInfo.type=="array")
		{
			var recordLength = system.functions.lng(system.functions.denull(record));
			for(var i=0;i<recordLength;i++)
			{
				var result = CheckSingleRecord(searchStr,record[i],columnInfo.children[0]);
				if(result.success)
				{
					result.message = columnInfo.name+"["+i+"]."+result.message;
					return result;
				}
			}
		}
		else if(columnInfo.type=="structure")
		{
			for(var i =0;i<columnInfo.children.length;i++)
			{
				var childColumn = columnInfo.children[i];	
				var str_record = "record[\""+(childColumn.name.replace(/\./g,'_')+"\"]");
				var result = null;
				//print(childColumn.name);
				var subRecord = eval(str_record);
				if(subRecord == null)
				{
					continue;
				}
				
				result = CheckSingleRecord(searchStr,subRecord,childColumn);
		
				if(result.success)
				{
					if(columnInfo.parent!=null && columnInfo.parent.type == "array")
					{
						//Nothing to do.
					}
					else
					{
						result.message = columnInfo.name+"." + result.message;
					}
					return result;
				}
				
				//try
				//{

				//}
				//catch(e)
				//{
					/*
					print("Error:"+childColumn.name);
					print("Error:"+eval(str_record)+"****");
					var fullName = GetFullName(childColumn);
					//return result;
					*/				
					//print("Error e : "+e);
					//continue;
					/*
					if(childColumn.name=="queries")
					{
						//print(eval("record.queries"));
						print(eval("record."+(childColumn.name.replace(/\./g,'_'))));
					}
					
					print("Error:  "+columnInfo.name+"."+(childColumn.name.replace(/\./g,'_')));
					
					return;
					*/
				//}
			}
		}
		else//primitive type.
		{
			if(record!= undefined &&record!=null && record!="" && record.toString().indexOf(searchStr)>=0)
			{
				var result = new CallResult();
				result.success = true;
				result.message = columnInfo.name;
				return result;	
			}
		}
	}
	var defaultResult = new CallResult();
	defaultResult.success = false;
	defaultResult.message = "";
	return defaultResult;
}

/*
	Get Columns Info
	return: Array of ColumnInfo
*/
function GetColumnInfo(dbdict)
{
	var rootColumn = null;	

	var index = 0;
	while(dbdict.field[index].name!=null)
	{
		var columnName = dbdict.field[index].name;
		var columnType = dbdict.field[index].type;
		var columnLevel = dbdict.field[index].level;
		
		var currentColumn = new ColumnInfo();
		currentColumn.name = columnName;
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
		
		//currentColumn.type = columnType;
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
			parentColumn.children[parentColumn.children.length] = currentColumn;
			currentColumn.parent = parentColumn;
		}
		index++;
	}
	
	//print(dbdict.key);
	return rootColumn;
}

/*
	Entry point of the search string.
	searchStr: string to be searched.
*/

function GetAllString(searchStr)
{
	print(Date());

	var resultStrings = new Array();
	var tablesInfo = BuildTables();
	for(var i=0;i<tablesInfo.length;i++)
	{
		var tableName = tablesInfo[i].tableName;
		print(tableName);
		var currentTable = new SCFile(tableName);
		currentTable.doSelect("true");		
		var currentResult = FindForSingleTable(searchStr,currentTable,tablesInfo[i]);
		
		for(var j=0;j<currentResult.length;j++)
		{
			resultStrings.push(currentResult[j]);
		}
		
	}
	
	system.vars.$MS_search_count = resultStrings.length;
	
	print(Date());
	
	return resultStrings;
	/*
	var tables =	GetAllUnloadTables();
	var xx = new Array();
	for(var i=0;i<tables.length;i++)
	{
		xx[0]+=tables[i]+"\n";
	}
	return xx;
	*/

	//BuildTables();
}

//Opetimizes the format table.
function FindFormatTable(searchStr,tableRecord,tableInfo)
{
	var searchResults = new Array();
	//var length = 0;
	//print(table);
	do
	{
		//length++;
		var result = new CallResult();
		//system.functions.denull(
		var fieldLength = 	system.functions.lng(tableRecord.field);
		for(var i=0;i<fieldLength;i++)
		{
			var currentField = tableRecord.field[i];
			var currentInput = currentField.input;
			var currentProperty = currentField.property;
			
			if(currentInput!=null && currentInput!="" && currentInput.toString().indexOf(searchStr)>=0)
			{
				result.success = true;
				result.message = "descriptor.field["+i+"].input";
				break;
			}
			else if(currentProperty!=null && currentProperty!="" && currentProperty.toString().indexOf(searchStr)>=0)
			{
				result.success = true;
				result.message = "descriptor.field["+i+"].property";
				break;
			}
			else
			{
				//Nothing to do.
			}
		}
	
		if(result.success)
		{
			var keyValue ="";
			for(var i=0;i<tableInfo.primaryKey.length;i++)
			{
				var currentKey = tableInfo.primaryKey[i];
			 	keyValue= keyValue+ currentKey+"="+eval("tableRecord."+currentKey)+" and ";
			}
			if(keyValue.length>0)
			{
				keyValue = keyValue.substring(0,keyValue.length-4);
			}
			//var temString = "Table:"+tableInfo.tableName+"  key:"+keyValue+"            field:"+result.message;
			
			var currentSearchResult = new SearchResult();
			currentSearchResult.table = tableInfo.tableName;
			currentSearchResult.key = keyValue;
			currentSearchResult.field = result.message;
			
			searchResults.push(currentSearchResult);
		}
	}
	while(tableRecord.getNext()==RC_SUCCESS)
	//print(length);
	return searchResults;
	
}

/*
	For debug only.

*/
function TestSearch()
{
	//var searchCondition = "0 in profile.request # \"MS REQUESTOR\"";
	/*
	var searchCondition="true";
	var unload = new SCFile("formatctrl");
	var result = unload.doSelect(searchCondition);
	
	print("length:"+getLength(unload));
	
	
	var fc = new SCFile("formatctrl");
	fc.doSelect("name = \"cm3r\"");
	
	var record = fc.calculations[0];
	
	print(eval("record.delete"));
	*/
	var dbdict = new SCFile("dbdict");
	dbdict.doSelect("name =\"formatctrl\"");
	this.column = GetColumnInfo(dbdict);
	var tem = GetColumnInfo(dbdict);

	var str = showColumns(tem);
	print(str);

	/*
	var testTable = new SCFile("formatctrl");
	testTable.doSelect("name = \"cm3r\"");
	var resultStrings = FindForSingleTable("1",testTable,tem);
	for(var i=0;i<resultStrings.length;i++)
	{
		print(resultStrings[i]);
	}
	*/
}

/*
	Shows All the columns
	For debug only.
*/
function showColumns(columns)
{
	var str = "";
	
	str+="name:"+columns.name+"\n";
	str+="type:"+columns.type+"\n";
	str+="level:"+columns.level+"\n";
	if(columns.parent!=null)
	{
		str+="parent:"+columns.parent.name+"\n";
	}
	
	for(var i=0;i<columns.children.length;i++)
	{
		str+=showColumns(columns.children[i]);
	}
	
	return str;
}

/*
	Gets the length of a table record.
	For debug only.
*/

function getLength(file)
{
	var count = 0;
	while(file.getNext() == RC_SUCCESS)
	{
		print(file.DateFrom);
		count++;
	}
	return count;
}

/**
	Gets the full name of a column.
	For debug only.
*/
function GetFullName(column)
{
	var str = "";
	
	var tem = column;
	while(tem!=null)
	{
		str=tem.name+"."+str;
		tem = tem.parent;
	}
	return str;
}

/*
	Gets all tables appear in the unload table.
	For debug only
*/
function GetAllUnloadTables()
{
	Array.prototype.indexof=function(element)
	{
		for(var i =0;i<this.length;i++)
		{
			if(element == this[i])
			{
				return i;
			}
		}
		return -1;
		
	};
	//Gets all the table name from unload table
	var unload = new SCFile("unload");
	var result = unload.doSelect("true");
	var tables = new Array();	
	var count = 0;
	while(unload.getNext()==RC_SUCCESS)
	{
		if(unload.record.filename == "RAD")
		{
			continue;
		}
		if(tables.indexof(unload.record.filename)<0 
		&& unload.record.filename!=null && unload.record.filename!="")
		{
			tables[tables.length] = unload.record.filename;
		}
	}
	return tables;
}
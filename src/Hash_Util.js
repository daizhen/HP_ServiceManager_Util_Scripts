/*
	Hash Set
*/
function HashSet()
{
	this._object = new Object();
}

HashSet.prototype.exists = function(name)
{
	if(this._object[name] == undefined)
	{
		return false;
	}
	return true;
}

HashSet.prototype.add = function(name)
{
	if(!this.exists(name))
	{
		this._object[name] = true;
	}
}
HashSet.prototype.remove = function(name)
{
	if(this.exists(name))
	{
		delete this._object[name];
		
	}
}

HashSet.prototype.getAllValues = function()
{
	var valueArray = new Array();
	for(var i in this._object)
	{
		if(this._object[i]!=undefined)
		{
			valueArray.push(i);
		}
	}
	
	return valueArray;
}


/*
	Hash table
*/

function HashTable()
{
	this._object = new Object();
}

HashTable.prototype.exists = function(name)
{
	if(this._object[name] == undefined)
	{
		return false;
	}
	return true;
}

HashTable.prototype.add = function(name,value)
{
	if(!this.exists(name))
	{
		this._object[name] = value;
	}
}
HashTable.prototype.get = function(name)
{
	if(this.exists(name))
	{
		return this._object[name];
	}
	return undefined;
}
HashTable.prototype.remove = function(name)
{
	if(this.exists(name))
	{
		delete this._object[name];
		
	}
}

HashTable.prototype.getAllValues = function()
{
	var valueArray = new Array();
	for(var i in this._object)
	{
		if(this._object[i]!=undefined)
		{
			valueArray.push(this._object[i]);
		}
	}
	
	return valueArray;
}

HashTable.prototype.getKeyValueCollection = function()
{
	var keyValueCollection = new Array();
	for(var i in this._object)
	{
		if(this._object[i]!=undefined)
		{
			var tem = new Object();
			tem.key = i;
			tem.value = this._object[i];
			keyValueCollection.push(tem);
		}
	}
	
	return keyValueCollection;
}

function test()
{
	var hash = new HashSet();
	hash.add(1);
	hash.add(2);
	//hash.remove(1);
	
	print(hash.getAllValues());
	
}
//test();

function JsonEncodeArray(array)
{
	var result = [];
	
	for(var i= 0;i<array.length;i++)
	{
		var value = array[i];
		
		result.push(JsonEncode(value));
	}
	return '['+result.join(',')+']';
}
function JsonEncodeObject(obj)
{
	var result = [];
	for(var i in obj)
	{
		if(obj[i]!=undefined && typeof(obj[i]) !='function' && i != "$$children" )
		{
			var value = obj[i];
			var name ='"'+i+'":';
			result.push(name+JsonEncode(value));
		}
	}
	return '{'+result.join(',')+'}';
}

function JsonEncode(obj)
{
	if(typeof(obj)=='object')
	{
		//Array
		if(obj!=null && obj instanceof Array)
		{
			return JsonEncodeArray(obj);
		}
		else if(obj!=null && obj instanceof Date)
		{
			return '"'+Escape(obj.toString())+'"';
			//return obj.toString();
		}
		else
		{
			return JsonEncodeObject(obj);
		}
	}
	else
	{
		if(typeof(obj)=='string')
		{ 
			return '"'+Escape(obj)+'"';
		}
		else if(typeof(obj)=='number')
		{
			return obj;
		}
		else if(obj)
		{
			return '"'+Escape(obj.toString())+'"';
		}
		else
		{
			return "null";
		}
	}
}

function Escape(str)
{
	return str.replace(/\\/g,"\\\\").replace(/"/g,'\\\"').replace(/\r/g,"\\u000d").replace(/\n/g,"\\u000a");
}

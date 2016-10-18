function templateInfo()
{
	this.field;
	this.type;
	this.value;
	this.caption;
	this.globallist;
	this.display;
	this.fieldUsage;
	this.$$children = ['field','type','value','caption','globallist','display','fieldUsage'];
}
templateInfo.prototype.toSCFile = toSCFile;

function descriptor()
{
	this.name;
	this.sysmodtime;
	this.sysmodcount;
	this.sysmoduser;
	this.folder;
	this['default'];
	this.role = new Array();
	this.tablename;
	this.templateInfo = new Array();
	this.State;
	this.expression;
	this.expressions = new Array();
	this.$$children = ['name','sysmodtime','sysmodcount','sysmoduser','folder','default','role','tablename','templateInfo','State','expression','expressions'];
}
descriptor.prototype.toSCFile = toSCFile;

//-----------------Common methods-----------------------
Array.prototype.toSCFile = toSCFileFromArray;
function toSCFileFromArray()
{
	var scFile = new SCFile();
	scFile.setType(8);
	for(var i=0;i<this.length;i++)
	{
		if(this[i] && this[i].toSCFile)
		{
			scFile.push(this[i].toSCFile());
		}
		else
		{
			scFile.push(this[i]);
		}
	}
		//print(field+this[field]);
	return scFile;
}
function toSCFile()
{
	var scFile = new SCFile();
	scFile.setType(9);
	for(var i=0;i<this.$$children.length;i++)
	{
		var field = this.$$children[i];
		if(field != 'toSCFile')
		{
			if(this[field]==undefined)
			{
				scFile.push(null);
			}
			else
			{
				if(this[field] && this[field].toSCFile)
				{
					scFile.push(this[field].toSCFile());
				}
				else
				{
					scFile.push(this[field]);
				}
			}
		}
	}
	return scFile;
}

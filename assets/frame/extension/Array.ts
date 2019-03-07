interface Array<T> {
	clear() : void;
	contains(t : T) : boolean;
	removeAt(index : number) : void;
	remove(t : T) : boolean;
	insert(index : number, t : T) : void;
	frist() : T;
	last() : T;
	find(key : string, value) : T
}

Array.prototype.clear = function(){
	this.splice(0, this.length);
};

Array.prototype.contains = function(t){
	return this.indexOf(t) >= 0;	
};

Array.prototype.removeAt = function(index : number){
	this.splice(index, 1);
};

Array.prototype.remove = function(t){
	let index = this.indexOf(t);
	if (index < 0) {
		return false;
	}
	this.splice(index, 1);
	return true;
};

Array.prototype.insert = function(index : number, t){
	this.splice(index, 0, t);
};

Array.prototype.frist = function(){
	return this[0];
};

Array.prototype.last = function(){
	if (this.length <= 0) {
		return null;
	}
	return this[this.length-1];
};

Array.prototype.find = function(key, value){
	if (this.length <= 0) {
		return null;
	}
	for (let index = 0; index < this.length; index++) {
		const element = this[index];
		if (element[key] == value) {
			return element;
		}
	}
	return null;
};
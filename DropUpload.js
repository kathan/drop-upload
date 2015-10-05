/*
Darrel Kathan
10/21/14
This library is used to handle dragging and dropping of files into a web browser for upload to a server.
*/

function DropUpload(args){
	args['drop'] ? this.drop_el = $(args['drop']) : '';
	args['ondrop'] ? this.drop_func = args['ondrop'] : '';
	args['files'] ? this.files_el = $(args['files']) : '';
	args['dropped'] ? $(this).on('dropped', args['dropped']) : '';
	args['remove'] ? this.remove_func = args['remove'] : '';
	args['types'] ? this.types = args['types'] : '';
	args['feedback'] ? this.feedback_func = args['feedback'] : '';
	
	this.feedback = [];
	this.files = [];
	var thisObj = this;
	
	this.drop_el.addClass('dropUpload');
	this.drop_el.on('dragenter', function (e){
	    e.stopPropagation();
	    e.preventDefault();
	    $(thisObj.drop_el).addClass('dropUpload_hover');
	});
	this.drop_el.on('dragleave', function (e){
		thisObj.drop_el.removeClass('dropUpload_hover');
		e.stopPropagation();
		e.preventDefault();
	});
	
	this.drop_el.on('dragover', function (e){
		e.stopPropagation();
		e.preventDefault();
	});
	
	function findFile(file, cb){
		//for(var i = 0; i < thisObj.files.length; i++){
		if(thisObj.files.length > 0){
			$.each(thisObj.files,function(i, cur_file){
				//if(thisObj.files[i].name == file.name){
				if(cur_file.name == file.name){
					cb(cur_file);
				}else if(i+1 >= thisObj.files.length){
					cb();
				}
			});
		}else{
			cb();
		}
	}
	
	this.drop_el.on('drop', function (e){
		var files = e.originalEvent.dataTransfer.files;
		window.setTimeout(function(){
			$(thisObj.drop_el).removeClass('dropUpload_hover');
			e.preventDefault();
			$(thisObj).trigger('drop_start');
			//for (var i = 0; i < e.originalEvent.dataTransfer.files.length; i++) {
				//var file = e.originalEvent.dataTransfer.files[i];
			$.each(files, function(idx, file){
				findFile(file, function(found){
					if(!found){
						thisObj.files.push(file);
						file.addForm = function(form){
							$(this).data('form', form);
						}
						$(thisObj).trigger('dropped', [file]);
						/*if(thisObj.dropped_func && $.isFunction(thisObj.dropped_func)){
							thisObj.dropped_func(file);
						}*/
					}
					if(idx+1 >= files.length){
						$(thisObj).trigger('drop_done', [files]);
					}
				});
			});
			//}
			if(thisObj.drop_func && $.isFunction(thisObj.drop_func)){
				thisObj.drop_func(files);
			}
		},0);
	});
	
	$(document).on('dragenter', function (e){
		e.stopPropagation();
		e.preventDefault();
	});
	
	$(document).on('dragover', function (e){
		e.stopPropagation();
		e.preventDefault();
		
	});
	
	$(document).on('drop', function (e) {
		e.stopPropagation();
		e.preventDefault();
	});
 	
 	this.upload = function(uploadURL, cb){
		var sending = []
			, thisObj = this;
   		$.each(this.files, function(idx, file){
        	var form_data;
        	var fd = $(file).data('form');
        	if(fd){
	        	if(fd.isPrototypeOf(FormData)){
    	    		form_data = fd;
        		}else{
        			form_data = new FormData(fd);
        		}
        	}else{
        		form_data = new FormData();
        	}
        	form_data.append('file', file);
        	
        	sending.push(file.name);
        	$(file).trigger('upload_start', [form_data]);
        	thisObj.sendFileToServer(uploadURL, file, form_data, function(data, s, xhr){
        		var idx = sending.indexOf(file.name);
        		idx > -1 ? sending.splice(idx, 1) : '';
        		if(sending.length == 0){
        			if(cb && $.isFunction(cb)){
	        			cb();
	        		}
	        	}
	        	$(file).trigger('uploaded', [data, s, xhr]);
        	});
		});
	}

	this.clear = function(){
		this.files = [];
	}
	
	this.removeByIndex = function(i){
		this.files.splice(i, 1);
	}
	
	this.remove = function(i){
		if(i === parseInt(i, 10)){
			this.removeByIndex(i);
		}else{
			this.removeByName(i);
		}
	}
	
	this.removeByName = function(name){
		for(var i = 0; this.files.length > i ; i++){
			if(this.files[i].name == name){
				this.files.splice(i, 1);
			}
		}
	}
	
	this.sendFileToServer = function(uploadURL, file, formData, cb){
    	var extraData ={}; //Extra Data.
    	var jqXHR=$.ajax({
            xhr: function() {
            	var xhrobj = $.ajaxSettings.xhr();
            	if (xhrobj.upload) {
                    	xhrobj.upload.addEventListener('progress', function(event) {
                        	var percent = 0;
                        	var position = event.loaded || event.position;
                        	var total = event.total;
                        	if (event.lengthComputable) {
                            	percent = Math.ceil(position / total * 100);
                        	}
                        	//Set progress
                        	$(file).trigger('update', [percent]);
                    	}, false);
                	}
            	return xhrobj;
        	},
    	error:function(a,b,c){
    		thisObj.feedback.push(c);
    	},
    	url: uploadURL,
    	type: "POST",
    	contentType:false,
    	processData: false,
        	cache: false,
        	data: formData,
        	success: function(data, s, xhr){
            	cb(data, s, xhr);
        	},
        	error:function(a,b,c){
        		thisObj.feedback.push(c);
        		cb(a,b,c);
        	}
    	});
	}
}
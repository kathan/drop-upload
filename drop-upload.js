/*******************************************
* drop-upload.js
* Copyright (c) 2016, Darrel Kathan 
* Licensed under the MIT license.
*
* A current version and some documentation is available at
*    https://github.com/kathan/drop-upload
*
* @description drop-upload is used to handle dragging, dropping and uploading of files within an HTML5 compliant web browser.
* @file        drop-upload.js
* @version     1.0
* @author      Darrel Kathan
* @license     MIT
*******************************************/

function DropUpload(args) {
  var drop_el = document.querySelector(args.targetElement),
      files = [],
      du_hover = args.hoverClass || 'du-hover',
      uploading = false,
      form_data,
      class_name_ary;
      
  args.formElement ? form_data = document.querySelector(args.formElement) : null;
  args.dropped ? drop_el.addEventListener('dropped', args.dropped) : '';
  
  drop_el.addEventListener('dragenter', (e) => {
    addClass(du_hover);
    e.stopPropagation();
    e.preventDefault();
  });
  
  drop_el.addEventListener('dragend', (e) => {
    removeClass(du_hover);
  });
  
  drop_el.addEventListener('dragleave', (e) => {
    removeClass(du_hover);
    e.stopPropagation();
    e.preventDefault();
  });

  drop_el.addEventListener('dragover', (e) => {
    addClass(du_hover);
    e.stopPropagation();
    e.preventDefault();
  });
  
  function splitName(){
    if(!class_name_ary){
      class_name_ary = drop_el.className.split(/ /);
    }
  }
  
  function addClass(className){
    splitName();
    if(class_name_ary.indexOf(className) === -1){
      class_name_ary.push(className);
      drop_el.className = class_name_ary.join(' ');
    }
  }
  
  function removeClass(className){
    splitName();
    var idx = class_name_ary.indexOf(className);
    if(idx > -1){
      class_name_ary.splice(idx, 1);
      drop_el.className = class_name_ary.join(' ');
    }
  }
  
  function findFile(file) {
    if (files.length > 0) {
      for(var i in files){
        var cur_file = files[i];
        if (cur_file.name === file.name) {
          return cur_file;
        }
      }
    }
  }

  drop_el.addEventListener('drop', (e) => {
    var l_files = e.dataTransfer.files;
    window.setTimeout(() => {
      removeClass(du_hover);
      e.preventDefault();
      drop_el.dispatchEvent(new Event('drop_start'));
      //document.querySelector(self).trigger('drop_start');
      for(var i in l_files){
        var file = l_files[i];
        if (file instanceof File && !findFile(file)) {
          file.progress = 0;
          files.push(file);
          file.addForm = (form) => {
            document.querySelector(this).data('form', form);
          };
          drop_el.dispatchEvent(new CustomEvent('file-dropped', {detail: file}));
          //self.dispatchEvent(new Event('dropped'), [file]);
        }
      }
      drop_el.dispatchEvent(new CustomEvent('files-dropped', {detail: files}));
    }, 0);
  }, false);

  document.addEventListener('dragenter', (e) => {
    e.stopPropagation();
    e.preventDefault();
  });

  document.addEventListener('dragover', (e) => {
    e.stopPropagation();
    e.preventDefault();

  });

  document.addEventListener('drop', (e) => {
    e.stopPropagation();
    e.preventDefault();
  });

  drop_el.upload = function(uploadURL, cb) {
    var sending = [];
    uploading = true;
    for(var i in files){
      var file = files[i];
      if (typeof form_data === 'object'&& form_data.isPrototypeOf(HTMLFormElement)) {
        form_data = new FormData(form_data);
      } else {
        form_data = new FormData();
      }
      form_data.append('file', file);

      sending.push(file.name);
      drop_el.dispatchEvent(new CustomEvent('upload-start', {'detail': form_data}));
      sendFileToServer(uploadURL, file, form_data, (data, s, xhr) => {
        var idx = sending.indexOf(file.name);
        idx > -1 ? sending.splice(i, 1) : '';
        if (sending.length === 0) {
          if (cb && cb.toString() === '[object Function]') {
            cb();
          }
        }
        drop_el.dispatchEvent(new CustomEvent('uploaded', {'detail': [data, s, xhr, file]}));
      });
    }
  };

  drop_el.clear = function() {
    files = [];
  };

  drop_el.removeByIndex = function(i) {
    files.splice(i, 1);
  };

  drop_el.remove = function(i) {
    if (i === parseInt(i, 10)) {
      this.removeByIndex(i);
    } else {
      this.removeByName(i);
    }
  };

  drop_el.removeByName = function(name) {
    for (var i = 0; files.length > i; i++) {
      if (files[i].name == name) {
        files.splice(i, 1);
      }
    }
  };

  function sendFileToServer (uploadURL, file, formData, cb) {
    var xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("abort", (e) =>{
      drop_el.dispatchEvent(new CustomEvent('abort', {'detail': file}));
    });

    xhr.upload.addEventListener("error", (e) => {
      drop_el.dispatchEvent(new CustomEvent('progress', {'detail': file}));
    });

    xhr.upload.addEventListener("load", (e) => {
      drop_el.dispatchEvent(new CustomEvent('load', {'detail': file}));
    });
    
    xhr.upload.addEventListener('progress', (event) => {
      var position = event.loaded || event.position,
          total = event.total;
      file.progress = Math.ceil(position / total * 100);
      
      drop_el.dispatchEvent(new CustomEvent('progress', {'detail': file}));
    });
    xhr.open('POST', uploadURL);
    xhr.send(formData);
  }
  return drop_el;
}

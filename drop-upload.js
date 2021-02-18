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

const DropUpload = args => {
  var drop_el = document.querySelector(args.targetElement),
      file_cb = null,
      files = [],
      du_hover = args.hoverClass || 'du-hover',
      uploading = false,
      form_data;
  if(!drop_el){
    throw new Error(`Cannot find element ${args.targetElement}`);
  }
      
  const headers = args.headers || {};
  args.fileCallback ? file_cb = document.querySelector(args.fileCallback) : null,
  args.formElement ? form_data = document.querySelector(args.formElement) : null;
  args.dropped ? drop_el.addEventListener('dropped', args.dropped) : '';
  
  drop_el.addEventListener('dragenter', e => {
    drop_el.classList.add(du_hover);
    e.stopPropagation();
    e.preventDefault();
  });
  
  drop_el.addEventListener('dragend', e => {
    drop_el.classList.remove(du_hover);
    e.stopPropagation();
    e.preventDefault();
  });
  
  drop_el.addEventListener('dragleave', e => {
    drop_el.classList.remove(du_hover);
    e.stopPropagation();
    e.preventDefault();
  });
  
  drop_el.addEventListener('dragexit', e => {
    drop_el.classList.remove(du_hover);
    e.stopPropagation();
    e.preventDefault();
  });

  drop_el.addEventListener('dragover', e => {
    drop_el.classList.add(du_hover);
    e.stopPropagation();
    e.preventDefault();
  });

  const findFile = file => {
    if (files.length > 0) {
      for(var i = 0; i < files.length; i++){
        var cur_file = files[i];
        if (cur_file.name === file.name) {
          return cur_file;
        }
      }
    }
  }

  drop_el.addEventListener('drop', e => {
    var l_files = e.dataTransfer.files;
    window.setTimeout(() => {
      drop_el.classList.remove(du_hover);
      e.preventDefault();
      drop_el.dispatchEvent(new Event('drop_start'));
      //document.querySelector(self).trigger('drop_start');
      for (var i = 0; i < l_files.length; i++) {
        var file = l_files.item(i);
        if(file_cb && typeof file_cb.toString() === 'function'){
          file_cb((file, reply) => {
            if(reply !== false){
              if (file instanceof File && !findFile(file)) {
                file.progress = 0;
                files.push(file);
                file.addForm = form => {
                  this.form = form;
                };
                file.getForm = () => {
                  return this.form;
                };
              }
            }
          });
        }else{
          if (file instanceof File && !findFile(file)) {
            file.progress = 0;
            files.push(file);
            file.addForm = form => {
              this.form = form;
            };
            file.getForm = () => {
              return this.form;
            };
          }
        }
      }
      
      drop_el.dispatchEvent(new CustomEvent('files-dropped', {detail: files}));
    }, 0);
  }, false);

  document.addEventListener('dragenter', e => {
    e.stopPropagation();
    e.preventDefault();
  });

  document.addEventListener('dragover', e => {
    e.stopPropagation();
    e.preventDefault();
  });

  document.addEventListener('drop', e => {
    e.stopPropagation();
    e.preventDefault();
  });

  var sending = [];
  drop_el.upload = (uploadURL, cb) => {
    
    uploading = true;
    for(var i = 0; i < files.length; i++){
      send_file(uploadURL, files[i], cb);
    }
  };
  
  function send_file(uploadURL, file, cb){
    if(file.form && file.form.toString() === '[object HTMLFormElement]'/* && file.form.isPrototypeOf(HTMLFormElement)*/){
      //if (typeof form_data === 'object' && form_data.isPrototypeOf(HTMLFormElement)) {
      form_data = new FormData(file.form);
    } else {
      form_data = new FormData();
    }
    form_data.append('file', file);

    sending.push(file.name);
    drop_el.dispatchEvent(new CustomEvent('upload-start', {'detail': form_data}));
    sendFileToServer(uploadURL, file, form_data, (data, s, xhr) => {
      var idx = sending.indexOf(file.name);
      idx > -1 ? sending.splice(idx, 1) : '';
      if (sending.length === 0) {
        drop_el.dispatchEvent(new CustomEvent('uploaded'));
        if (cb && cb.toString() === '[object Function]') {
          return cb();
        }
      }
    });
  }
  
  drop_el.getFiles = () => {
    return files;
  };
  
  drop_el.clear = () => {
    files = [];
  };

  drop_el.removeByIndex = i => {
    files.splice(i, 1);
  };

  drop_el.remove = i => {
    if (i === parseInt(i, 10)) {
      this.removeByIndex(i);
    } else {
      this.removeByName(i);
    }
  };

  drop_el.removeByName = name => {
    for (var i = 0; files.length > i; i++) {
      if (files[i].name === name) {
        files.splice(i, 1);
      }
    }
  };

  function sendFileToServer (uploadURL, file, formData, cb) {
    var xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("abort", e => {
      drop_el.dispatchEvent(new CustomEvent('abort', {'detail': file}));
      cb();
    });

    xhr.upload.addEventListener("error", e => {
      drop_el.dispatchEvent(new CustomEvent('progress', {'detail': file}));
      cb();
    });

    xhr.addEventListener('load', e => {
      console.log('drop-upload.files', files);
      drop_el.removeByName(file.name);
      drop_el.dispatchEvent(new CustomEvent('load', {detail: {responseType:xhr.responseType, responseText:xhr.responseText, file:file}}));
      cb();
    });
    
    xhr.upload.addEventListener('progress', event => {
    //xhr.addEventListener('progress', function(event){
      var position = event.loaded || event.position,
          total = event.total;
      file.progress = Math.ceil(position / total * 100);
      
      drop_el.dispatchEvent(new CustomEvent('progress', {'detail': file}));
    });
    xhr.open('POST', uploadURL);
    for(let i in headers){
      xhr.setRequestHeader(i, headers[i]);
    }
    xhr.send(formData);
  }
  return drop_el;
};

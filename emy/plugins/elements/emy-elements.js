// Emy Elements Plugin
// This plugin brings most commonly used UI elements in an app
(function() {
emy.plugin.elements = {

	busy: false,
	ready : false,
	loaded : false,

	init : function() {
		if(!this.loaded) {
			this.loaded = true;

			emy.createElement = function(obj) {
				// forked from Pinterest bookmarklet
				// this function returns a DOM element from a given obj
				// ex: {'div':{'id':'myid','class':'myclass'}} generates <div id='myid' class='myclass'>
				var el = false, tag, att;
				for (tag in obj) {
					if (obj[tag].hasOwnProperty) {
						el = document.createElement(tag);
						for (att in obj[tag]) {
							if (obj[tag][att].hasOwnProperty) {
								if (typeof obj[tag][att] === 'string') {
									if(att==='_text')
										el.innerHTML=obj[tag][att];
									else
										el.setAttribute(att, obj[tag][att]);
								}
							}
						}
						break;
					}
				}
				return el;
			}

			document.addEventListener('click', emy.plugin.elements.clickHandler, false);

			var selects = emy.$('select');
			if(selects) {
				for(var i=0,inb=selects.length;i<inb;i++) {
					if(selects[i].getAttribute('data-selectmenu')=='true') {
						emy.plugin.elements.selectMenu.generate(selects[i]);
					}
				}
			}

			this.ready = true;
		}
	},

	clickHandler : function() {
		// for buttons
		var element = emy.findParent(event.target, "button");
		if(element) 
		{
			var segmentViewId = element.getAttribute('data-segmentview');
			if(segmentViewId) {
				var segmentList = emy.findParent(element, 'ul');
				for(var i=0,inb=segmentList.childNodes.length;i<inb;i++) {
					if(segmentList.childNodes[i].nodeType==1) {
						emy.changeClass(segmentList.childNodes[i],'active','');
					}
				}
				emy.addClass(element.parentNode, 'active');
				var segmentViews = emy.$('#'+emy.getSelectedView().id+' .emy-segments-view');
				if(segmentViews) {
					for(var i=0,inb=segmentViews.length;i<inb;i++) {
						emy.changeClass(segmentViews[i],'show','');
					}
				}
				emy.addClass(emy.$('#'+segmentViewId), 'show');
				return;
			}

			var stepperVal = element.getAttribute('data-stepper');
			if(stepperVal) 
			{
				element.setAttribute('selected','true');
				setTimeout(function(){ element.removeAttribute('selected'); },100);

				stepperVal = parseInt(stepperVal);
				var stepperList = emy.findParent(element, 'ul');
				var stepperInput = emy.$('#'+stepperList.getAttribute('data-stepinput'));
				stepperVal = parseInt(stepperInput.value)+(stepperVal);
				var stepperMinVal = stepperInput.getAttribute('min');
				var stepperMaxVal = stepperInput.getAttribute('max');
				if(stepperMinVal && stepperVal < parseInt(stepperMinVal))
					return;
				else if(stepperMaxVal && stepperVal > parseInt(stepperMaxVal))
					return;
				else
					stepperInput.value = stepperVal;
				var stepperCb = stepperList.getAttribute('data-callback');
				if(stepperCb) eval(stepperCb)(element, stepperVal);
				return;
			}

		}

		// for label - aka form inputs
		var element = emy.findParent(event.target, "label");
		if(element) {
			var inputList = emy.findParent(element, 'ul');
            if(inputList) {
                var inputCb = inputList.getAttribute('data-callback');
                if(inputCb) {
                    var inputElement = emy.$('#'+element.getAttribute('for'));
                    var inputValue = inputElement.value;
                    eval(inputCb)(inputElement, inputValue);
                }
            }
			return;
		}
	},


	selectMenu : {
	
		generate : function(el, opt) {
			// generate a span to put values in it
			var selectSpan = emy.createElement({'span':{'id':el.id+'-value','_text':'---'}});
			el.parentNode.appendChild( selectSpan );

			// create selectmenu view
			// get title from label
			var selectViewTitle = 'Select';
			for(var i=0,inb=el.parentNode.childNodes.length;i<inb;i++) {
				if(el.parentNode.childNodes[i].nodeName.toLowerCase()=='label') {
					if(el.parentNode.childNodes[i].getAttribute('for')==el.id)
						selectViewTitle = el.parentNode.childNodes[i].innerHTML;
				}
			}
			if(el.multiple)
				var selectView = emy.createElement({'section':{'id':'selectmenu-'+el.id,'data-title':selectViewTitle,'data-multiple':'true'}});
			else
				var selectView = emy.createElement({'section':{'id':'selectmenu-'+el.id,'data-title':selectViewTitle}});

			// generate a link on top of label+select
			// since onclick event on select does not work
			var selectLink = emy.createElement({
                'a':{
                    'href':     '#selectmenu-'+el.id,
                    'class':    'selectmenu',
                    '_text':    selectViewTitle
                }
            });
			el.parentNode.appendChild(selectLink);            
            
            // generate a list of links in this view
			var selectList = emy.createElement({'ul':{'class':'selectview'}});
			for(var i=0,inb=el.options.length;i<inb;i++) {
				if(el.options[i].value !='')
				{
					if(el.options[i].previousElementSibling===null) {
						var optgroup = emy.findParent(el.options[i],'optgroup');
						if(optgroup)
							selectList.innerHTML += '<li class="group">'+optgroup.getAttribute('label')+'</li>';
					}
					if(el.options[i].selected) {
						var selectClass='active';
						if(el.multiple) {
							selectSpan.innerHTML += el.options[i].innerHTML+', ';
						} else {
							selectSpan.innerHTML = el.options[i].innerHTML;
						}
					} else
						var selectClass='';
					selectList.innerHTML += '<li><a class="'+selectClass+'" data-selectvalue="'+el.options[i].value+'">'+el.options[i].innerText+'</a></li>';
				}
			}
			if(el.multiple && selectSpan.innerHTML!='---')
				selectSpan.innerHTML = selectSpan.innerHTML.substr(0,selectSpan.innerHTML.length-2);
			
			selectView.appendChild(selectList);
			selectView.addEventListener('click',function(e) {
				if(e.target.nodeName.toLowerCase()=='a') {
					var selectValue = e.target.getAttribute('data-selectvalue');
					if(selectValue) {
						emy.plugin.elements.selectMenu.select(e.target, selectValue);
					}
				}
			}, true);
			emy.insertViews(selectView, false);
		},
	
		select : function(link, val) {
			var selectView = emy.findParent(link,'section');
			var selectElement = emy.$('#'+selectView.id.substr(11));
			var selectList = emy.$('#'+selectView.id+' a');
			if(selectView.getAttribute('data-multiple')) 
			{
				var selectValue = link.getAttribute('data-selectvalue');
				// select the option in the select element
				for(var i=0,inb=selectElement.length;i<inb;i++) {
					if(selectElement[i].value == selectValue) {
						if(emy.hasClass(link,'active')) {
							emy.changeClass(link,'active','');
							selectElement[i].removeAttribute('selected');
						} else {
							emy.addClass(link,'active');
							selectElement[i].setAttribute('selected','selected');
						}
					}
				}

				// showing multiple values in a SPAN
				var selectSpan = emy.$('#'+selectView.id.substr(11)+'-value');
				selectSpan.innerHTML = '';
				for(var i=0,inb=selectList.length;i<inb;i++) {
					if(emy.hasClass(selectList[i],'active'))
						selectSpan.innerHTML += selectList[i].innerHTML+', ';
				}
				selectSpan.innerHTML = selectSpan.innerHTML.substr(0,selectSpan.innerHTML.length-2);

			}
			else
			{
				// remove the active class from list options
				for(var i=0,inb=selectList.length;i<inb;i++) {
					emy.changeClass(selectList[i],'active','');
				}
				// set the clicked option as active
				emy.addClass(link,'active');

				// select the option in the select element
				// select / unselect options - is that needed?
				for(var i=0,inb=selectElement.options.length;i<inb;i++) {
					if(selectElement.options[i].getAttribute('value')==val)
						selectElement.options[i].setAttribute('selected','selected');
					else
						selectElement.options[i].removeAttribute('selected');
				}
				// set value
				selectElement.value = val;

				// showing values in a SPAN
				var selectSpan = emy.$('#'+selectView.id.substr(11)+'-value');
				selectSpan.innerHTML = link.innerHTML;
				
				emy.goBack();
			}
			
			var selectCb = selectElement.getAttribute('data-callback');
			if(selectCb) eval(selectCb)(selectElement);
		}
	}
};


document.addEventListener('emy-ready', emy.plugin.elements.init);
})();
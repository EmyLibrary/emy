window.igapp = {

	clientId : 		'd4cb22ef9b7642e386e595206b69864f',
	responseUrl : 'http://www.remi-grumeau.com/projects/emy/demos/instagram/',
	scope : 			'likes+comments+relationships',

	token : null,
	isDoubleTap : null,
	friends : [],

	showLoader : function(txt)
	{
		if(!emy.$('#loader')) {
			var a = document.createElement('div');
			a.id="loader";
			a.setAttribute("class","hide");
			a.innerHTML = '<span>'+txt+'</span>';
			document.body.appendChild(a);
		} else {
			emy.$('#loader').innerHTML = '<span>'+txt+'</span>';
		}
		emy.$('#loader').style.display = '';
		setTimeout(function() { emy.$('#loader').className = ''; },1);
	},

	hideLoader : function() {
		emy.$('#loader').className = 'hide';
		setTimeout(function() { emy.$('#loader').style.display = 'none'; },300);
	},


	init : function()
	{
  	  igapp.showLoader('Init...');
			// reuse previously set - Instagram's token does not revoke
  	  if(localStorage) {
  	  	if(localStorage.getItem('token'))
  	  		initialHash='#access_token='+localStorage.getItem('token');
  	  }
			if(initialHash.indexOf('access_token')>-1)
			{
				igapp.token = initialHash.substr(14);
	  	  if(localStorage)
	  	  	localStorage.setItem('token', igapp.token);
				igapp.login();
			} else
	  	  igapp.hideLoader();
	},


	login : function()
	{
		if(igapp.token)
		{
			igapp.showLoader('Login...');
			var url = 'apicall.php';
			var params = {
				'url' : 'https://api.instagram.com/v1/users/self/?access_token='+igapp.token+'&ts='+(new Date().getTime())
			};
			emy.ajax(url, params, 'get', function(res)
			{
				if(res.readyState==4 && res.status==200 && res.responseText)
				{
					try {
						igapp.user = JSON.parse(res.responseText).data;
						emy.$('#home').className = '';
						emy.$('#homeList').innerHTML='';
						igapp.getFeed();
					}
					catch(e) {
						localStorage.removeItem('token');
						initialHash=null;
						igapp.token=null;
						setTimeout(igapp.init, 10);
					}
				}
			});
		}
		else
			window.location = 'https://api.instagram.com/oauth/authorize/?client_id='+igapp.clientId+'&redirect_uri='+igapp.responseUrl+'&response_type=token&scope='+igapp.scope+'&ts='+(new Date().getTime());
	},

	logout : function()
	{
		if(localStorage)
			localStorage.removeItem('token');
		window.location = 'https://instagram.com/accounts/manage_access';
	},

	likeIt : function(id)
	{
		if(emy.$('#p'+id).getAttribute('data-liked')!='true') {
			igapp.showLoader('Love is in the air...');
			var url = 'apicall.php';
			var params = {
				'url' : 'https://api.instagram.com/v1/media/'+id+'/likes',
				'access_token' : igapp.token,
				'ts' : (new Date().getTime())
			};
			emy.ajax(url, params, 'post', function(res)
			{
				if(res.readyState==4 && res.status==200 && res.responseText)
				{
					var response = JSON.parse(res.responseText);
					emy.log(res.responseText);
					if(response.meta.code==200)
					{
						emy.$('#p'+id).setAttribute('data-liked', 'true');
						emy.$('#p'+id).className='liked';

						var l = emy.$('#like'+id);
						l.className='liked';
						if(l.innerHTML.indexOf(' likes') > -1)
							l.innerHTML = (parseInt(l.innerHTML)+1) + ' likes';
						else
							l.innerHTML = '<a class="user" href="javascript:igapp.getProfile('+igapp.user.id+')">@'+igapp.user.username+'</a>, ' + l.innerHTML;

						setTimeout(function() { emy.$('#p'+id).className=''; 	igapp.showLoader('Liked!'); }, 400);
						setTimeout(function() { igapp.hideLoader(); }, 1000);
					}
					else if(response.meta.code==400) {
						igapp.showLoader('OOOPS... API limitation error :/');
						setTimeout(function() { igapp.hideLoader(); }, 1000);
					}
					else
						alert(response.meta.error_message);
				}
			});
		}
		else
		{
			igapp.showLoader('You already like this');
			setTimeout(function() { igapp.hideLoader(); }, 600);
		}
	},

	unlikeIt : function(id)
	{
		if(emy.$('#p'+id).getAttribute('data-liked')=='true') {
			igapp.showLoader('Heart breaker sent...');
			var url = 'apicall.php';
			var params = {
				'url' : 'https://api.instagram.com/v1/media/'+id+'/likes',
				'access_token' : igapp.token,
				'delete' : 'true',
				'ts' : (new Date().getTime())
			};
			emy.ajax(url, params, 'post', function(res)
			{
				if(res.readyState==4 && res.status==200 && res.responseText)
				{
					var response = JSON.parse(res.responseText);
					if(response.meta.code==200)
					{
						emy.$('#p'+id).removeAttribute('data-liked');
						var l = emy.$('#like'+id);

						l.className='like';
						if(l.innerHTML.indexOf(' likes') > -1)
							l.innerHTML = (parseInt(l.innerHTML)-1) + ' likes';
						else {
							var a='';
							var likes = l.innerHTML.split(',');
							for(var i=0;i<likes.length;i++) {
								if(likes[i].indexOf('@'+igapp.user.username) == -1)
									a += likes[i]+', ';
							}
							a = a.substr(0,(a.length-2));
							l.innerHTML = a;
							a=null;
						}

						setTimeout(function() { igapp.showLoader('unliked!'); }, 200);
						setTimeout(function() { igapp.hideLoader(); }, 600);
					}
					else
						alert(response.meta.error_message);
				}
			});
		}
		else
		{
			igapp.showLoader('You already like this');
			setTimeout(function() { igapp.hideLoader(); }, 600);
		}
	},


	doubleTap : function(id)
	{
		if(igapp.isDoubleTap!=id)
			igapp.isDoubleTap=id;
		else {
			(emy.$('#p'+id).getAttribute('data-liked')=='true')?igapp.unlikeIt(id):igapp.likeIt(id);
		    igapp.isDoubleTap=null;
		}
		setTimeout(function() { igapp.isDoubleTap=null; }, 800);
	},



	getFeed : function()
	{
		if(igapp.token)
		{
			igapp.showLoader('Loading feed...');

			var url = 'apicall.php';
			var params = {
				'url' : 'https://api.instagram.com/v1/users/self/feed?access_token='+igapp.token
			};
			emy.ajax(url, params, 'get', function(res)
			{
				if(res.readyState==4 && res.status==200 && res.responseText)
				{
					igapp.showLoader('rendering feed...');
					igapp.feed = JSON.parse(res.responseText).data;
					var a='';
					var b=igapp.feed;
					for(var i=0,inb=b.length;i<inb;i++) 
					{
						igapp.friends[b[i].user.id] = b[i].user;
                        a += igapp.generatePicture(b[i]);
					}
					emy.$('#homeList').innerHTML = a;
					likes=null;
					a=null;
					b=null;

					setTimeout(igapp.hideLoader, 10);
				}
			});
		} else
			igapp.login();
	},



    getPicture: function(pId, cb)
    {
        if(igapp.pictures[pId])
            cb();
        else
        {
            var url = 'apicall.php';
            var params = {
              'url' : 'https://api.instagram.com/v1/media/'+pId+'?access_token='+igapp.token
            };
            emy.ajax(url, params, 'get', function(res)
            {
              if(res.readyState==4 && res.status==200 && res.responseText)
              {
                var b = JSON.parse(res.responseText);
                igapp.pictures[pId] = b;
                cb();
              }
            });
        }
    },

    generatePicture: function(datas)
    {
        var a = '';
        var b = datas;
        a += '<article id="'+b.id+'">'+"\n";
        a += '	<header style="background-image: url('+b.user.profile_picture+')"><h3><a href="javascript:igapp.getProfile('+b.user.id+')">'+b.user.full_name+'</a></h3>';
        if(b.user.website)
            a += '<a class="website" href="'+b.user.website+'" target="_blank" onclick="return confirm(\'Open this website in a new tab?\')">'+b.user.website+'</a>';
        a += '</header>'+"\n";
        var img = (screen.width < 480)?b.images.low_resolution:b.images.standard_resolution;
        a += '	<picture><img id="p'+b.id+'" src="'+img.url+'" width="'+screen.width+'" height="'+screen.width+'" onclick="igapp.doubleTap(\''+b.id+'\')" ';
        if(b.user_has_liked)
            a += ' data-liked="true"';
        a += '><figcaption>';
        a += '</figcaption></picture>'+"\n";
        a += '	<aside>';

        var likes = b.likes.data;
        var likeClass = (b.user_has_liked)?'liked':'like';
        if(b.likes.count<8) {
            a += '		<p id="like'+b.id+'" class="'+likeClass+'">';
            for(var l=0,lnb=b.likes.data.length;l<lnb;l++) {
            	console.log(l);
                a += '<a class="user" href="javascript:igapp.getProfile('+likes[l].id+')">@'+likes[l].username+'</a>, ';
            }
            a = a.substr(0, (a.length-2));
        } else {
            a += '		<p id="like'+b.id+'" src="'+img.url+'" class="'+likeClass+'">'+b.likes.count+' likes</p>';
        }

        a += '		<div class="comments">';
        if(b.caption) {
            var comment = b.caption.text.replace(/(^|\s)#(\w+)/g, '$1<a class="hashtag" href="javascript:igapp.searchByHashtag(\'$2\')">#$2</a>');
            a += '		<p class="comment"><a class="user" href="javascript:igapp.getProfile('+b.user.id+')" data-pic="'+b.user.profile_picture+'">@'+b.caption.from.username+'</a> '+comment+'</p>';
        }
        if(b.comments.count!=0) {
            var comments=b.comments.data;
            for(var c=0,cnb=b.comments.count;c<cnb;c++) {
                if(comments[c]) {
                    var comment = comments[c].text.replace(/(^|\s)#(\w+)/g, '$1<a class="hashtag" href="javascript:igapp.searchByHashtag(\'$2\')">#$2</a>');
                    a += '		<p class="comment"><a class="user" href="javascript:igapp.getProfile('+comments[c].from.id+')" data-pic="'+comments[c].from.profile_picture+'">@'+comments[c].from.username+'</a> '+comment+'</p>'+"\n";
                }
            }
        }
        a += '		</div>'+"\n";
        a += '	</aside>'+"\n";
        a += '</article>'+"\n";
        return a;
    },

    showPicture : function()
    {
		igapp.showLoader('soon...');
		setTimeout(igapp.hideLoader, 900);
    },



	getProfile : function(id)
	{
		if(igapp.token)
		{
			igapp.showLoader('Loading profile...');

			if(igapp.friends[id] && igapp.friends[id].counts == 'object')
				igapp.generateProfile(id);
			else
      {
        var url = 'apicall.php';
        var params = {
          'url' : 'https://api.instagram.com/v1/users/'+id+'?access_token='+igapp.token
        };
        emy.ajax(url, params, 'get', function(res)
        {
          if(res.readyState==4 && res.status==200 && res.responseText)
          {
            var b = JSON.parse(res.responseText);
            if(b.meta.error_type) {
                alert(b.meta.error_message);
                igapp.hideLoader();
            }
            if(b.data)
            {
              igapp.friends[b.data.id] = b.data;
              igapp.generateProfile(b.data.id);
            }
          }
        });
			}
		} else
			igapp.login();
	},

	generateProfile : function(id)
	{
        igapp.showLoader('rendering profile...');
        var user = igapp.friends[id];
        if(user) {
            var a = document.createElement('section');
            var b ='';
            b += '<section id="user_profile" data-title="Profile" class="panel" data-onload="igapp.getProfileMedia('+id+')">'+"\n";
            b += '    <header class="header">'+"\n";
            b += '      <img src="'+user.profile_picture+'"></p>'+"\n";
            b += '      <strong>'+((user.full_name)?user.full_name:user.username)+'</strong></p>'+"\n";
            b += '      <div>'+"\n";
            b += '        <p><span>'+user.counts.media+'</span>photos</p>'+"\n";
            b += '        <p><span>'+user.counts.followed_by+'</span>followers</p>'+"\n";
            b += '        <p><span>'+user.counts.follows+'</span>following</p>'+"\n";
            b += '      </div>'+"\n";
            b += '    </header>'+"\n";
            if(user.bio!='') {
                b += '    <aside>'+"\n";
                bio = user.bio.replace(/(^|\s)#(\w+)/g, '$1<a class="hashtag" href="javascript:igapp.searchByHashtag(\'$2\')">#$2</a>');
                b += '      <p>'+bio+'</p>'+"\n";
                if(user.website!='')
                    b += '      <p><a href="'+user.website+'" target="_blank">'+user.website+'</a></p>'+"\n";
                b += '    </aside>'+"\n";
            }
            b += '</section>'+"\n";
            a.innerHTML = b;
            emy.insertViews(a);
            a=null;
        }
		igapp.getProfilePics(id);
	},

	getProfilePics : function(id)
	{
	    igapp.showLoader('Loading user pictures...');
        var url = 'apicall.php';
        var params = {
            'url' : 'https://api.instagram.com/v1/users/'+id+'/media/recent?access_token='+igapp.token
        };
        emy.ajax(url, params, 'get', function(res) {
            if(res.readyState==4 && res.status==200 && res.responseText)
            {
                var photos = JSON.parse(res.responseText);
                if(photos.data)
                {
                    var thumbs = document.createElement('article');
                    thumbs.id='user_pictures';
                    thumbs.className='gallery';
                    for(var i=0,inb=photos.data.length;i<inb;i++) {
                        var pic = document.createElement('a');
                        pic.className='imgThumb';
//                        pic.setAttribute('href','#photo');
                        pic.setAttribute('href','javascript:igapp.showPicture("'+photos.data[i].id+'")');
 						pic.setAttribute('data-photoid', photos.data[i].id);
                        if(photos.data[i].comments.count!=0)
                            pic.setAttribute('title', photos.data[i].comments.data[0].text);
                        pic.innerHTML='<img src="'+photos.data[i].images.thumbnail.url+'">';
                        thumbs.appendChild(pic);
                    }
                    emy.$('#user_profile').appendChild(thumbs);
                    igapp.showLoader('Cooking the gallery for you...');
					setTimeout(function() { igapp.hideLoader(); }, 900);
                }
            }
        });
    },

    searchByHashtag : function(hashValue)
    {
	    igapp.showLoader('Asking API for "'+hashValue+'" ...');
        var url = 'apicall.php';
        var params = {
            'url' : 'https://api.instagram.com/v1/tags/'+hashValue+'/media/recent?access_token='+igapp.token
        };
        emy.ajax(url, params, 'get', function(res) {
            if(res.readyState==4 && res.status==200 && res.responseText)
            {
                var photos = JSON.parse(res.responseText);
                emy.log(photos);
                if(photos.data)
                {
                    var tempFrag = document.createElement('div');
                    var a = document.createElement('section');
                    a.id='hash-'+hashValue;
                    a.className='blueBg';
                    a.setAttribute('data-title', '#'+hashValue+'');
                    var thumbs = document.createElement('article');
                    thumbs.id='hash-'+hashValue+'-gallery';
                    thumbs.className='gallery';
                    for(var i=0,inb=photos.data.length;i<inb;i++) {
                        var pic = document.createElement('a');
                        pic.className='imgThumb';
                        pic.setAttribute('href','javascript:igapp.showPicture("'+photos.data[i].id+'")');
                        pic.setAttribute('data-photoid', photos.data[i].id);
                        if(photos.data[i].comments.count!=0)
                            pic.setAttribute('title', photos.data[i].comments.data[0].text);
                        pic.innerHTML='<img src="'+photos.data[i].images.thumbnail.url+'">';
                        thumbs.appendChild(pic);
                    }
                    a.appendChild(thumbs);

                    var loadmore = document.createElement('a');
                    loadmore.href="javascript:igapp.loadMore('hash','"+hashValue+"', "+photos.pagination.next_max_id+")";
                    loadmore.id="hash-"+hashValue+'-loadmore';
                    loadmore.className="mainButton";
                    loadmore.innerHTML = 'Load more';
                    a.appendChild(loadmore);

                    tempFrag.appendChild(a);
                    emy.insertViews(tempFrag);
                    igapp.showLoader('Cooking the gallery for you...');
					setTimeout(function() { igapp.hideLoader(); }, 900);
                }
            }
        });
    },


    loadMore : function(mode, val, next_id)
    {
        if(mode=='hash')
        {
            igapp.showLoader('Loading more...');
            emy.$('#hash-'+val+'-loadmore').innerHTML = 'Loading...';
            var url = 'apicall.php';
            var params = {
                'url' : 'https://api.instagram.com/v1/tags/'+val+'/media/recent?access_token='+igapp.token+'&max_id='+next_id
            };
            emy.ajax(url, params, 'get', function(res) {
                if(res.readyState==4 && res.status==200 && res.responseText)
                {
                    igapp.showLoader('Cooking the gallery for you...');
                    var photos = JSON.parse(res.responseText);
                    emy.log(photos);
                    var frag = document.createDocumentFragment();
                    for(var i=0,inb=photos.data.length;i<inb;i++) {
                        var pic = document.createElement('a');
                        pic.className='imgThumb';
                        pic.setAttribute('href','javascript:igapp.showPicture("'+photos.data[i].id+'")');
                        pic.setAttribute('data-photoid', photos.data[i].id);
                        if(photos.data[i].comments.count!=0)
                            pic.setAttribute('title', photos.data[i].comments.data[0].text);
                        pic.innerHTML='<img src="'+photos.data[i].images.thumbnail.url+'">';
                        frag.appendChild(pic);
                    }
                    emy.$('#hash-'+val+'-gallery').appendChild(frag);

                    var loadmore = emy.$('#hash-'+val+'-loadmore');
                    loadmore.href="javascript:igapp.loadMore('hash','"+val+"', "+photos.pagination.next_max_id+")";
                    loadmore.innerHTML = 'Load more';

					igapp.hideLoader();
                }
            });
        }
    }
};

setTimeout(igapp.init, 1);
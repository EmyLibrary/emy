/*
   Copyright (c) 2013, Emy Project Members
   See LICENSE.txt for licensing terms
*/

(function() {

  emy.plugin.themeSwitcher = {

    defaultTheme: null,
    currentTheme: null,
    themes: [],

    init: function()
    {
      emy.log('themeSwitcher : init');
      var i=0, a=document.getElementsByTagName("link");
      for(i=0; i<a.length; i++)
      {
        if(a[i].getAttribute("type") == 'text/css' && a[i].getAttribute("title"))
        {
          emy.plugin.themeSwitcher.themes.push(a[i].getAttribute("title"));
          if (a[i].getAttribute("rel").indexOf("alternate")==-1)
          {
            emy.plugin.themeSwitcher.defaultTheme = emy.plugin.themeSwitcher.currentTheme = a[i].getAttribute("title");
          }
        }
      }
      if(window.localStorage) {
        if(localStorage.getItem("emy-theme"))
          emy.plugin.themeSwitcher.setTheme(localStorage.getItem("emy-theme"));
      }
    },

    setTheme: function(title)
    {
      emy.log('themeSwitcher : setTheme : '+title);
      if(title!=emy.plugin.themeSwitcher.currentTheme)
      {
        var i=0, a=document.getElementsByTagName("link");
        for(i=0; i<a.length; i++)
        {
          if(a[i].getAttribute("rel").indexOf("stylesheet") != -1 && a[i].getAttribute("title"))
          {
            emy.log(a[i]);
            if(a[i].getAttribute("title") == title)
              a[i].removeAttribute("disabled");
            else
              a[i].setAttribute("disabled","");
          }
        }
        emy.plugin.themeSwitcher.currentTheme=title;
      }
    },

    setDefaultTheme: function()
    {
      emy.log('themeSwitcher : setDefaultTheme');
      emy.plugin.themeSwitcher.setTheme(emy.plugin.themeSwitcher.defaultTheme);
    },

    rememberTheme : function(forget)
    {
      emy.log('themeSwitcher : rememberTheme');
      if(window.localStorage) {
        (forget)?localStorage.removeItem("emy-theme"):localStorage.setItem("emy-theme",emy.plugin.themeSwitcher.currentTheme);
      }
    },

    addTheme: function(title,link)
    {
      emy.log('themeSwitcher : addTheme');
      var theme = document.createElement("link");
      theme.type = "text/css";
      theme.title = title;
      theme.rel = "stylesheet alternate";
      theme.href = link;
      document.getElementsByTagName('head')[0].appendChild(theme);
      theme.onload = emy.plugin.themeSwitcher.themes.push(title);
    },

    removeTheme: function(title)
    {
      emy.log('themeSwitcher : removeTheme');
      var i, a, main;
      for(i=0; (a = document.getElementsByTagName("link")[i]); i++)
      {
        if(a.getAttribute("rel").indexOf("style") != -1
        && a.getAttribute("title"))
        {
          if(a.getAttribute("title") == title) {
            emy.plugin.themeSwitcher.themes.splice(title);
            document.getElementsByTagName('head')[0].removeChild(a);
          }
        }
      }
    }
  };


  // LOADS THE PLUGINS ONCE THE DOCUMENT IS FULLY LOADED
  document.addEventListener("DOMContentLoaded", emy.plugin.themeSwitcher.init, false);
})();

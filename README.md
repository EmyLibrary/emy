# Emy - Efficient Mobile web librarY

EMY is an Efficient Mobile web librarY to create mobile web applications using HTML5, CSS3 & Javascript. Our goal is not to recreate what JQuery Mobile or Sencha are doing, but to provide a simplier & lightweight [KISS](https://en.wikipedia.org/wiki/KISS_principle) alternative.

###Getting Started

Emy is a single-page application library, which means all "views" are part of the HTML onload. Then its anchor-based navigation mechanism deals with sliding between views, keeping support & sync with the browser/device navigation stack (aka browser's back button). 

```html
<body>

    <header class="toolbar">
      <div><a id="backButton" class="button" href="#"></a></div>
      <h1 id="viewTitle"></h1>
    </header>

    <section id="first" data-title="First View" selected="true">
        <a href="#second">Go to second view</a>
    </section>

    <section id="second" data-title="Second View" class="panel">
      My second view.
    </section>

</body>
```
Feel free to [test this code live on Codio](http://bit.ly/1f6FaZR).

Of course, external/additionnal views can be added after onload, by linking to an external html document.

```html
<body>

    <header class="toolbar">
      <div><a id="backButton" class="button" href="#"></a></div>
      <h1 id="viewTitle"></h1>
    </header>

    <section id="first" data-title="First View" selected="true">
        <a href="second.html">Go to second view</a>
    </section>

</body>
```
index.html
```html
<section id="second" data-title="Second View" class="panel">
  My second view.
</section>
```
second.html

For further reading, check out this full [getting started tutorial](http://www.emy-library.org/documentation.html) on our website.

### Demos

Nothing fancy, we just create a few demo apps to show how easy you can create apps using Emy.
- [Interface demo](http://www.emy-library.org/demos/getting-started/interface.html): showcases all UI elements included by default in Emy
- [Playing with forms](http://www.emy-library.org/demos/getting-started/forms.html): to show how GET and POST form submission works
- [Music app](http://www.emy-library.org/demos/music/music.html): deep navigation example
- [Contact app](http://www.emy-library.org/demos/contacts/contacts.html): Offline capable static app
- [Notes app](http://www.emy-library.org/demos/notes/notes.html): Offline capable + dynamic content + custom theme
- [Maps app](http://www.emy-library.org/demos/maps/maps.html): Using third party APIs + onshow / onexit views events
- [Facebook app](http://www.emy-library.org/demos/facebook/): Generating elements based on API callbacks
- [Instagram app](http://www.emy-library.org/demos/instagram/): Responsive web design layout (yes, double tap to like/dislike works)
- [Chat app](http://www.emy-library.org/demos/chat/): Based on Firebase.io DaaS - Emy meets WebSockets & realtime communication


### Themes & extensions

Emy is lightweight & simple but you can [get some extensions & themes](http://www.emy-library.org/plugins.html) to enhance features or change its look'n'feel.

#### Supported platforms
You can expect a full & smooth experience on:
- iOS 6.x and above
- Android 4.x and above
- Blackberry 7, 10 and above
- WindowsPhone 8 and above
- Firefox OS 1.3 and above

It even works fine on desktop Safari, Chrome, Firefox & Internet Explorer 10 and above.

You might get some UI bugs yet have a functionnal app on "old" platforms as:
- iOS 5.x
- Android 2.3.x
- Blackberry 6
- WindowsPhone 7.5
- Firefox OS 1
- Latest Symbian series
- Opera Mobile

But we clearly have no plan to support IE < 10, Blackberry 4.x or NetFront.

### Community

Like the [Facebook page](https://www.facebook.com/emy.library)
Join the [Google+ Community page](https://plus.google.com/communities/100296077227732283069)
Follow us on [Twitter](https://twitter.com/emylibrary)
Join the [iPhoneWebDev mailing-list](https://groups.google.com/group/iphonewebdev) (iUI + Emy)

### Contributing

You can contribute to the project by reporting issues, suggesting new features, or submitting pull requests. Give the [Get involved page](http://www.emy-library.org/get-involved.html) a look to find out how.

# YoutubeWidgetic

Place newest video from selected Youtube Channel into web page.

![Snapshot](https://iiic.dev/images/youtube-widgetic-snapshot.png)

# What's new in version 0.4 ?
- script settings by json file
- possible preload images and prefetch video

# Use

Polyfill is in single javascript module file `youtubeWidgetic.mjs`. Include it into your site like this:

``` html
<div id="youtube-canvas" hidden></div>
<script type="text/json" id="youtube-widgetic-settings">
	{
		"youtubeApiKey": "AIzaSyDUXfwNP4_0kmG8aMLNlY7elAdRQZTFvBA",
		"channelId": "UCwroqcUF4nkMIKh-G9Vc-Eg",
		"modulesImportPath": "/modules",
		"preloadImages": [ "/images/youtube.svg" ],
		"texts": {
			"timePublished": "video published",
			"watchOnYoutube": "Watch on Youtube"
		}
	}
</script>
<script type="module" src="/youtubeWidgetic.mjs?v0.4" crossorigin="anonymous" integrity="sha256-XPGiNIYV9I1Mavs+kT3WFQNyk1pqYVdOBtSnPekOccQ="></script>
```

All other files like `example-usage.html` and `youtube-widgetic.css` are there to help, but they are not needed for polyfill function.

# Where to get Youtube API key?

Complete documentation at https://developers.google.com/youtube/v3/getting-started/ . For quick task with no reading lot of texts go straight into https://console.developers.google.com/apis/api/youtube.googleapis.com .

And good news… it's for free (with limited tasks per day)

# Services

Unpkg: https://unpkg.com/youtube-widgetic

NPM: https://www.npmjs.com/package/youtube-widgetic

# Licence

**CC BY-SA 4.0**

This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

-------

more info at https://iiic.dev/youtube-widgetic

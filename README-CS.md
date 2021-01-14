# YoutubeWidgetic

Do webové stránky umístí poslední video zvoleného Youtube kanálu

# Co je nového ve verzi 0.4 ?
- nastavení scriptu se provádí přes json
- možnost preload obrázků a prefetch videa

# Jak na to?

Potřebný je tu jediný soubor a to `youtubeWidgetic.mjs`. Ten vložit do stránky a spustit takto nějak:

``` html
<div id="youtube-canvas" hidden></div>
<script type="text/json" id="youtube-widgetic-settings">
	{
		"youtubeApiKey": "AIzaSyDUXfwNP4_0kmG8aMLNlY7elAdRQZTFvBA",
		"channelId": "UCwroqcUF4nkMIKh-G9Vc-Eg",
		"modulesImportPath": "/modules",
		"preloadImages": [ "/images/youtube.svg" ],
		"texts": {
			"timePublished": "video zveřejněno",
			"watchOnYoutube": "Sledovat na Youtube"
		}
	}
</script>
<script type="module" src="/youtubeWidgetic.mjs?v0.4" crossorigin="anonymous" integrity="sha256-XPGiNIYV9I1Mavs+kT3WFQNyk1pqYVdOBtSnPekOccQ="></script>
```

Není celý kód `<script type="module" src="youtubeWidgetic.mjs" crossorigin="anonymous"></script>` zbytečný? Fungovalo by to i bez něj. Jops, fungovalo, ale nešlo by bez něj zajistit kontrolu integrity javascriptového modulu. Bezpečnost je důležitá, pokud vás zajímá o bezpečnosti modulů více, čtěte zde: https://iiic.dev/subresource-integrity-check-u-javascriptovych-modulu

minimalistický příklad použití s nastavením je v souboru `example-usage.html` a příklad jak by mohly vypadat styly v souboru `youtube-widgetic.css`.

# Kde získat Youtube API key?

Kompletní návod na https://developers.google.com/youtube/v3/getting-started/ . Pokud spěcháte a návod se vám číst nechce jděte rovnou na https://console.developers.google.com/apis/api/youtube.googleapis.com .

A dobrá zpráva, je to zdarma (tedy pokud se spokojíte s omezeným množstvím dotazů za den, vychází to že se můžete API ptát na existenci nového videa zhruba co 15 minut)

# Možné problémy?

mjs přípona musí mít nastavený správný mime type a to `text/javascript`, pokud je to moc pracné přejmenujte koncovku z `.mjs` na `.js` . Více o modulech na https://www.vzhurudolu.cz/prirucka/js-moduly

# Služby

Unpkg: https://unpkg.com/youtube-widgetic

NPM: https://www.npmjs.com/package/youtube-widgetic

# Licence

**CC BY-SA 4.0**

This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

-------

Nějaké další info na https://iiic.dev/youtube-widgetic

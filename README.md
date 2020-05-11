# YoutubeWidgetic v 0.1
Na webové stránce zobrazuje nejnovější video zvoleného Youtube kanálu.


# Jak na to?

Potřebný je tu jediný soubor a to `youtubeWidgetic.mjs`. Ten vložit do stránky a spustit takto nějak:

``` html
	<div id="youtube-canvas" hidden></div>
	<script type="module" src="/youtubeWidgetic.mjs" integrity="sha256-TgPph03ykh6Bg7Pk4RG0UTggkAcPyKC79/vPXQIuja4=" crossorigin="anonymous"></script>
	<script type="module">
		import { YoutubeWidgetic } from '/youtubeWidgetic.mjs';
		new YoutubeWidgetic( 'your-youtube-api-key' );
	</script>
```

Není celý kód `<script type="module" src="youtubeWidgetic.mjs" integrity="sha256-TgPph03ykh6Bg7Pk4RG0UTggkAcPyKC79/vPXQIuja4=" crossorigin="anonymous"></script>` zbytečný? Fungovalo by to i bez něj. Jops, fungovalo, ale nešlo by bez něj zajistit kontrolu integrity javascriptového modulu. Bezpečnost je důležitá, pokud vás zajímá o bezpečnosti modulů více, čtěte zde: https://iiic.dev/subresource-integrity-check-u-javascriptovych-modulu

minimalistický příklad použití s nastavením je v souboru `example-usage.html` a příklad jak by mohly vypadat styly v souboru `example.css`.

# Nastavení

Je možné provést 4. parametrem konstruktoru.

# Možné problémy?

mjs přípona musí mít nastavený správný mime type a to `text/javascript`, pokud je to moc pracné přejmenujte koncovku z `.mjs` na `.js` . Více o modulech na https://www.vzhurudolu.cz/prirucka/js-moduly

# Licence

**CC BY-SA 4.0**

This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

-------

Nějaké další info na https://iiic.dev/youtube-widgetic

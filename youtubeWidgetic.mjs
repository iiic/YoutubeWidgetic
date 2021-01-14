/**
* @private
* @module YoutubeWidgeticPrivate
* @classdesc Privátní část vlastního widgetu pro nejnovější Youtube video… s nastavením, to je důležité.
* @author ic < ic.czech@gmail.com >
* @see https://iiic.dev/youtube-widgetic
* @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
* @since Q2 2020
* @version 0.4
* @readonly
*/
const YoutubeWidgeticPrivate = class
{

	static TYPE_STRING = 'String';
	static TYPE_ARRAY = 'Array';
	static TYPE_OBJECT = 'Object';
	static LINK_NODE_NAME = 'LINK';
	static ANCHOR_NODE_NAME = 'A';


	/**
	 * @public
	 * @type {Object}
	 * @description default settings… can be overwritten
	 */
	settings = {
		youtubeApiKey: null,
		channelId: 'UCwroqcUF4nkMIKh-G9Vc-Eg', // it's in youtube url
		rootElementId: 'youtube-canvas',
		youtubeApi: {
			origins: [ 'https://www.googleapis.com' ],
			search: '/youtube/v3/search',
			videos: '/youtube/v3/videos', // @feature request, not used now
			commentThreads: '/youtube/v3/commentThreads', // @feature request, not used now
		},
		cachingProxy: {
			origins: [],
			search: null,
			checkIfEmbeddableByServer: null,
		},
		CSSStyleSheets: [
			{ href: '/youtube-widgetic.css', integrity: 'sha256-jG+KXqX/CEM5hDYQK4k6Coa+yKZ7ClU00AswezCo/O0=' }
		],
		structure: [
			'title',
			'br',
			'video',
			'br',
			'description',
			'time',
			'br',
			'youtubeLink'
		],
		resultSnippetElements: {
			title: 'STRONG',
			video: 'FIGURE',
			videoInner: 'PICTURE',
			iFrameWrapper: 'DIV',
			description: 'FIGCAPTION',
			time: 'TIME',
			inLanguage: 'SPAN'
		},
		resultSnippetBehaviour: {
			allowLineBreak: true,
			linkToYoutubeInNewTab: true,
			setRootLang: true
		},
		texts: {
			timePublished: 'video published',
			watchOnYoutube: 'watch on Youtube',
			openInNewTabSuffix: ' ↗️',
		},
		preloadImages: [], // can be used if css contains images
		langDataSources: [ '/json/iso3166-1-to-iso639-1.json', 'https://iiic.dev/json/iso3166-1-to-iso639-1.json' ],
		prefetchVideo: true,
		clientCacheFor: 15 * 60, // in seconds
		nLastVideos: 3, // only if cachingProxy.checkIfEmbeddableByServer is set
		modulesImportPath: 'https://iiic.dev/js/modules',
		youtubeVideoShortPrefix: 'https://youtu.be/',
		youtubeVideoEmbedPrefix: 'https://www.youtube-nocookie.com/embed/', // https://www.youtube.com/embed/ or https://www.youtube-nocookie.com/embed/
		iFrame: {
			width: 320,
			height: 180,
		},
		autoRun: true,
	};

	/**
	 * @public
	 * @type {HTMLElement}
	 */
	rootElement = HTMLElement;

	/**
	* @public
	* @type {Object}
	*/
	youtubeData = Object;

	/**
	* @public
	* @type {Number}
	*/
	embeddableVideoNum = 0;


	async initImportWithIntegrity ( /** @type {Object} */ settings = null )
	{

		console.groupCollapsed( '%c YoutubeWidgeticPrivate %c initImportWithIntegrity %c(' + ( settings === null ? 'without settings' : 'with settings' ) + ')',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME,
			YoutubeWidgetic.CONSOLE.INTEREST_PARAMETER
		);
		console.debug( { arguments } );
		console.groupEnd();

		return new Promise( ( /** @type { Function } */ resolve ) =>
		{
			const ip = settings && settings.modulesImportPath ? settings.modulesImportPath : this.settings.modulesImportPath;
			import( ip + '/importWithIntegrity.mjs' ).then( ( /** @type {Module} */ module ) =>
			{
				/** @type {Function} */
				this.importWithIntegrity = module.importWithIntegrity;
				resolve( true );
			} ).catch( () =>
			{
				const SKIP_SECURITY_URL = '#skip-security-test-only'
				if ( window.location.hash === SKIP_SECURITY_URL ) {
					console.warn( '%c YoutubeWidgeticPrivate %c initImportWithIntegrity %c without security!',
						YoutubeWidgetic.CONSOLE.CLASS_NAME,
						YoutubeWidgetic.CONSOLE.METHOD_NAME,
						YoutubeWidgetic.CONSOLE.WARNING
					);
					this.importWithIntegrity = (/** @type {String} */ path ) =>
					{
						return new Promise( ( /** @type {Function} */ resolve ) =>
						{
							import( path ).then( ( /** @type {Module} */ module ) =>
							{
								resolve( module );
							} );
						} );
					};
					resolve( true );
				} else {
					throw 'Security Error : Import with integrity module is missing! You can try to skip this error by adding ' + SKIP_SECURITY_URL + ' hash into website URL';
				}
			} );
		} );
	}

	getEmbedLinkFromShortLink ( /** @type {String} */ href )
	{
		console.debug( '%c YoutubeWidgeticPrivate %c getEmbedLinkFromShortLink',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		return href.replace( this.settings.youtubeVideoShortPrefix, this.settings.youtubeVideoEmbedPrefix ) + '?autoplay=1';
	}

	async prepareLangFetches ()
	{
		console.debug( '%c YoutubeWidgeticPrivate %c prepareLangFetches',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		const promises = [];
		this.settings.langDataSources.forEach( ( /** @type {String} */ endpoint ) =>
		{
			promises.push(
				fetch( endpoint, {
					method: 'GET',
					credentials: 'omit',
					cache: 'force-cache',
					referrerPolicy: 'no-referrer',
					redirect: 'manual',
					mode: 'cors'
				} ).then( ( /** @type {Response} */ response ) =>
				{
					if ( response.ok ) {
						return response.json();
					}
				} )
			);
		} );
		return promises;
	}

	useClientCachedResource ()
	{
		console.debug( '%c YoutubeWidgeticPrivate %c useClientCachedResource',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		if ( this.settings.clientCacheFor && this.settings.clientCacheFor > 0 ) {
			const cacheTimestamp = localStorage.getItem( YoutubeWidgetic.cacheNames.timestamp );
			if ( cacheTimestamp && Number( cacheTimestamp ) > Date.now() - this.settings.clientCacheFor * 1000 ) {
				return true;
			}
		}
		return false;
	}

	async prepareApiFetches ()
	{
		console.debug( '%c YoutubeWidgeticPrivate %c prepareApiFetches',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		let promises = [];
		this.settings.youtubeApi.search.forEach( ( /** @type {URL} */ url ) =>
		{
			url.searchParams.set( 'channelId', this.settings.channelId );
			url.searchParams.set( 'part', 'snippet,id' );
			url.searchParams.set( 'order', 'date' );
			const maxResults = this.settings.cachingProxy.checkIfEmbeddableByServer ? this.settings.nLastVideos : 1;
			url.searchParams.set( 'maxResults', maxResults );

			if ( this.useClientCachedResource() ) {
				promises = [ JSON.parse( localStorage.getItem( YoutubeWidgetic.cacheNames.data ) ) ];
			} else {
				promises.push(
					fetch( url.href, {
						method: 'GET',
						credentials: 'omit',
						cache: 'no-cache',
						referrerPolicy: 'no-referrer',
						redirect: 'follow',
						mode: 'cors'
					} ).then( ( /** @type {Response} */ response ) =>
					{
						if ( response.ok ) {
							return response.json();
						}
					} )
				);
			}
		} );
		return promises;
	}

	elCreator = {
		br: () =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				if ( this.settings.resultSnippetBehaviour.allowLineBreak ) {
					this.rootElement.appendChild( document.createElement( 'BR' ) );
				}
				resolve( true );
			} );
		},
		title: () =>
		{
			const NAME = 'title';
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const tag = this.settings.resultSnippetElements[ NAME ];
				if ( tag ) {
					const el = document.createElement( tag );
					el.setAttribute( YoutubeWidgetic.MICRODATA.ITEMPROP, 'name' );
					el.className = 'fn';
					const titleText = this.youtubeData.items[ this.embeddableVideoNum ].snippet[ NAME ].replace( '&amp;', '&' );
					el.appendChild( document.createTextNode( titleText ) );
					this.rootElement.appendChild( el );
				}
				resolve( true );
			} );
		},
		video: () =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const tag = this.settings.resultSnippetElements.video;
				if ( tag ) {

					/** @type {HTMLAnchorElement} */
					const playLink = ( document.createElement( YoutubeWidgeticPrivate.ANCHOR_NODE_NAME ) );

					const videoData = this.youtubeData.items[ this.embeddableVideoNum ];
					playLink.href = this.settings.youtubeVideoShortPrefix + videoData.id.videoId;
					playLink.className = 'play';
					playLink.setAttribute( YoutubeWidgetic.MICRODATA.ITEMPROP, 'embedUrl' );
					playLink.addEventListener( 'click', ( /** @type {MouseEvent} */ event ) =>
					{
						event.preventDefault();
						event.stopPropagation();

						/** @type {HTMLElement} */
						const eventTarget = ( event.target );

						let rootElement = eventTarget;
						while ( rootElement && rootElement.nodeName !== YoutubeWidgeticPrivate.ANCHOR_NODE_NAME ) {
							rootElement = rootElement.parentElement;
						}

						/** @type {HTMLIFrameElement} */
						const iFrame = ( document.createElement( 'IFRAME' ) );
						iFrame.src = this.getEmbedLinkFromShortLink( rootElement.href );
						iFrame.className = 'player';
						iFrame.width = String( this.settings.iFrame.width );
						iFrame.height = String( this.settings.iFrame.height );
						iFrame.setAttribute( 'allow', 'autoplay; encrypted-media' );
						iFrame.setAttribute( 'allowfullscreen', '' );

						const wrapper = document.createElement( this.settings.resultSnippetElements.iFrameWrapper );
						const video = rootElement.lastElementChild;
						rootElement.parentNode.replaceChild( wrapper, rootElement );

						wrapper.appendChild( video );
						wrapper.firstElementChild.replaceChild( iFrame, video.firstElementChild );
					}, false );

					const thumbs = videoData.snippet.thumbnails;

					const wrapper = document.createElement( tag );
					const innerElement = document.createElement( this.settings.resultSnippetElements.videoInner );

					/** @type {HTMLSourceElement} */
					const source = ( document.createElement( 'SOURCE' ) );

					source.sizes = '(max-width:' + thumbs.high.width + 'px) 100vw, ' + thumbs.high.width + 'px';
					source.srcset = thumbs.default.url + ' ' + thumbs.default.width + 'w, ' + thumbs.medium.url + ' ' + thumbs.medium.width + 'w, ' + thumbs.high.url + ' ' + thumbs.high.width + 'w';
					innerElement.appendChild( source );

					/** @type {HTMLImageElement} */
					const img = ( document.createElement( 'IMG' ) );

					img.src = thumbs.high.url;
					img.alt = videoData.snippet.title;
					img.width = thumbs.high.width;
					img.height = thumbs.high.height;
					img.setAttribute( YoutubeWidgetic.MICRODATA.ITEMPROP, 'thumbnail thumbnailUrl' );
					innerElement.appendChild( img );
					wrapper.append( innerElement );
					playLink.appendChild( wrapper );
					this.rootElement.appendChild( playLink );
				}
				resolve( true );
			} );
		},
		description: () =>
		{
			const NAME = 'description';
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const tag = this.settings.resultSnippetElements[ NAME ];
				if ( tag ) {
					const videoData = this.youtubeData.items[ this.embeddableVideoNum ];
					if ( tag === 'FIGCAPTION' ) {
						const el = document.createElement( tag );
						el.setAttribute( YoutubeWidgetic.MICRODATA.ITEMPROP, NAME );
						el.appendChild( document.createTextNode( videoData.snippet[ NAME ] ) );
						this.rootElement.getElementsByTagName( this.settings.resultSnippetElements.video )[ 0 ].appendChild( el );
					} else {
						// @todo
					}
				}
				resolve( true );
			} );
		},
		time: () =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const tag = this.settings.resultSnippetElements.time;
				if ( tag ) {
					const videoData = this.youtubeData.items[ this.embeddableVideoNum ];
					const apiTimeString = videoData.snippet.publishTime ? videoData.snippet.publishTime : videoData.snippet.publishedAt;
					const time = new Date( apiTimeString );
					const timeElement = document.createElement( tag );
					timeElement.setAttribute( 'datetime', apiTimeString );
					timeElement.setAttribute( YoutubeWidgetic.MICRODATA.ITEMPROP, 'uploadDate' );
					timeElement.title = this.settings.texts.timePublished;
					timeElement.className = 'dt-published';
					timeElement.appendChild( document.createTextNode( time.toLocaleString() ) );
					this.rootElement.appendChild( timeElement );
				}
				resolve( true );
			} );
		},
		youtubeLink: () =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{

				/** @type {HTMLAnchorElement} */
				const link = ( document.createElement( YoutubeWidgeticPrivate.ANCHOR_NODE_NAME ) );

				link.href = this.settings.youtubeVideoShortPrefix + this.youtubeData.items[ this.embeddableVideoNum ].id.videoId;
				link.rel = 'enclosure';

				let linkText = this.settings.texts.watchOnYoutube;
				if ( this.settings.resultSnippetBehaviour.linkToYoutubeInNewTab ) {
					link.target = '_blank';
					linkText += this.settings.texts.openInNewTabSuffix;
				}
				link.appendChild( document.createTextNode( linkText ) );
				this.rootElement.appendChild( link );
				resolve( true );
			} );
		},
		inLanguage: ( /** @type {String} */ lang ) =>
		{
			const NAME = 'inLanguage';
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const tag = this.settings.resultSnippetElements[ NAME ];
				if ( tag ) {
					const el = document.createElement( tag );
					el.hidden = true;
					el.setAttribute( YoutubeWidgetic.MICRODATA.ITEMPROP, NAME );
					el.appendChild( document.createTextNode( lang ) );
					this.rootElement.appendChild( el );
				}
				resolve( true );
			} );
		}
	}

}

/**
* @public
* @module YoutubeWidgetic
* @classdesc Widget pro zobrazení nejnovějšího Youtube videa kanálu na vlastním webu
* @author ic < ic.czech@gmail.com >
* @see https://iiic.dev/youtube-widgetic
* @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
* @since Q2 2020
* @version 0.4
*/
export class YoutubeWidgetic
{

	/**
	 * @private
	 * @description '#private' is not currently supported by Firefox, so that's why '_private'
	 */
	_private;

	/**
	* @public
	* @description names of cache items stored in localStorage
	*/
	static cacheNames = {
		timestamp: 'YoutubeWidgetic.cacheTimestamp',
		data: 'YoutubeWidgetic.cachedData',
		num: 'YoutubeWidgetic.videoEmbeddableNum',
	}

	/**
	* @public
	* @description colors used for browser's console output
	*/
	static CONSOLE = {
		CLASS_NAME: 'color: gray',
		METHOD_NAME: 'font-weight: normal; color: green',
		INTEREST_PARAMETER: 'font-weight: normal; font-size: x-small; color: blue',
		EVENT_TEXT: 'color: orange',
		WARNING: 'color: red',
	};

	static MICRODATA = {
		ITEMPROP: 'itemprop',
		ITEMSCOPE: 'itemscope',
		ITEMTYPE: 'itemtype'
	};

	constructor ( /** @type {HTMLScriptElement | null} */ settingsElement = null )
	{
		console.groupCollapsed( '%c YoutubeWidgetic',
			YoutubeWidgetic.CONSOLE.CLASS_NAME
		);
		console.debug( '%c' + 'constructor',
			YoutubeWidgetic.CONSOLE.METHOD_NAME,
			[ { arguments } ]
		);

		this._private = new YoutubeWidgeticPrivate;

		/** @type {Object} */
		const settings = JSON.parse( settingsElement.text );

		this._private.initImportWithIntegrity( settings ).then( () =>
		{
			if ( settings ) {
				this.setSettings( settings ).then( () =>
				{
					if ( this.settings.autoRun ) {
						this.run();
					}
				} );
			} else if ( this.settings.autoRun ) {
				this.run();
			}
		} );
		console.groupEnd();
	}


	set rootElement ( /** @type {HTMLElement} */ htmlElement )
	{
		this._private.rootElement = htmlElement;
	}

	/**
	 * @description : get root element
	 * @returns {HTMLElement} root element
	 */
	get rootElement ()
	{
		return this._private.rootElement;
	}

	/**
	 * @description : get script settings
	 * @returns {Object} settings of self
	 */
	get settings ()
	{
		return this._private.settings;
	}

	/**
	 * @description : Get dynamic Import function
	 * @returns {Function}
	 */
	get importWithIntegrity ()
	{
		return this._private.importWithIntegrity;
	}

	get elCreator ()
	{
		return this._private.elCreator;
	}

	/**
	 * @returns {Object}
	 */
	get youtubeData ()
	{
		return this._private.youtubeData;
	}

	set youtubeData ( /** @type {Object} */ youtubeData )
	{
		this._private.youtubeData = youtubeData;
	}

	/**
	 * @returns {Number}
	 */
	get embeddableVideoNum ()
	{
		return this._private.embeddableVideoNum;
	}

	set embeddableVideoNum ( /** @type {Number} */ num )
	{
		this._private.embeddableVideoNum = num;
	}


	async setSettings ( /** @type {Object} */ inObject )
	{
		console.groupCollapsed( '%c YoutubeWidgetic %c setSettings',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);
		console.debug( { arguments } );
		console.groupEnd();

		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			if ( inObject.modulesImportPath ) {
				this.settings.modulesImportPath = inObject.modulesImportPath;
			}
			this.importWithIntegrity(
				this.settings.modulesImportPath + '/object/deepAssign.mjs',
				'sha256-qv6PwXwb5wOy4BdBQVGgGUXAdHKXMtY7HELWvcvag34='
			).then( ( /** @type {Module} */ deepAssign ) =>
			{
				new deepAssign.append( Object );
				this._private.settings = Object.deepAssign( this.settings, inObject ); // multi level assign
				resolve( true );
			} ).catch( () =>
			{
				Object.assign( this._private.settings, inObject ); // single level assign
				resolve( true );
			} );
		} );
	}

	async showResult ()
	{
		console.debug( '%c YoutubeWidgetic %c initRootElement %c(' + this.youtubeData.regionCode + ')',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME,
			YoutubeWidgetic.CONSOLE.INTEREST_PARAMETER
		);

		if ( this.settings.resultSnippetBehaviour.setRootLang && this.youtubeData.regionCode ) {
			const promises = await this._private.prepareLangFetches();
			Promise.any( promises ).then( ( /** @type {Object} */ json ) =>
			{
				this.rootElement.lang = json[ this.youtubeData.regionCode ];
				this._private.elCreator.inLanguage( json[ this.youtubeData.regionCode ] );
			} );
		}
		this.rootElement.hidden = false;
	}

	async prepareVideoVirtualDom ()
	{
		console.debug( '%c YoutubeWidgetic %c prepareVideoVirtualDom',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			this.settings.structure.forEach( ( /** @type {String} */ method ) =>
			{
				if ( method in this.elCreator ) {
					this.elCreator[ method ]();
				}
			} );
			resolve( true );
		} );
	}

	checkRequirements ()
	{
		console.debug( '%c YoutubeWidgetic %c checkRequirements',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		if ( !this.settings.youtubeApiKey ) {
			throw 'Youtube API Key is missing, get your own at https://developers.google.com/youtube/v3/getting-started';
		}
	}

	async makeRootElementSemantic ()
	{
		console.debug( '%c YoutubeWidgetic %c makeRootElementSemantic',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			this.rootElement.classList.add( 'hmedia' );
			this.rootElement.setAttribute( YoutubeWidgetic.MICRODATA.ITEMSCOPE, '' );
			this.rootElement.setAttribute( YoutubeWidgetic.MICRODATA.ITEMTYPE, 'https://schema.org/VideoObject' );
			resolve( true );
		} );
	}

	cacheFetchedResource ()
	{
		console.debug( '%c YoutubeWidgetic %c cacheFetchedResource',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		if ( this.settings.clientCacheFor && this.settings.clientCacheFor > 0 ) {
			this.findEmbeddableVideo().then( () =>
			{
				localStorage.setItem( YoutubeWidgetic.cacheNames.num, String( this.embeddableVideoNum ) );
				localStorage.setItem( YoutubeWidgetic.cacheNames.timestamp, String( Date.now() ) );
				localStorage.setItem( YoutubeWidgetic.cacheNames.data, JSON.stringify( this.youtubeData ) );
			} );
		}
	}

	async isEmbeddableVideoBy ( /** @type {URL} */ url, /** @type {Number} */ iterator )
	{
		console.debug( '%c YoutubeWidgetic %c isEmbeddableVideoBy',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			const item = this.youtubeData.items[ iterator ];
			url.searchParams.set( 'id', item.id.videoId );
			fetch( url.href, {
				method: 'GET',
				credentials: 'omit',
				cache: 'no-cache',
				referrerPolicy: 'no-referrer',
				redirect: 'manual',
				mode: 'cors'
			} ).then( ( /** @type {Response} */ response ) =>
			{
				if ( response.ok ) {
					return response.text();
				}
				return null;
			} ).then( ( /** @type {String} */ text ) =>
			{
				if ( text === 'true' ) {
					resolve( iterator );
				} else {
					if ( ( iterator + 1 ) >= this.settings.nLastVideos ) {
						resolve( 0 );
					} else {
						resolve( this.isEmbeddableVideoBy( url, iterator + 1 ) );
					}
				}
			} );
		} );
	}

	async findEmbeddableVideo ()
	{
		console.debug( '%c YoutubeWidgetic %c findEmbeddableVideo',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			const url = this.settings.cachingProxy.checkIfEmbeddableByServer;
			if ( url && url.constructor.name !== YoutubeWidgeticPrivate.TYPE_STRING ) {
				if ( this._private.useClientCachedResource() ) {
					this.embeddableVideoNum = Number( localStorage.getItem( YoutubeWidgetic.cacheNames.num ) );
					resolve( true );
					return true;
				}
				this.isEmbeddableVideoBy( url, 0 ).then( ( /** @type {Number} */ embeddableVideoNum ) =>
				{
					this.embeddableVideoNum = embeddableVideoNum;
					resolve( true );
				} );
			} else {
				resolve( true );
			}
		} );
	}

	/**
	 * @description : if cachingProxy is set it has importance and overwrites native API and constructs checkIfEmbeddableByServer
	 */
	constructApiUrls ()
	{
		const SLASH = '/';

		console.debug( '%c YoutubeWidgetic %c constructApiUrls',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		const constructOrigin = () =>
		{
			return window.location.protocol + '//' + window.location.hostname;
		};
		const constructURLsBy = ( /** @type {Array} */ origins, /** @type {String} */ current ) =>
		{
			const urlsOrigins = [];
			origins.forEach( ( /** @type {String} */ origin ) =>
			{
				if ( origin === SLASH ) {
					origin = constructOrigin();
				}
				const url = new URL( current, origin );
				url.searchParams.set( 'key', this.settings.youtubeApiKey );
				urlsOrigins.push( url );
			} );
			return urlsOrigins;
		}

		if (
			this.settings.cachingProxy.origins.constructor.name === YoutubeWidgeticPrivate.TYPE_ARRAY
			&& this.settings.cachingProxy.origins.length
		) { // caching has priority
			this.settings.youtubeApi.origins = this.settings.cachingProxy.origins;
		}
		Object.keys( this.settings.youtubeApi ).forEach( ( /** @type {String} */ key ) =>
		{
			const current = this.settings.youtubeApi[ key ];
			if ( current.constructor.name !== YoutubeWidgeticPrivate.TYPE_ARRAY ) {
				this.settings.youtubeApi[ key ] = constructURLsBy( this.settings.youtubeApi.origins, current );
			}
		} );
		if (
			this.settings.cachingProxy.checkIfEmbeddableByServer
			&& this.settings.cachingProxy.checkIfEmbeddableByServer.constructor.name === YoutubeWidgeticPrivate.TYPE_STRING
		) {
			const origin = this.settings.youtubeApi.origins[ 0 ] === SLASH ? constructOrigin() : this.settings.youtubeApi.origins[ 0 ];
			this.settings.cachingProxy.checkIfEmbeddableByServer = new URL( this.settings.cachingProxy.checkIfEmbeddableByServer, origin );
		}
	}

	async fetchNewestVideo ()
	{
		console.debug( '%c YoutubeWidgetic %c fetchNewestVideo',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		const promises = await this._private.prepareApiFetches();
		return Promise.any( promises ).then( ( /** @type {Object} */ json ) =>
		{
			if ( !json ) {
				throw 'Error : Failed fetching data from Youtube API, have you got correct API key?';
			}
			if ( json.pageInfo.totalResults <= 0 ) {
				throw 'Error : Videos not found. It\'s channelId filled correctly?';
			}
			if ( json.constructor.name !== YoutubeWidgeticPrivate.TYPE_OBJECT ) {
				throw 'Error : Data type returned from API is corrupted';
			}
			this.youtubeData = json;
		} );
	}

	preloadImages ()
	{
		console.groupCollapsed( '%c YoutubeWidgetic %c preloadImages',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);
		console.debug( this.settings.preloadImages );

		this.settings.preloadImages.forEach( ( /** @type {URL|String} */ url ) =>
		{

			/** @type {String} */
			const href = ( url.constructor.name === YoutubeWidgeticPrivate.TYPE_STRING ) ? url : url.href;

			/** @type {HTMLLinkElement} */
			const link = document.createElement( YoutubeWidgeticPrivate.LINK_NODE_NAME );

			link.rel = 'preload';
			link.href = href;
			link.as = 'image';
			// link.setAttribute( 'crossorigin', 'anonymous' ); // cannot be anonymous !
			document.head.appendChild( link );
		} );

		console.groupEnd();
	}

	initRootElement ()
	{
		console.debug( '%c YoutubeWidgetic %c initRootElement',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		this.rootElement = document.getElementById( this.settings.rootElementId );
	}

	prefetchVideo ()
	{
		console.debug( '%c YoutubeWidgetic %c prefetchVideo',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		if ( this.settings.prefetchVideo ) {

			/** @type {HTMLLinkElement} */
			const link = document.createElement( YoutubeWidgeticPrivate.LINK_NODE_NAME );

			link.rel = 'prefetch';
			link.href = this._private.getEmbedLinkFromShortLink( this.rootElement.querySelector( YoutubeWidgeticPrivate.ANCHOR_NODE_NAME ).href );
			link.as = 'document'; // for iframe
			document.head.appendChild( link );
		}
	}

	async addCSSStyleSheets ()
	{
		console.debug( '%c YoutubeWidgetic %c addCSSStyleSheets',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			const usedStyleSheets = new Set();
			[ ...document.styleSheets ].forEach( ( /** @type {CSSStyleSheet} */ css ) =>
			{
				if ( css.disabled === false ) {
					usedStyleSheets.add( css.href );
				}
			} );
			this.settings.CSSStyleSheets.forEach( ( /** @type {Object} */ assignment ) =>
			{
				let url = URL;
				if ( assignment.href.startsWith( 'https://', 0 ) || assignment.href.startsWith( 'http://', 0 ) ) {
					url = new URL( assignment.href );
				} else {
					url = new URL( assignment.href, window.location.protocol + '//' + window.location.hostname );
				}
				if ( !usedStyleSheets.has( url.href ) ) {
					fetch( url.href, {
						method: 'HEAD',
						credentials: 'omit',
						cache: 'force-cache',
						referrerPolicy: 'no-referrer',
						redirect: 'manual',
						mode: 'cors'
					} ).then( ( /** @type {Response} */ response ) =>
					{
						if ( response.ok ) {
							return true;
						} else {
							throw 'error';
						}
					} ).then( () =>
					{
						/** @type {HTMLLinkElement} */
						const link = document.createElement( YoutubeWidgeticPrivate.LINK_NODE_NAME );

						link.href = url.href;
						link.rel = 'stylesheet';
						link.setAttribute( 'crossorigin', 'anonymous' );
						if ( assignment.integrity ) {
							link.integrity = assignment.integrity;
						}
						document.head.appendChild( link );
					} ).catch( () =>
					{
						resolve( false );
					} );
				}
			} );
			resolve( true );
		} );
	}

	run ()
	{
		console.groupCollapsed( '%c YoutubeWidgetic %c run',
			YoutubeWidgetic.CONSOLE.CLASS_NAME,
			YoutubeWidgetic.CONSOLE.METHOD_NAME
		);

		this.checkRequirements();
		this.addCSSStyleSheets();
		this.initRootElement();
		this.constructApiUrls();
		this.fetchNewestVideo().then( () =>
		{
			this.cacheFetchedResource();
			this.makeRootElementSemantic();
			this.prepareVideoVirtualDom().then( () =>
			{
				this.prefetchVideo();
			} );
			this.showResult();
			this.preloadImages();
		} );

		console.groupEnd();

		return true;
	}
};

new YoutubeWidgetic( document.getElementById( 'youtube-widgetic-settings' ) );

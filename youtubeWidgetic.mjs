/**
* @private
* @module YoutubeWidgeticPrivate
* @classdesc Privátní část vlastního widgetu pro nejnovější Youtube video… s nastavením, to je důležité.
* @author ic < ic.czech@gmail.com >
* @see https://iiic.dev/youtube-widgetic
* @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
* @since Q2 2020
* @version 0.3
* @readonly
*/
const YoutubeWidgeticPrivate = class
{

	/**
	 * @public
	 * @type {Object}
	 * @description default settings… can be overwritten
	 */
	settings = {
		youtubeApi: {
			origin: 'https://www.googleapis.com',
			search: '/youtube/v3/search',
			videos: '/youtube/v3/videos', // @feature request, not used now
			commentThreads: '/youtube/v3/commentThreads', // @feature request, not used now
		},
		cachingProxy: {
			origin: null,
			search: null,
			checkIfEmbeddableByServer: null,
		},
		structure: [
			'title',
			'br',
			'video',
			'br',
			'description',
			'time',
			'br',
			'youtubeLink',
		],
		resultSnippetElements: {
			title: 'STRONG',
			video: 'FIGURE',
			videoInner: 'PICTURE',
			iFrameWrapper: 'DIV',
			description: 'FIGCAPTION',
			time: 'TIME',
		},
		resultSnippetBehaviour: {
			allowLineBreak: true,
			linkToYoutubeInNewTab: true,
		},
		texts: {
			timePublished: 'video zveřejněno',
			watchOnYoutube: 'Sledovat na YouTube',
			openInNewTabSuffix: ' ↗️',
		},
		clientCacheFor: 15 * 60, // in seconds
		nLastVideos: 3, // only if cachingProxy.checkIfEmbeddableByServer is set
		modulesImportPath: 'https://iiic.dev/js/modules',
		youtubeVideoShortPrefix: 'https://youtu.be/',
		youtubeVideoEmbedPrefix: 'https://www.youtube.com/embed/',
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
	rootElement = document.getElementById( 'youtube-canvas' );

	/**
	 * @public
	 * @type {String}
	 */
	channelId = 'UCwroqcUF4nkMIKh-G9Vc-Eg';

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
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const el = this.settings.resultSnippetElements.title;
				if ( el ) {
					const title = document.createElement( el );
					title.setAttribute( 'itemprop', 'name' );
					title.className = 'fn';
					const titleText = this.youtubeData.items[ this.embeddableVideoNum ].snippet.title.replace( '&amp;', '&' );
					title.appendChild( document.createTextNode( titleText ) );
					this.rootElement.appendChild( title );
				}
				resolve( true );
			} );
		},
		video: () =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const el = this.settings.resultSnippetElements.video;
				if ( el ) {
					const LINK_NODE_NAME = 'A';

					/** @type {HTMLLinkElement} */
					const playLink = ( document.createElement( LINK_NODE_NAME ) );

					const videoData = this.youtubeData.items[ this.embeddableVideoNum ];
					playLink.href = this.settings.youtubeVideoShortPrefix + videoData.id.videoId;
					playLink.className = 'play';
					playLink.addEventListener( 'click', ( /** @type {MouseEvent} */ event ) =>
					{
						event.preventDefault();
						event.stopPropagation();

						/** @type {HTMLElement} */
						const eventTarget = ( event.target );

						let rootElement = eventTarget;
						while ( rootElement && rootElement.nodeName !== LINK_NODE_NAME ) {
							rootElement = rootElement.parentElement;
						}

						/** @type {HTMLIFrameElement} */
						const iFrame = ( document.createElement( 'IFRAME' ) );

						//@ts-ignore
						iFrame.src = rootElement.href.replace( this.settings.youtubeVideoShortPrefix, this.settings.youtubeVideoEmbedPrefix ) + '?autoplay=1';

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

					const wrapper = document.createElement( el );
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
					img.setAttribute( 'itemprop', 'thumbnail thumbnailUrl' );
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
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const el = this.settings.resultSnippetElements.description;
				if ( el ) {
					const videoData = this.youtubeData.items[ this.embeddableVideoNum ];
					if ( el === 'FIGCAPTION' ) {
						const figcaption = document.createElement( el );
						figcaption.setAttribute( 'itemprop', 'description' );
						figcaption.appendChild( document.createTextNode( videoData.snippet.description ) );
						this.rootElement.getElementsByTagName( this.settings.resultSnippetElements.video )[ 0 ].appendChild( figcaption );
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
				const el = this.settings.resultSnippetElements.time;
				if ( el ) {
					const videoData = this.youtubeData.items[ this.embeddableVideoNum ];
					const apiTimeString = videoData.snippet.publishTime ? videoData.snippet.publishTime : videoData.snippet.publishedAt;
					const time = new Date( apiTimeString );
					const timeElement = document.createElement( el );
					timeElement.setAttribute( 'datetime', apiTimeString );
					timeElement.setAttribute( 'itemprop', 'uploadDate' );
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

				/** @type {HTMLLinkElement} */
				const link = ( document.createElement( 'A' ) );

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
* @version 0.3
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
	cacheNames = {
		timestamp: 'YoutubeWidgetic.cacheTimestamp',
		data: 'YoutubeWidgetic.cachedData',
		num: 'YoutubeWidgetic.videoEmbeddableNum',
	}

	constructor (
		/** @type {String} */ youtubeApiKey,
		/** @type {String | null} */ channelId = null,
		/** @type {HTMLElement | null} */ rootElement = null,
		/** @type {Object | null} */ settings = null
	)
	{
		this._private = new YoutubeWidgeticPrivate;

		this.youtubeApiKey = youtubeApiKey;
		if ( channelId ) {
			this.channelId = channelId;
		}
		if ( rootElement ) {
			this.rootElement = rootElement;
		}
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

	set channelId ( /** @type {String} */ channelId )
	{
		this._private.channelId = channelId;
	}

	/**
	 * @returns {String}
	 */
	get channelId ()
	{
		return this._private.channelId;
	}

	set youtubeApiKey ( /** @type {String} */ youtubeApiKey )
	{
		this._private.youtubeApiKey = youtubeApiKey;
	}

	/**
	 * @returns {String}
	 */
	get youtubeApiKey ()
	{
		return this._private.youtubeApiKey;
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
		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			if ( inObject.modulesImportPath ) {
				this.settings.modulesImportPath = inObject.modulesImportPath;
			}
			// @ts-ignore
			import( this.settings.modulesImportPath + '/object/deepAssign.mjs' ).then( ( /** @type {Module} */ deepAssign ) =>
			{
				new deepAssign.append( Object );
				// @ts-ignore
				this._private.settings = Object.deepAssign( this.settings, inObject ); // multi level assign
				resolve( true );
			} ).catch( () =>
			{
				Object.assign( this._private.settings, inObject ); // single level assign
				resolve( true );
			} );
		} );
	}

	showResult ()
	{
		this.rootElement.hidden = false;
	}

	async prepareVideoVirtualDom ()
	{
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

	checkApiKey ()
	{
		if ( !this.youtubeApiKey ) {
			throw 'Youtube API Key is missing, get your own at https://developers.google.com/youtube/v3/getting-started';
		}
	}

	async makeRootElementSemantic ()
	{
		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			this.rootElement.classList.add( 'hmedia' );
			this.rootElement.setAttribute( 'itemscope', '' );
			this.rootElement.setAttribute( 'itemtype', 'https://schema.org/VideoObject' );
			resolve( true );
		} );
	}

	checkReturnedData ()
	{
		if ( typeof this.youtubeData !== 'object' ) {
			throw 'Fetching data from Youtube failed';
		}
	}

	async isEmbeddableVideoBy ( /** @type {URL} */ url, /** @type {Number} */ iterator )
	{
		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			const item = this.youtubeData.items[ iterator ];
			url.searchParams.set( 'id', item.id.videoId );
			fetch( url.href, {
				cache: 'no-cache'
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
		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			const url = this.settings.cachingProxy.checkIfEmbeddableByServer;
			if ( url && typeof url !== 'string' ) {
				if ( this.useClientCachedResource() ) {
					this.embeddableVideoNum = Number( localStorage.getItem( this.cacheNames.num ) );
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

	constructApiUrls ()
	{
		const ORIGIN_KEY = 'origin';
		const origin = this.settings.cachingProxy[ ORIGIN_KEY ] ? this.settings.cachingProxy[ ORIGIN_KEY ] : this.settings.youtubeApi[ ORIGIN_KEY ];
		Object.keys( this.settings.youtubeApi ).forEach( ( /** @type {String} */ key ) =>
		{
			if ( key !== ORIGIN_KEY && typeof this.settings.youtubeApi[ key ] === 'string' ) {
				const pathname = this.settings.cachingProxy[ key ] ? this.settings.cachingProxy[ key ] : this.settings.youtubeApi[ key ];
				this.settings.youtubeApi[ key ] = new URL( pathname, origin );
				this.settings.youtubeApi[ key ].searchParams.set( 'key', this.youtubeApiKey );
			}
		} );
		if ( this.settings.cachingProxy.checkIfEmbeddableByServer && typeof this.settings.cachingProxy.checkIfEmbeddableByServer === 'string' ) {
			this.settings.cachingProxy.checkIfEmbeddableByServer = new URL( this.settings.cachingProxy.checkIfEmbeddableByServer, origin );
		}
	}

	useClientCachedResource ()
	{
		if ( this.settings.clientCacheFor && this.settings.clientCacheFor > 0 ) {
			const cacheTimestamp = localStorage.getItem( this.cacheNames.timestamp );
			if ( cacheTimestamp && Number( cacheTimestamp ) > Date.now() - this.settings.clientCacheFor * 1000 ) {
				return true;
			}
		}
		return false;
	}

	async fetchNewestVideo ()
	{
		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			const url = this.settings.youtubeApi.search;
			url.searchParams.set( 'channelId', this.channelId );
			url.searchParams.set( 'part', 'snippet,id' );
			url.searchParams.set( 'order', 'date' );
			const maxResults = this.settings.cachingProxy.checkIfEmbeddableByServer ? this.settings.nLastVideos : 1;
			url.searchParams.set( 'maxResults', maxResults );

			if ( this.useClientCachedResource() ) {
				this.youtubeData = JSON.parse( localStorage.getItem( this.cacheNames.data ) );
				resolve( true );
				return true;
			}

			fetch( url.href, {
				cache: 'no-cache'
			} ).then( ( /** @type {Response} */ response ) =>
			{
				if ( response.ok ) {
					return response.text();
				}
				return null;
			} ).then( ( /** @type {String} */ json ) =>
			{
				this.youtubeData = JSON.parse( json );
				if ( this.settings.clientCacheFor && this.settings.clientCacheFor > 0 ) {
					this.findEmbeddableVideo().then( () =>
					{
						localStorage.setItem( this.cacheNames.num, String( this.embeddableVideoNum ) );
						localStorage.setItem( this.cacheNames.timestamp, String( Date.now() ) );
						localStorage.setItem( this.cacheNames.data, JSON.stringify( this.youtubeData ) );
						resolve( true );
					} );
				} else {
					resolve( true );
				}
			} );
		} );
	}

	run ()
	{
		this.checkApiKey();
		this.constructApiUrls();
		this.fetchNewestVideo().then( () =>
		{
			this.checkReturnedData();
			this.makeRootElementSemantic();
			this.prepareVideoVirtualDom();
			this.showResult();
		} );

		return true;
	}
};

/**
* @private
* @module YoutubeWidgeticPrivate
* @classdesc Privátní část vlastního widgetu pro nejnovější Youtube video… s nastavením, to je důležité.
* @author ic < ic.czech@gmail.com >
* @see https://iiic.dev/youtube-widgetic
* @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
* @since Q2 2020
* @version 0.1
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
					title.appendChild( document.createTextNode( this.youtubeData.items[ 0 ].snippet.title ) );
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

					playLink.href = this.settings.youtubeVideoShortPrefix + this.youtubeData.items[ 0 ].id.videoId;
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

					const thumbs = this.youtubeData.items[ 0 ].snippet.thumbnails;

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
					img.alt = this.youtubeData.items[ 0 ].snippet.title;
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
					if ( el === 'FIGCAPTION' ) {
						const figcaption = document.createElement( el );
						figcaption.setAttribute( 'itemprop', 'description' );
						figcaption.appendChild( document.createTextNode( this.youtubeData.items[ 0 ].snippet.description ) );
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
					const apiTimeString = this.youtubeData.items[ 0 ].snippet.publishTime ? this.youtubeData.items[ 0 ].snippet.publishTime : this.youtubeData.items[ 0 ].snippet.publishedAt;
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

				link.href = this.settings.youtubeVideoShortPrefix + this.youtubeData.items[ 0 ].id.videoId;
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
* @version 0.1
*/
export class YoutubeWidgetic
{

	/**
	 * @private
	 * @description '#private' is not currently supported by Firefox, so that's why '_private'
	 */
	_private;


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
			this.settings = settings;
		}

		if ( this.settings.autoRun ) {
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

	set settings ( /** @type {Object} */ inObject )
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
		} ).catch( () =>
		{
			Object.assign( this._private.settings, inObject ); // single level assign
		} );
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
			throw 'Youtube API Key is missing, get yout own at https://developers.google.com/youtube/v3/getting-started';
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

	constructApiUrls ()
	{
		const ORIGIN_KEY = 'origin';
		Object.keys( this.settings.youtubeApi ).forEach( ( /** @type {String} */ key ) =>
		{
			if ( key !== ORIGIN_KEY && typeof this.settings.youtubeApi[ key ] === 'string' ) {
				this.settings.youtubeApi[ key ] = new URL( this.settings.youtubeApi[ key ], this.settings.youtubeApi[ ORIGIN_KEY ] );
				this.settings.youtubeApi[ key ].searchParams.set( 'key', this.youtubeApiKey );
			}
		} );
	}

	async fetchNewestVideo ()
	{
		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			const url = this.settings.youtubeApi.search;
			url.searchParams.set( 'channelId', this.channelId );
			url.searchParams.set( 'part', 'snippet,id' );
			url.searchParams.set( 'order', 'date' );
			url.searchParams.set( 'maxResults', 1 );
			fetch( url.href ).then( ( /** @type {Response} */ response ) =>
			{
				if ( response.ok ) {
					return response.text();
				}
				return null;
			} ).then( ( /** @type {String} */ json ) =>
			{
				this.youtubeData = JSON.parse( json );
				resolve( true );
			} )
		} );
	}

	run ()
	{
		this.checkApiKey();
		this.constructApiUrls();
		this.fetchNewestVideo().then( () =>
		{
			this.makeRootElementSemantic();
			this.prepareVideoVirtualDom();
			this.showResult();
		} );

		return true;
	}
};

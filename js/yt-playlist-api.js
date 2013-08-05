
/**
 * Instantiate Playlist
 *
 * @param string playlistId
 *    unique ID of playlist as assigned by youtube.
 *    As of August 5, 2013 the playlist ID could be found in URL
 *    http://www.youtube.com/watch?v=jeMqbjBMfP8&list=PLl_3zhp59iHxWSi_beXnRJFW-8F2sMfAd <- the last part, after &list is your playlist id
 * @param string wrapperId
 *    the id of an html element that will hold the playlist
 * @param string apiKey
 *    your unique API key from Google
 *    @see http://www.youtube.com/watch?v=jeMqbjBMfP8&list=PLl_3zhp59iHxWSi_beXnRJFW-8F2sMfAd
 * @param integer playerHeight
 *    height in pixels (don't include "px")
 * @param integer playerWidth
 *    width in pixels (don't include "px")
 */

function youTubePlaylist (playlistId, wrapperId, apiKey, playerHeight, playerWidth) {	
	this.playlistId   = playlistId;
	this.apiKey       = apiKey;
	this.wrapperId    = wrapperId;
	this.playerHeight = playerHeight;
	this.playerWidth  = playerWidth;
	this.playlist;
	this.playlistMenu;
	this.firstVideoId;
	this.videoDivId;
	this.customId;
}

youTubePlaylist.prototype.embedPlaylist = function() {

	// life saver: see http://stackoverflow.com/questions/5316697/jquery-return-data-after-ajax-call-success/5316805#5316805
	var getPlaylist = this.requestPlaylist(this.playlistId);
	var $super = this;
	// get a 'promise'
	getPlaylist.success(function(data) {
		$super.playlist = data;
		$super.firstVideoId = $super.playlist.items[0].snippet.resourceId.videoId;
		$super.playListMenu = $super.buildPlaylistMenu(this.playlist, this.wrapper);

		// get the wrapper
		var $mainWrap = $('#' + $super.wrapperId);

		// add class to wrapper
		$mainWrap.addClass('ytpe_playlist-wrapper')

		// add a div for the video
		var videoDiv = document.createElement('div');
		$super.videoDivId = $super.wrapperId + '_video-wrapper';
		videoDiv.setAttribute('id', $super.videoDivId);

		$mainWrap.prepend(videoDiv);
		
		// get a custom id for video, based on number of iframes
		// will base it on etag returned from youtube api
		var etag = data.etag.split('/');
		etag = $super.replaceAll('"', "", etag[1]);
		$super.customId = 'ytpe_embedded_player_' + etag;
		
		// add the first video to the wrapper
		$super.playVideo($super.firstVideoId, $super.customId, $super.videoDivId);
		$mainWrap.append($super.playListMenu);
		
		$super.listenToVideoItems();
	})	
}

youTubePlaylist.prototype.requestPlaylist = function() {
	// retrieve the playlist via google api
	$super = this;
	return $.ajax({
		url: 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=' + $super.playlistId + '&key=' + $super.apiKey,
		dataType: 'json',
		async: false,
		type: 'GET',
	})
}

youTubePlaylist.prototype.buildPlaylistMenu = function() {
	var items = this.playlist.items;
	var ul = this.themeSingleItem('ul', 
		{
			'classes' : [
				'ytpe_playlist-list',
			]
		}
	);
	for (var i = 0; i < items.length; i++) {
		ul.appendChild(this.getPlaylistMenuItem(items[i], this.wrapperId));
	}

	return ul;
}

youTubePlaylist.prototype.playVideo = function() {
	// params for swfObject
	var params = { allowScriptAccess: "always" };
	// attributes for swfObject
	var atts = { id: this.customId + "_video_wrapper" };
	var uri = 'http://www.youtube.com/v/' + this.firstVideoId + '?enablejsapi=1&playerapiid=ytplayer&version=3'
	swfobject.embedSWF(uri, this.videoDivId, this.playerWidth, this.playerHeight, "8", null, null, params, atts);
}

// called by youtube embed when video/playlist ready
youTubePlaylist.prototype.updateVideo = function(playerParent, newVideoId) {
	var findPlayer = $('#' + playerParent).find('object').attr('id');
	var player = document.getElementById(findPlayer);
	player.cueVideoById(newVideoId);
}

/**
 * prepare object to pass to theming function
 * 
 * @param json item
 */
youTubePlaylist.prototype.getPlaylistMenuItem = function(item, wrapper) {
	var options = {}, classes = [];
	classes.push('ytpe-playlist_list-item');
	// give first item the active class
	if (item.snippet.position == 0) {
		classes.push('ytpe-playlist_list-item_active-item');
	}
	//console.log(item);
	var videoId = item.snippet.resourceId.videoId;
	options = {
		'classes': classes,
		'data-video-id': item.snippet.resourceId.videoId,
		'data-player-parent': wrapper,
	};
	var li = this.themeSingleItem('li', options);
	var liElements = [];
	liElements.push(
		this.themeSingleItem('span', {
			'classes':
				[
					'ytpe-playlist_list-item_index',
				],
			'textNode': item.snippet.position+1, // increment playlist number so that doesn't start on 0
			}
		)
	);
	liElements.push(
		this.themeSingleItem('span', {
			'classes': 
				[
					'ytpe-playlist_list-item_thumbnail'
				],
			'appendChildren':
				[
					{
						'tag': 'img',
						'options' : {
							'src': item.snippet.thumbnails.default.url,
						}
					},
				]
			}
		)
	);
	liElements.push(
		this.themeSingleItem('span', {
			'classes':
				[
					'ytpe-playlist_list-item_title'
				],
			'textNode': item.snippet.title,
		})
	);

	for (var i = 0; i < liElements.length; i++) {
		li.appendChild(liElements[i]);
	}

	return li;
}

/**
 * Theme a single item as an html element
 */
youTubePlaylist.prototype.themeSingleItem = function(tag, options) {
		
	// add the element to dom
	var el = document.createElement(tag);
				
	// go through each of the options
	for (var key in options) {
		// double check that this property belongs 
		//   to our options
		if (options.hasOwnProperty(key)) {
			if (key == 'classes') {
				var stringClasses = options.classes.join(' ');
				el.setAttribute('class', stringClasses);
			}
			else if (key == 'appendChildren') {
				for (var i = 0; i < options.appendChildren.length; i++) {
					el.appendChild(this.themeSingleItem(options.appendChildren[i].tag, options.appendChildren[i].options));
				}
			}
			else if (key == 'textNode') {
				el.appendChild(document.createTextNode(options[key]));
			}
			// go through all other options
			else {
				el.setAttribute(key, options[key]);
			}
		}
	}


	return el;
}

youTubePlaylist.prototype.listenToVideoItems = function() {
	$super = this;
	//$('.ytpe-playlist_list-item').not('.ytpe-playlist_list-item_active-item').click(
	$('.ytpe-playlist_list-item').click(
		function(event) {
			var $this = $(this);
			var playerParent = $(this).attr('data-player-parent');
			var videoId = $(this).attr('data-video-id');
			$super.updateVideo(playerParent, videoId);
			$super.updateListItemActiveItem($this);
			return false;
		}
	);
}

youTubePlaylist.prototype.updateListItemActiveItem = function(newActiveItem) {
	var activeClass = 'ytpe-playlist_list-item_active-item';
	
	// unset the active item
	newActiveItem.parents('.ytpe_playlist-list')
					.find('.' + activeClass)
					.removeClass(activeClass);
	// add active class to current item
	newActiveItem.addClass(activeClass);
}

// from http://stackoverflow.com/a/1144788/1108292
youTubePlaylist.prototype.replaceAll = function(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}
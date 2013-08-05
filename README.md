yt-playlist-api
===============

Customize youtube playlist for display on page
@author Chris Rockwell; chris@chrisrockwell.com

Instructions:::

1. Get your Google API Key (https://developers.google.com/youtube/registering_an_application)
2. Include yt-playlist-api.js and yt-theme.css (optional)
3. Create an element for each playlist you wish to include, at the location you wish it to be included
	<div id="myplaylist"></div>
4. Instantiate a new playlist:
	var p1 = new youTubePlaylist(playlistId, wrapperId, apiKey, playerHeight, playerWidth)
	p1.embedPlaylist();

Requirements:::

- This first working concept requires swfObject (https://code.google.com/p/swfobject/); I'm not sure if I'll change that
- jQuery (http://jquery.com/)

Optional:::
- The example includes jScrollPane (http://jscrollpane.kelvinluck.com/) to prettify the scroll bars

@TODO
- Port to Drupal module
- Port to jQuery plugin?
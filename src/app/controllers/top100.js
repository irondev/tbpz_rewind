(function() {

	app.controller('Top100Ctrl', function($scope, $rootScope, $filter, $location, $window, $document, $timeout, $interval, $q, $datas, $imageCache) {

		var startTime = new Date();
		var promiseInfos = $datas.getInfos();
		var promiseAlbums = $datas.getAlbums();
		$q.all([promiseInfos, promiseAlbums]).then(function(datas) {
			$scope.infos = datas[0];console.log($scope.infos);
			$scope.albums = datas[1];console.log($scope.albums);
			var imageToPreload = [];
			imageToPreload.push($scope.infos.meta.coverimage.url);
			/*for (var i = 0; i < $scope.albums.length; i++) {
				imageToPreload.push($scope.albums[i].meta.albumcover.url);
			}*/
			$imageCache.Cache(imageToPreload).then(function() {
				var now = new Date();
				var loadingTime = now - startTime;
				if (loadingTime < config.loaderMinTime) {
					$timeout(function() {
						$scope.appReady = true;
					}, (config.loaderMinTime - loadingTime));
				} else {
					$scope.appReady = true;
				}
			});
		}, function(r) {
			console.error(r);
		});

		$scope.groupBy = 'meta.albumrankcat';
		$scope.groupOrderBy = '-meta.albumrankcat';
		$scope.setFilter = function(filter, $event) {
			$location.path('/filter/'+ filter);
			jQuery("html, body").animate({scrollTop: jQuery($event.target).offset().top - 75}, 'slow');
			$scope.groupBy = 'meta.' + filter;
			$scope.groupOrderBy = ($scope.groupBy == 'meta.albumrankcat') ? '-meta.albumrankcat' : $scope.groupBy;
		};

		$scope.openAlbum = function(albumObj) {
			$location.path('/album/'+ albumObj.slug);
			$scope.openedAlbum = albumObj;
		};

		$scope.openLoadedAlbum = function() {
			$location.path('/album/'+ $scope.loadedAlbum.slug);
			jQuery("html, body").animate({scrollTop: jQuery("#"+ $scope.loadedAlbum.slug).offset().top - 75}, 'slow');
			$scope.openedAlbum = $scope.loadedAlbum;
		};

		$scope.loadAlbumSample = function(albumObj) {
			if (!$scope.loadedAlbum && !albumObj) {
				var albumObj = jQuery(".js-album:first").data("album");
			}
			if ($scope.loadedAlbum && $scope.loadedAlbum.slug == albumObj.slug) {
				playerPlay();
			} else {
				$scope.isLoading = $scope.loadedAlbum = $scope.openedAlbum = albumObj;
				playerLoadId(albumObj.meta.albumextract);				
			}
		};

		$scope.nextAlbumSample = function() {
			var index = ($scope.loadedAlbum) ? jQuery("#"+ $scope.loadedAlbum.slug).index(".js-album") : 0;
			var $nextAlbum = jQuery(".js-album:eq("+ (index + 1) +")");
			if ($nextAlbum.length) {
				var albumObj = $nextAlbum.data("album");
				$scope.isLoading = $scope.loadedAlbum = $scope.openedAlbum = albumObj;
				playerLoadId(albumObj.meta.albumextract);
			} else {
				$scope.loadedAlbum = null;
				$scope.unsetProgressBar();
			}
		};

		$scope.pauseAlbumSample = function() {
			playerPause();
		};

		$scope.setProgressBar = function() {
		    playerTimer = $interval(function() {
		        var duration = playerGetDuration();
		        var currentTime = playerGetCurrentTime();
		        $scope.playerProgression = currentTime * 100 / duration;
		    }, 1000);
		};

		$scope.unsetProgressBar = function() {
		    $interval.cancel(playerTimer);
		    $scope.playerProgression = 0;
		};

		$scope.clickOnProgressBar = function($event) {
		    var clicPosition = $event.pageX;
		    var $element = jQuery($event.currentTarget);
		    var elementPosition = $element.offset().left;
		    var elementSize = $element.width();
		    var clicRelativePosition = clicPosition - elementPosition;
		    var percentage = Math.round(clicRelativePosition * 100 / elementSize);
		    playerSeekTo(percentage);
		};

	});

})();
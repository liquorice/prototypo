'use strict';

angular.module('prototyp0.fontLoader', ['ngResource'])
	.factory( 'Font', function( $resource ) {

		return $resource( '/fonts/:font/font.json', {}, {
			get: { method:'GET', params: {font: 'default'} }
		});
	})

	.factory( 'Glyph', function( $resource ) {

		return $resource( '/fonts/:font/glyphs/:glyph', {}, {
			get: { method:'GET', params: {font: 'default'} }
		});
	})

	.factory( 'Component', function( $resource ) {

		return $resource( '/fonts/:font/components/:component', {}, {
			get: { method:'GET', params: {font: 'default'} }
		});
	})

	.factory( 'Controls', function( $resource ) {

		return $resource( '/fonts/:font/controls/controls.json', {}, {
			get: { method:'GET', params: {font: 'default'} }
		});
	})

	.factory('loadFont', function( _, $q, $parse, Font, Glyph, Component, Controls ) {
		return function( fontName ) {
			var font;

			return Font.get({font: fontName})
				.$then(function( response ) {
					font = response.data;
					var promises = [],
						components = font.components;

					if ( !font.glyphs ) {
						font.glyphs = {};
						_( font.order ).each(function( glyphCode ) {
							promises.push(
								Glyph.get({ font: fontName, glyph: glyphCode + '.json' })
									.$then(function( response ) {
										font.glyphs[ glyphCode ] = response.data;
									})
							);
						});
					}

					if ( components.constructor === Array ) {
						font.components = {};
						_( components ).each(function( componentName ) {
							promises.push(
								Component.get({ font: fontName, component: componentName + '.json' })
									.$then(function( response ) {
										font.components[ componentName ] = response.data;
									})
							);
						});
					}

					if ( !font.controls ) {
						promises.push(
							Controls.get({font: fontName })
								.$then(function( response ) {
									font.controls = response.data.controls;

									_( font.controls ).each(function( control ) {
										if ( control.onchange ) {
											control.onchange = $parse( control.onchange );
										}
									});
								})
						);
					}

					return $q.all( promises );

				}).then(function() {
					return font;
				});
		};
	});